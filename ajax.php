<?php
/**
 * AJAX handler for mod_productexplainer.
 *
 * Actions:
 *   extract_document      - extract text from uploaded PDF/DOCX via server
 *   generate_slides       - call server AI to generate product slides manifest
 *   generate_concept      - call server AI to generate 7-slide concept explainer manifest
 *   generate_concept_image - generate one AI image for a concept slide, store in Moodle file area
 *   save_manifest         - persist manifest JSON to DB
 *   upload_image          - store uploaded slide image in Moodle file area, return URL
 *   generate_voiceover    - generate TTS for a single slide, return audio URL
 *   get_manifest          - return current manifest JSON for the activity
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
header('Content-Type: application/json; charset=utf-8');
@ini_set('display_errors', '0');

try {
    require_once(__DIR__ . '/../../config.php');
    require_once($CFG->libdir . '/filelib.php');

    $aiconfiglib = $CFG->dirroot . '/local/aiconfig/lib.php';
    if (file_exists($aiconfiglib)) {
        require_once($aiconfiglib);
    }

    $sesskey = optional_param('sesskey', '', PARAM_RAW);
    if (!confirm_sesskey($sesskey)) {
        echo json_encode(['success' => false, 'error' => 'Session expired. Please refresh the page.']);
        exit;
    }

    if (!isloggedin() || isguestuser()) {
        echo json_encode(['success' => false, 'error' => 'Please log in.']);
        exit;
    }

    $action = optional_param('action', '', PARAM_ALPHANUMEXT);
    $cmid   = optional_param('cmid', 0, PARAM_INT);

    if (empty($action)) {
        echo json_encode(['success' => false, 'error' => 'Missing action.']);
        exit;
    }

    // Credentials via local_aiconfig or plugin settings.
    if (function_exists('local_aiconfig_get_siteid')) {
        $siteid = local_aiconfig_get_siteid('mod_productexplainer');
    } else {
        $siteid = trim(get_config('local_aiconfig', 'siteid') ?? get_config('mod_productexplainer', 'siteid') ?? '');
    }
    if (function_exists('local_aiconfig_get_apikey')) {
        $apikey = local_aiconfig_get_apikey('mod_productexplainer');
    } else {
        $apikey = trim(get_config('local_aiconfig', 'apikey') ?? get_config('mod_productexplainer', 'apikey') ?? '');
    }

    $apibaseurl = rtrim(get_config('local_aiconfig', 'serverurl') ?: 'https://lms-labs.com', '/');

    // Validate cm/instance for actions that need it.
    $needsCm = in_array($action, [
        'generate_slides', 'generate_concept', 'generate_concept_image',
        'save_manifest', 'upload_image', 'generate_voiceover', 'generate_quiz_tts', 'get_manifest',
        'save_quiz_score', 'save_attempt', 'get_report_data'
    ]);
    $cm = null;
    $context = null;
    $pe = null;
    if ($needsCm) {
        if (empty($cmid)) {
            echo json_encode(['success' => false, 'error' => 'Missing cmid.']);
            exit;
        }
        $cm = get_coursemodule_from_id('productexplainer', $cmid, 0, false, MUST_EXIST);
        $context = context_module::instance($cm->id);
        $pe = $DB->get_record('productexplainer', ['id' => $cm->instance], '*', MUST_EXIST);

        // Require manage capability for write actions.
        $writeActions = ['generate_slides', 'generate_concept', 'generate_concept_image', 'save_manifest', 'upload_image', 'generate_voiceover'];
        if (in_array($action, $writeActions)) {
            if (!has_capability('mod/productexplainer:manage', $context)
                && !has_capability('moodle/course:manageactivities', $context)) {
                echo json_encode(['success' => false, 'error' => 'Permission denied.']);
                exit;
            }
        } else {
            require_capability('mod/productexplainer:view', $context);
        }
    }

    // -----------------------------------------------------------------------
    // Helper: make a cURL call to lms-labs.com
    // -----------------------------------------------------------------------
    function pe_api_call($url, $payload) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT        => 180,
            CURLOPT_CONNECTTIMEOUT => 30,
        ]);
        $raw  = curl_exec($ch);
        $err  = curl_error($ch);
        curl_close($ch);
        if ($raw === false) {
            return ['success' => false, 'error' => 'API connection failed: ' . $err];
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : ['success' => false, 'error' => 'Invalid API response'];
    }

    // -----------------------------------------------------------------------
    // Release session lock BEFORE any long-running AI API calls.
    // -----------------------------------------------------------------------
    \core\session\manager::write_close();

    // -----------------------------------------------------------------------
    // ACTION: extract_document
    // -----------------------------------------------------------------------
    if ($action === 'extract_document') {
        $rawInput  = file_get_contents('php://input');
        $body      = json_decode($rawInput, true);
        $b64       = $body['fileContent'] ?? '';
        $filename  = $body['filename'] ?? 'document.pdf';
        $mimetype  = $body['mimeType'] ?? 'application/pdf';

        if (empty($b64)) {
            echo json_encode(['success' => false, 'error' => 'No file content provided.']);
            exit;
        }

        $result = pe_api_call($apibaseurl . '/api/moodle/product-explainer/extract-document', [
            'siteId'      => $siteid,
            'apiKey'      => $apikey,
            'fileContent' => $b64,
            'filename'    => $filename,
            'mimeType'    => $mimetype,
        ]);

        echo json_encode($result);
        exit;
    }

    // -----------------------------------------------------------------------
    // ACTION: generate_slides (product explainer)
    // -----------------------------------------------------------------------
    if ($action === 'generate_slides') {
        $rawInput    = file_get_contents('php://input');
        $body        = json_decode($rawInput, true);
        $productName = trim($body['productName'] ?? '');
        $docContent  = trim($body['documentContent'] ?? '');
        $slideCount  = (int)($body['slideCount'] ?? 6);
        if ($slideCount < 3)  $slideCount = 3;
        if ($slideCount > 20) $slideCount = 20;
        $creditsToUse = max(1, (int)floor($slideCount * 5 / 3));

        if (empty($productName)) {
            echo json_encode(['success' => false, 'error' => 'Product name is required.']);
            exit;
        }

        // Accept voiceLanguage from the request body (sent by product builder language selector).
        // If provided, override the DB value and persist it so voiceover generation uses the same language.
        $requestedLang = trim($body['voiceLanguage'] ?? '');
        if ($requestedLang !== '') {
            $pe->voicelanguage = $requestedLang;
            $DB->set_field('productexplainer', 'voicelanguage', $requestedLang, ['id' => $pe->id]);
        }
        $productVoiceLanguage = $pe->voicelanguage ?: 'en-AU';

        $result = pe_api_call($apibaseurl . '/api/moodle/product-explainer/generate', [
            'siteId'          => $siteid,
            'apiKey'          => $apikey,
            'productName'     => $productName,
            'documentContent' => $docContent,
            'slideCount'      => $slideCount,
            'creditsToUse'    => $creditsToUse,
            'voiceLanguage'   => $productVoiceLanguage,
        ]);

        echo json_encode($result);
        exit;
    }

    // -----------------------------------------------------------------------
    // ACTION: generate_concept (concept explainer — 7 fixed slides)
    // -----------------------------------------------------------------------
    if ($action === 'generate_concept') {
        $rawInput        = file_get_contents('php://input');
        $body            = json_decode($rawInput, true);
        $conceptName     = trim($body['conceptName'] ?? '');
        $conceptContext  = trim($body['context'] ?? '');
        $learnerRole     = trim($body['learnerRole'] ?? '');
        $objective       = trim($body['learningObjective'] ?? '');
        $ownContent      = trim($body['ownContent'] ?? '');

        if (empty($conceptName)) {
            echo json_encode(['success' => false, 'error' => 'Concept name is required.']);
            exit;
        }

        // Accept voiceLanguage from the request body (sent by concept builder language selector).
        // If provided, override the DB value and persist it so voiceover generation uses the same language.
        $requestedLang = trim($body['voiceLanguage'] ?? '');
        if ($requestedLang !== '') {
            $pe->voicelanguage = $requestedLang;
            $DB->set_field('productexplainer', 'voicelanguage', $requestedLang, ['id' => $pe->id]);
        }
        $conceptVoiceLanguage = $pe->voicelanguage ?: 'en-AU';

        $result = pe_api_call($apibaseurl . '/api/moodle/concept-explainer/generate', [
            'siteId'           => $siteid,
            'apiKey'           => $apikey,
            'conceptName'      => $conceptName,
            'context'          => $conceptContext,
            'learnerRole'      => $learnerRole,
            'learningObjective' => $objective,
            'ownContent'       => $ownContent,
            'creditsToUse'     => 10,
            'voiceLanguage'    => $conceptVoiceLanguage,
        ]);

        echo json_encode($result);
        exit;
    }

    // -----------------------------------------------------------------------
    // ACTION: generate_concept_image — generate one AI image, store in Moodle
    // -----------------------------------------------------------------------
    if ($action === 'generate_concept_image') {
        $rawInput    = file_get_contents('php://input');
        $body        = json_decode($rawInput, true);
        $slideIndex  = (int)($body['slideIndex'] ?? 0);
        $imagePrompt = trim($body['imagePrompt'] ?? '');

        if (empty($imagePrompt)) {
            echo json_encode(['success' => false, 'error' => 'Image prompt is required.']);
            exit;
        }

        $result = pe_api_call($apibaseurl . '/api/moodle/concept-explainer/generate-image', [
            'siteId'        => $siteid,
            'apiKey'        => $apikey,
            'imagePrompt'   => $imagePrompt,
            'slideIndex'    => $slideIndex,
            'creditsToUse'  => 2,
            'voiceLanguage' => $pe->voicelanguage ?: 'en-AU',
            'context'       => $body['context'] ?? '',
        ]);

        if (empty($result['success']) || empty($result['imageData'])) {
            echo json_encode(['success' => false, 'error' => $result['error'] ?? 'Image generation failed.']);
            exit;
        }

        // Strip data URL prefix (data:image/jpeg;base64,...) if present — the server
        // returns data URLs from optimizeImageBuffer, not raw base64.
        $rawImageData = $result['imageData'];
        if (preg_match('/^data:[^;]+;base64,/', $rawImageData)) {
            $rawImageData = preg_replace('/^data:[^;]+;base64,/', '', $rawImageData);
        }

        // Store image bytes in Moodle file area (same filearea as uploaded images).
        $imageBytes    = base64_decode($rawImageData);
        $imageFilename = 'slide_' . $slideIndex . '.jpg';
        $fs = get_file_storage();

        // Delete any existing files for this slide index across all extensions.
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        foreach ($allowed as $ext) {
            $existing = $fs->get_file($context->id, 'mod_productexplainer', 'slideimages', $pe->id, '/', 'slide_' . $slideIndex . '.' . $ext);
            if ($existing) {
                $existing->delete();
            }
        }

        $fileRecord = [
            'contextid' => $context->id,
            'component' => 'mod_productexplainer',
            'filearea'  => 'slideimages',
            'itemid'    => $pe->id,
            'filepath'  => '/',
            'filename'  => $imageFilename,
        ];
        $fs->create_file_from_string($fileRecord, $imageBytes);

        $url = moodle_url::make_pluginfile_url(
            $context->id, 'mod_productexplainer', 'slideimages', $pe->id, '/', $imageFilename
        );

        echo json_encode([
            'success'    => true,
            'imageUrl'   => $url->out(false),
            'slideIndex' => $slideIndex,
        ]);
        exit;
    }

    // -----------------------------------------------------------------------
    // ACTION: save_manifest
    // -----------------------------------------------------------------------
    if ($action === 'save_manifest') {
        $rawInput = file_get_contents('php://input');
        $body     = json_decode($rawInput, true);
        $manifest = $body['manifest'] ?? null;

        if (!is_array($manifest)) {
            echo json_encode(['success' => false, 'error' => 'Invalid manifest.']);
            exit;
        }

        $json      = json_encode($manifest);
        $compressed = base64_encode(gzencode($json, 6));
        $toStore   = 'gz:' . $compressed;

        $DB->set_field('productexplainer', 'manifestjson', $toStore, ['id' => $pe->id]);
        $DB->set_field('productexplainer', 'timemodified', time(), ['id' => $pe->id]);

        echo json_encode(['success' => true]);
        exit;
    }

    // -----------------------------------------------------------------------
    // ACTION: get_manifest
    // -----------------------------------------------------------------------
    if ($action === 'get_manifest') {
        $raw = $pe->manifestjson ?? '';
        if (empty($raw)) {
            echo json_encode(['success' => true, 'manifest' => null]);
            exit;
        }
        if (strncmp($raw, 'gz:', 3) === 0) {
            $raw = gzdecode(base64_decode(substr($raw, 3)));
        }
        $decoded = json_decode($raw, true);
        echo json_encode(['success' => true, 'manifest' => $decoded]);
        exit;
    }

    // -----------------------------------------------------------------------
    // ACTION: upload_image
    // -----------------------------------------------------------------------
    if ($action === 'upload_image') {
        $slideIndex = optional_param('slide_index', 0, PARAM_INT);

        if (empty($_FILES['imagefile']['tmp_name'])) {
            echo json_encode(['success' => false, 'error' => 'No image file uploaded.']);
            exit;
        }

        $tmpFile  = $_FILES['imagefile']['tmp_name'];
        $origName = clean_filename($_FILES['imagefile']['name']);
        $ext      = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
        $allowed  = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($ext, $allowed)) {
            echo json_encode(['success' => false, 'error' => 'Unsupported image format. Use JPG, PNG, GIF or WebP.']);
            exit;
        }

        $filename = 'slide_' . $slideIndex . '.' . $ext;
        $fs = get_file_storage();

        foreach ($allowed as $ext2) {
            $f2 = $fs->get_file($context->id, 'mod_productexplainer', 'slideimages', $pe->id, '/', 'slide_' . $slideIndex . '.' . $ext2);
            if ($f2) $f2->delete();
        }

        $fileRecord = [
            'contextid' => $context->id,
            'component' => 'mod_productexplainer',
            'filearea'  => 'slideimages',
            'itemid'    => $pe->id,
            'filepath'  => '/',
            'filename'  => $filename,
        ];
        $storedFile = $fs->create_file_from_pathname($fileRecord, $tmpFile);

        $url = moodle_url::make_pluginfile_url(
            $context->id, 'mod_productexplainer', 'slideimages', $pe->id, '/', $filename
        );

        echo json_encode(['success' => true, 'imageUrl' => $url->out(false), 'filename' => $filename]);
        exit;
    }

    // -----------------------------------------------------------------------
    // ACTION: generate_voiceover
    // -----------------------------------------------------------------------
    if ($action === 'generate_voiceover') {
        $rawInput   = file_get_contents('php://input');
        $body       = json_decode($rawInput, true);
        $slideIndex = (int)($body['slideIndex'] ?? 0);
        $text       = trim($body['text'] ?? '');
        $language   = $body['language'] ?? ($pe->voicelanguage ?: 'en-AU');
        $voiceName  = $body['voice'] ?? ($pe->voicestyle ?: 'Zephyr');

        if (empty($text)) {
            echo json_encode(['success' => false, 'error' => 'No voiceover text provided.']);
            exit;
        }

        $langParts = explode('-', $language);
        $langCode  = $langParts[0] ?? 'en';
        $region    = $langParts[1] ?? 'AU';
        $voiceId   = $langCode . '-' . $region . '-Chirp3-HD-' . $voiceName;

        $result = pe_api_call($apibaseurl . '/api/moodle/content-creator/tts', [
            'siteId'      => $siteid,
            'apiKey'      => $apikey,
            'text'        => $text,
            'languageCode' => $language,
            'voiceId'     => $voiceId,
            'voiceGender' => $voiceName,
            'creditsToUse' => 3,
        ]);

        if (empty($result['success']) || empty($result['audioContent'])) {
            echo json_encode(['success' => false, 'error' => $result['error'] ?? 'TTS generation failed.']);
            exit;
        }

        $audioBytes = base64_decode($result['audioContent']);
        $audioFilename = 'slide_' . $slideIndex . '.ogg';
        $fs = get_file_storage();

        $existing = $fs->get_file($context->id, 'mod_productexplainer', 'slidevoiceovers', $pe->id, '/', $audioFilename);
        if ($existing) $existing->delete();

        $fileRecord = [
            'contextid' => $context->id,
            'component' => 'mod_productexplainer',
            'filearea'  => 'slidevoiceovers',
            'itemid'    => $pe->id,
            'filepath'  => '/',
            'filename'  => $audioFilename,
        ];
        $fs->create_file_from_string($fileRecord, $audioBytes);

        $audioUrl = moodle_url::make_pluginfile_url(
            $context->id, 'mod_productexplainer', 'slidevoiceovers', $pe->id, '/', $audioFilename
        );

        echo json_encode(['success' => true, 'audioUrl' => $audioUrl->out(false), 'slideIndex' => $slideIndex]);
        exit;
    }

    // -----------------------------------------------------------------------
    // ACTION: generate_quiz_tts
    // On-demand Chirp HD TTS for quiz questions and feedback.
    // Accessible by students (view capability only — no file write, returns
    // base64 audio content directly so no Moodle file storage is needed).
    // -----------------------------------------------------------------------
    if ($action === 'generate_quiz_tts') {
        \core\session\manager::write_close();
        $rawInput  = file_get_contents('php://input');
        $body      = json_decode($rawInput, true);
        $text      = trim($body['text'] ?? '');
        $language  = $body['language'] ?? ($pe->voicelanguage ?: 'en-AU');
        $voiceName = $body['voice']    ?? ($pe->voicestyle   ?: 'Zephyr');

        if (empty($text)) {
            echo json_encode(['success' => false, 'error' => 'No text provided.']);
            exit;
        }

        $langParts = explode('-', $language);
        $langCode  = $langParts[0] ?? 'en';
        $region    = $langParts[1] ?? 'AU';
        $voiceId   = $langCode . '-' . $region . '-Chirp3-HD-' . $voiceName;

        $result = pe_api_call($apibaseurl . '/api/moodle/content-creator/tts', [
            'siteId'       => $siteid,
            'apiKey'       => $apikey,
            'text'         => $text,
            'languageCode' => $language,
            'voiceId'      => $voiceId,
            'voiceGender'  => $voiceName,
            'creditsToUse' => 1,
        ]);

        if (empty($result['success']) || empty($result['audioContent'])) {
            echo json_encode(['success' => false, 'error' => $result['error'] ?? 'TTS generation failed.']);
            exit;
        }

        echo json_encode(['success' => true, 'audioContent' => $result['audioContent']]);
        exit;
    }

    // -----------------------------------------------------------------------
    // ACTION: save_quiz_score  (legacy — kept for backward compatibility)
    // -----------------------------------------------------------------------
    if ($action === 'save_quiz_score') {
        global $USER;
        $rawInput = file_get_contents('php://input');
        $body     = json_decode($rawInput, true);
        $score    = isset($body['score']) ? (int)$body['score'] : -1;

        if ($score < 0 || $score > 100) {
            echo json_encode(['success' => false, 'error' => 'Invalid score.']);
            exit;
        }

        require_once($CFG->dirroot . '/lib/completionlib.php');

        $attempt = new stdClass();
        $attempt->productexplainerid = $pe->id;
        $attempt->userid             = $USER->id;
        $attempt->score              = $score;
        $attempt->timecreated        = time();
        $DB->insert_record('productexplainer_attempts', $attempt);

        if (!empty($pe->completionquiz)) {
            $course = $DB->get_record('course', ['id' => $cm->course], '*', MUST_EXIST);
            $completion = new completion_info($course);
            if ($completion->is_enabled($cm) == COMPLETION_TRACKING_AUTOMATIC) {
                $completion->update_state($cm, COMPLETION_COMPLETE, $USER->id);
            }
        }

        echo json_encode(['success' => true]);
        exit;
    }

    // -----------------------------------------------------------------------
    // ACTION: save_attempt  (v1.0.29+ rich analytics payload — student-facing)
    // -----------------------------------------------------------------------
    if ($action === 'save_attempt') {
        global $USER;
        $rawInput   = file_get_contents('php://input');
        $body       = json_decode($rawInput, true);
        $score      = isset($body['score'])         ? (int)$body['score']         : -1;
        $timetaken  = isset($body['timetaken'])     ? (int)$body['timetaken']     : 0;
        $route      = isset($body['route'])         ? clean_param($body['route'],  PARAM_ALPHANUMEXT) : 'product';
        $slidecount = isset($body['slidecount'])    ? (int)$body['slidecount']    : 0;
        $qcount     = isset($body['questioncount']) ? (int)$body['questioncount'] : 0;
        $slidetimes = isset($body['slidetimes'])  && is_array($body['slidetimes'])  ? $body['slidetimes']  : [];
        $answers    = isset($body['answers'])     && is_array($body['answers'])     ? $body['answers']     : [];

        if ($score < 0 || $score > 100) {
            echo json_encode(['success' => false, 'error' => 'Invalid score.']);
            exit;
        }

        require_once($CFG->dirroot . '/lib/completionlib.php');

        // Insert attempt record.
        $attempt = new stdClass();
        $attempt->productexplainerid = $pe->id;
        $attempt->userid             = $USER->id;
        $attempt->score              = $score;
        $attempt->timetaken          = max(0, $timetaken);
        $attempt->route              = substr($route, 0, 10);
        $attempt->slidecount         = max(0, $slidecount);
        $attempt->questioncount      = max(0, $qcount);
        $attempt->timecreated        = time();
        $attemptId = $DB->insert_record('productexplainer_attempts', $attempt);

        // Insert slide time records (guard: new table may not exist on old installs mid-upgrade).
        if ($DB->get_manager()->table_exists('productexplainer_slidetimes')) {
            foreach ($slidetimes as $st) {
                if (!is_array($st)) continue;
                $rec = new stdClass();
                $rec->attemptid  = $attemptId;
                $rec->slideidx   = isset($st['idx'])   ? (int)$st['idx']   : 0;
                $rec->slidetype  = isset($st['type'])  ? clean_param($st['type'],  PARAM_TEXT) : '';
                $rec->slidetitle = isset($st['title']) ? clean_param(substr($st['title'], 0, 255), PARAM_TEXT) : '';
                $rec->timesecs   = isset($st['secs'])  ? max(0, (int)$st['secs']) : 0;
                $DB->insert_record('productexplainer_slidetimes', $rec, false);
            }
        }

        // Insert answer records.
        if ($DB->get_manager()->table_exists('productexplainer_answers')) {
            foreach ($answers as $ans) {
                if (!is_array($ans)) continue;
                $rec = new stdClass();
                $rec->attemptid   = $attemptId;
                $rec->qidx        = isset($ans['qidx'])        ? (int)$ans['qidx']        : 0;
                $rec->qtext       = isset($ans['qtext'])        ? substr(clean_param($ans['qtext'], PARAM_TEXT), 0, 255) : '';
                $rec->selectedidx = isset($ans['selectedidx'])  ? (int)$ans['selectedidx'] : 0;
                $rec->correctidx  = isset($ans['correctidx'])   ? (int)$ans['correctidx']  : 0;
                $rec->iscorrect   = !empty($ans['iscorrect'])    ? 1 : 0;
                $DB->insert_record('productexplainer_answers', $rec, false);
            }
        }

        // Handle activity completion.
        if (!empty($pe->completionquiz)) {
            $course = $DB->get_record('course', ['id' => $cm->course], '*', MUST_EXIST);
            $completion = new completion_info($course);
            if ($completion->is_enabled($cm) == COMPLETION_TRACKING_AUTOMATIC) {
                $completion->update_state($cm, COMPLETION_COMPLETE, $USER->id);
            }
        }

        echo json_encode(['success' => true, 'attemptid' => (int)$attemptId]);
        exit;
    }

    // -----------------------------------------------------------------------
    // ACTION: get_report_data  (teacher-facing — requires manage capability)
    // -----------------------------------------------------------------------
    if ($action === 'get_report_data') {
        if (!has_capability('mod/productexplainer:manage', $context) && !has_capability('moodle/course:manageactivities', $context)) {
            echo json_encode(['success' => false, 'error' => 'Permission denied.']);
            exit;
        }

        $sql = "SELECT a.*, u.firstname, u.lastname
                FROM {productexplainer_attempts} a
                JOIN {user} u ON u.id = a.userid
                WHERE a.productexplainerid = :peid
                ORDER BY a.timecreated ASC";
        $attemptsRaw = $DB->get_records_sql($sql, ['peid' => $pe->id]);

        $hasSlideTimes = $DB->get_manager()->table_exists('productexplainer_slidetimes');
        $hasAnswers    = $DB->get_manager()->table_exists('productexplainer_answers');

        $attempts = [];
        foreach ($attemptsRaw as $att) {
            $slidetimes = [];
            if ($hasSlideTimes) {
                foreach ($DB->get_records('productexplainer_slidetimes', ['attemptid' => $att->id], 'slideidx ASC') as $st) {
                    $slidetimes[] = [
                        'slideidx'   => (int)$st->slideidx,
                        'slidetype'  => (string)$st->slidetype,
                        'slidetitle' => (string)$st->slidetitle,
                        'timesecs'   => (int)$st->timesecs,
                    ];
                }
            }
            $answers = [];
            if ($hasAnswers) {
                foreach ($DB->get_records('productexplainer_answers', ['attemptid' => $att->id], 'qidx ASC') as $ans) {
                    $answers[] = [
                        'qidx'        => (int)$ans->qidx,
                        'qtext'       => (string)$ans->qtext,
                        'selectedidx' => (int)$ans->selectedidx,
                        'correctidx'  => (int)$ans->correctidx,
                        'iscorrect'   => (int)$ans->iscorrect,
                    ];
                }
            }
            $attempts[] = [
                'id'            => (int)$att->id,
                'userid'        => (int)$att->userid,
                'firstname'     => (string)$att->firstname,
                'lastname'      => (string)$att->lastname,
                'score'         => (int)$att->score,
                'timetaken'     => isset($att->timetaken)     ? (int)$att->timetaken     : 0,
                'route'         => isset($att->route)         ? (string)$att->route      : 'product',
                'slidecount'    => isset($att->slidecount)    ? (int)$att->slidecount    : 0,
                'questioncount' => isset($att->questioncount) ? (int)$att->questioncount : 0,
                'timecreated'   => (int)$att->timecreated,
                'slidetimes'    => $slidetimes,
                'answers'       => $answers,
            ];
        }

        echo json_encode(['success' => true, 'attempts' => $attempts]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Unknown action: ' . $action]);
    exit;

} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
    exit;
}
