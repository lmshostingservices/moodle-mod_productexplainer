<?php
/**
 * Product Explainer - View page.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require('../../config.php');

$id       = required_param('id', PARAM_INT);
$editmode = optional_param('edit', 0, PARAM_INT);

$cm = get_coursemodule_from_id('productexplainer', $id, 0, false, MUST_EXIST);
$course = $DB->get_record('course', ['id' => $cm->course], '*', MUST_EXIST);
$pe = $DB->get_record('productexplainer', ['id' => $cm->instance], '*', MUST_EXIST);
global $USER, $SITE;

require_login($course, true, $cm);
$context = context_module::instance($cm->id);
// Only enforce view capability if it is registered in the Moodle DB.
// If the capability record is missing (plugin installed before access.php
// was processed / upgrade not yet run), get_capability_info() returns null
// and we skip the hard block rather than locking out all users including admin.
if (get_capability_info('mod/productexplainer:view')) {
    require_capability('mod/productexplainer:view', $context);
}

$PAGE->set_url('/mod/productexplainer/view.php', ['id' => $id]);
$PAGE->set_title(format_string($pe->name));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($context);

// Determine if we have generated content (manifest is locked).
$hasManifest = false;
$manifestData = null;
if (!empty($pe->manifestjson)) {
    $raw = $pe->manifestjson;
    // Support gz: prefix compression (same as contentcreator).
    if (strncmp($raw, 'gz:', 3) === 0) {
        $raw = gzdecode(base64_decode(substr($raw, 3)));
    }
    $decoded = json_decode($raw, true);
    if (is_array($decoded) && !empty($decoded['slides'])) {
        $hasManifest = true;
        $manifestData = $decoded;
    }
}

$canManage = has_capability('mod/productexplainer:manage', $context)
    || has_capability('moodle/course:manageactivities', $context);

$builderMode = $canManage && (!$hasManifest || $editmode);

// Get credentials via local_aiconfig or fallback to plugin settings.
$aiconfiglib = $CFG->dirroot . '/local/aiconfig/lib.php';
if (file_exists($aiconfiglib)) {
    require_once($aiconfiglib);
}
if (function_exists('local_aiconfig_get_siteid')) {
    $siteId = local_aiconfig_get_siteid('mod_productexplainer');
} else {
    $siteId = get_config('local_aiconfig', 'siteid') ?: get_config('mod_productexplainer', 'siteid') ?: '';
}
if (function_exists('local_aiconfig_get_apikey')) {
    $apiKey = local_aiconfig_get_apikey('mod_productexplainer');
} else {
    $apiKey = get_config('local_aiconfig', 'apikey') ?: get_config('mod_productexplainer', 'apikey') ?: '';
}

$verStr = get_config('mod_productexplainer', 'version');
$PAGE->requires->css(new moodle_url('/mod/productexplainer/styles.css', ['ver' => $verStr]));

// Pass manifest to JS (URL-encoded to avoid escaping issues).
$manifestForJs = '';
if ($hasManifest && $manifestData) {
    $manifestForJs = rawurlencode(json_encode($manifestData));
}

$PAGE->requires->js_call_amd('mod_productexplainer/player', 'init', [[
    'cmid'                 => $cm->id,
    'instanceId'           => $cm->instance,
    'builderMode'          => $builderMode,
    'hasManifest'          => $hasManifest,
    'manifest'             => $manifestForJs,
    'siteId'               => $siteId,
    'apiKey'               => $apiKey,
    'enableVoiceover'      => (bool)(int)$pe->enablevoiceover,
    'voiceLanguage'        => $pe->voicelanguage ?: 'en-AU',
    'voiceStyle'           => $pe->voicestyle ?: 'Zephyr',
    'requireVoiceover'     => (bool)(int)$pe->requirevoiceover,
    'accentColor'          => $pe->accentcolor ?? '#3b82f6',
    'slideTransition'      => $pe->slidetransition ?? 'slide',
    'completionQuiz'       => (bool)(int)($pe->completionquiz ?? 0),
    'completionQuizPct'    => (int)($pe->completionquizpercent ?? 100),
    'enableCertificate'    => (bool)(int)($pe->enablecertificate ?? 0),
    'cpdPoints'            => (int)($pe->cpdpoints ?? 0),
    'certificatePdf'       => (bool)(int)($pe->certificatepdf ?? 1),
    'studentName'          => fullname($USER),
    'activityName'         => format_string($pe->name),
    'siteName'             => format_string($SITE->fullname),
    'siteLogoUrl'          => (function() use ($OUTPUT, $pe) {
        // Teacher-configured logo takes priority
        if (!empty($pe->certificatelogourl)) return clean_param($pe->certificatelogourl, PARAM_URL);
        // Fall back to Moodle theme logo
        try {
            $u = $OUTPUT->get_compact_logo_url(0, 80);
            if ($u) return $u->out(false);
            $u = $OUTPUT->get_logo_url(0, 80);
            if ($u) return $u->out(false);
        } catch (Exception $e) {}
        return '';
    })(),
    'canManage'            => $canManage,
    'sesskey'              => sesskey(),
    'ajaxUrl'              => (new moodle_url('/mod/productexplainer/ajax.php'))->out(false),
]]);

echo $OUTPUT->header();

// Container that AMD player.js will fill.
echo '<div id="pe-app" class="pe-app" data-cmid="' . $cm->id . '">';
echo '<div id="pe-loading" class="pe-loading"><div class="pe-spinner"></div><p>Loading...</p></div>';
echo '</div>';

// Edit button + Reports link for teachers when viewing locked content.
if ($canManage && $hasManifest && !$builderMode) {
    $editurl   = new moodle_url('/mod/productexplainer/view.php', ['id' => $id, 'edit' => 1]);
    $reporturl = new moodle_url('/mod/productexplainer/report.php', ['id' => $id]);
    echo '<div class="pe-edit-bar">';
    echo html_writer::link($editurl, 'Edit slides', ['class' => 'btn btn-secondary btn-sm']);
    echo ' ';
    echo html_writer::link($reporturl, 'View Reports', ['class' => 'btn btn-primary btn-sm']);
    echo '</div>';
}

echo $OUTPUT->footer();
