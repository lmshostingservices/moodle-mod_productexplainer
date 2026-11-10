<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle. If not, see <https://www.gnu.org/licenses/>.

namespace mod_productexplainer\aicoursebuilder;

defined('MOODLE_INTERNAL') || die();

/**
 * AI Course Builder adapter for Slide Flow's native concept-slides workflow.
 *
 * @package    mod_productexplainer
 * @copyright  2026 LMS Hosting Services
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
final class generator {
    /** @var string */
    private const COMPONENT = 'mod_productexplainer';

    /** @var int */
    private const CONCEPT_PRICE = 10;

    /** @var int One slide picture, the price of "New image" in the editor. */
    private const IMAGE_PRICE = 2;

    /** @var int Pictures made for a Course Builder deck: one per concept slide. */
    private const IMAGE_SLIDES = 7;

    /**
     * Return the server price for the plugin's fixed seven-slide concept workflow.
     *
     * @param array $brief
     * @return int
     */
    public static function native_estimate(array $brief): int {
        // The seven slides and the picture on each, as when a teacher makes the deck by hand.
        return self::CONCEPT_PRICE + self::IMAGE_PRICE * self::IMAGE_SLIDES;
    }

    /**
     * Generate through the same LMS Labs concept endpoint used by Product Explainer's own editor,
     * then persist through the plugin's manifest storage boundary.
     *
     * @param int $cmid
     * @param array $brief
     * @return string Activity id, used as the synchronous request reference.
     */
    public static function native_generate(int $cmid, array $brief): string {
        global $CFG, $DB, $USER;

        [$course, $cm] = get_course_and_cm_from_cmid($cmid, 'productexplainer');
        $activity = $DB->get_record('productexplainer', [
            'id' => (int)$cm->instance,
            'course' => (int)$course->id,
        ], '*', MUST_EXIST);
        $context = \context_module::instance($cmid);
        if (!has_capability('mod/productexplainer:manage', $context)
                && !has_capability('moodle/course:manageactivities', $context)) {
            throw new \required_capability_exception($context, 'mod/productexplainer:manage', 'nopermissions', '');
        }

        $configlib = $CFG->dirroot . '/local/aiconfig/lib.php';
        if (file_exists($configlib)) {
            require_once($configlib);
        }
        $siteid = function_exists('local_aiconfig_get_siteid')
            ? local_aiconfig_get_siteid(self::COMPONENT)
            : (get_config('local_aiconfig', 'siteid') ?: get_config(self::COMPONENT, 'siteid'));
        $apikey = function_exists('local_aiconfig_get_apikey')
            ? local_aiconfig_get_apikey(self::COMPONENT)
            : (get_config('local_aiconfig', 'apikey') ?: get_config(self::COMPONENT, 'apikey'));
        if (trim((string)$siteid) === '' || trim((string)$apikey) === '') {
            throw new \moodle_exception('missingcredentials', 'mod_productexplainer');
        }

        $program = is_array($brief['program'] ?? null) ? $brief['program'] : [];
        $lesson = is_array($brief['lesson'] ?? null) ? $brief['lesson'] : [];
        $title = clean_param((string)($lesson['title'] ?? $activity->name), PARAM_TEXT);
        $outcomes = is_array($lesson['outcomes'] ?? null) ? $lesson['outcomes'] : [];
        $outcometexts = [];
        foreach ($outcomes as $outcome) {
            $text = is_array($outcome) ? (string)($outcome['text'] ?? '') : (string)$outcome;
            $text = trim(clean_param($text, PARAM_TEXT));
            if ($text !== '') {
                $outcometexts[] = $text;
            }
        }
        $source = trim((string)($brief['sourcecontent'] ?? $lesson['content'] ?? ''));
        $contexttext = implode('; ', array_filter([
            (string)($program['country'] ?? ''),
            (string)($program['level'] ?? ''),
            (string)($program['subject'] ?? ''),
        ]));
        $objective = implode("\n", $outcometexts);
        if ($source === '') {
            $source = implode("\n\n", $outcometexts);
        }

        $baseurl = rtrim((string)(get_config('local_aiconfig', 'serverurl') ?: 'https://lms-labs.com'), '/');
        $payload = [
            'siteId' => (string)$siteid,
            'apiKey' => (string)$apikey,
            'conceptName' => \core_text::substr($title, 0, 200),
            'context' => \core_text::substr($contexttext, 0, 200),
            'learnerRole' => \core_text::substr((string)($program['learnerProfile'] ?? ''), 0, 200),
            'learningObjective' => \core_text::substr($objective, 0, 500),
            'ownContent' => \core_text::substr($source, 0, 100000),
            'quizCount' => 5,
            'creditsToUse' => self::CONCEPT_PRICE,
            'voiceLanguage' => (string)($activity->voicelanguage ?: 'en-AU'),
        ];

        $curl = new \curl();
        $curl->setopt([
            'CURLOPT_TIMEOUT' => 180,
            'CURLOPT_CONNECTTIMEOUT' => 30,
            'CURLOPT_RETURNTRANSFER' => true,
            'CURLOPT_SSL_VERIFYPEER' => true,
        ]);
        $curl->setHeader(['Content-Type: application/json', 'Accept: application/json']);
        $response = $curl->post($baseurl . '/api/moodle/concept-explainer/generate', json_encode($payload));
        $info = $curl->get_info();
        $httpcode = (int)($info['http_code'] ?? 0);
        $result = is_string($response) ? json_decode($response, true) : null;
        if ($httpcode < 200 || $httpcode >= 300 || !is_array($result) || empty($result['success'])
                || !is_array($result['manifest'] ?? null)) {
            $reason = is_array($result) ? (string)($result['error'] ?? '') : '';
            throw new \moodle_exception('generationfailed', 'local_aicoursebuilder', '',
                $reason !== '' ? clean_param($reason, PARAM_TEXT) : 'Slide Flow concept generation failed.');
        }

        $manifest = $result['manifest'];
        $manifest['mode'] = 'concept';
        $manifest['_aicoursebuilder'] = [
            'job' => sha1((string)($brief['idempotencyKey'] ?? ('cmid-' . $cmid))),
            'userid' => (int)$USER->id,
        ];
        // The editor makes a picture for each slide after the text; do the same, so a deck built
        // by AI Course Builder does not open with empty picture panels.
        $manifest = self::add_slide_images($manifest, $activity, $context, $baseurl, (string)$siteid, (string)$apikey,
            $contexttext);
        \mod_productexplainer\local\manifest_storage::save($activity, $manifest, !empty($activity->enablevoiceover));
        return (string)$activity->id;
    }

    /**
     * Make one picture per slide through the editor's own image route and store it like the editor.
     *
     * A picture that cannot be made is left out (the slide keeps its text); the deck still completes.
     *
     * @param array $manifest
     * @param \stdClass $activity
     * @param \context_module $context
     * @param string $baseurl
     * @param string $siteid
     * @param string $apikey
     * @param string $contexttext
     * @return array
     */
    private static function add_slide_images(array $manifest, \stdClass $activity, \context_module $context,
            string $baseurl, string $siteid, string $apikey, string $contexttext): array {
        $fs = get_file_storage();
        $made = 0;
        foreach ($manifest['slides'] ?? [] as $index => $slide) {
            if ($made >= self::IMAGE_SLIDES) {
                break;
            }
            $prompt = trim((string)($slide['imagePrompt'] ?? ''));
            if ($prompt === '' || !empty($slide['imageUrl'])) {
                continue;
            }
            $made++;
            try {
                $curl = new \curl();
                $curl->setopt([
                    'CURLOPT_TIMEOUT' => 120,
                    'CURLOPT_CONNECTTIMEOUT' => 30,
                    'CURLOPT_RETURNTRANSFER' => true,
                    'CURLOPT_SSL_VERIFYPEER' => true,
                ]);
                $curl->setHeader(['Content-Type: application/json', 'Accept: application/json']);
                $response = $curl->post($baseurl . '/api/moodle/concept-explainer/generate-image', json_encode([
                    'siteId' => $siteid,
                    'apiKey' => $apikey,
                    'imagePrompt' => $prompt,
                    'slideIndex' => (int)$index,
                    'creditsToUse' => self::IMAGE_PRICE,
                    'voiceLanguage' => (string)($activity->voicelanguage ?: 'en-AU'),
                    'context' => $contexttext,
                ]));
                $result = is_string($response) ? json_decode($response, true) : null;
                if (!is_array($result) || empty($result['success']) || empty($result['imageData'])) {
                    continue;
                }
                $bytes = base64_decode(preg_replace('/^data:[^;]+;base64,/', '', (string)$result['imageData']), true);
                if ($bytes === false || $bytes === '' || @getimagesizefromstring($bytes) === false) {
                    continue;
                }
                $filename = 'slide_' . (int)$index . '.jpg';
                foreach (['jpg', 'jpeg', 'png', 'gif', 'webp'] as $ext) {
                    $old = $fs->get_file($context->id, 'mod_productexplainer', 'slideimages', $activity->id, '/',
                        'slide_' . (int)$index . '.' . $ext);
                    if ($old) {
                        $old->delete();
                    }
                }
                $fs->create_file_from_string([
                    'contextid' => $context->id,
                    'component' => 'mod_productexplainer',
                    'filearea' => 'slideimages',
                    'itemid' => $activity->id,
                    'filepath' => '/',
                    'filename' => $filename,
                ], $bytes);
                $manifest['slides'][$index]['imageUrl'] = \moodle_url::make_pluginfile_url($context->id,
                    'mod_productexplainer', 'slideimages', $activity->id, '/', $filename)->out(false);
            } catch (\Throwable $e) {
                debugging('Slide Flow could not make a slide picture: ' . $e->getMessage(), DEBUG_DEVELOPER);
            }
        }
        return $manifest;
    }

    /**
     * The current concept endpoint completes synchronously; confirm the saved native manifest.
     *
     * @param int $cmid
     * @param string $jobid
     * @return array
     */
    public static function native_status(int $cmid, string $jobid): array {
        global $DB;
        [$course, $cm] = get_course_and_cm_from_cmid($cmid, 'productexplainer');
        $activity = $DB->get_record('productexplainer', [
            'id' => (int)$cm->instance,
            'course' => (int)$course->id,
        ], '*', MUST_EXIST);
        if ((string)$activity->id !== $jobid) {
            return ['status' => 'blocked', 'retryable' => false, 'error' => 'Slide Flow request reference does not match this activity.'];
        }
        $manifest = \mod_productexplainer\local\manifest_storage::decode((string)($activity->manifestjson ?? ''));
        if (!$manifest || ($manifest['mode'] ?? '') !== 'concept' || count($manifest['slides'] ?? []) < 7) {
            return ['status' => 'failed', 'retryable' => false, 'error' => 'Slide Flow did not save a complete concept slide manifest.'];
        }
        return [
            'status' => 'complete',
            'retryable' => false,
            'result' => [
                'activityid' => (int)$activity->id,
                'slidecount' => count($manifest['slides']),
                'mode' => 'concept',
            ],
        ];
    }

    /**
     * Verify the plugin's own saved data is still present before the builder marks its job complete.
     *
     * @param int $cmid
     * @param array $result
     * @return void
     */
    public static function native_save_result(int $cmid, array $result): void {
        global $DB;
        [$course, $cm] = get_course_and_cm_from_cmid($cmid, 'productexplainer');
        $activity = $DB->get_record('productexplainer', [
            'id' => (int)$cm->instance,
            'course' => (int)$course->id,
        ], '*', MUST_EXIST);
        $manifest = \mod_productexplainer\local\manifest_storage::decode((string)($activity->manifestjson ?? ''));
        if (!$manifest || count($manifest['slides'] ?? []) !== (int)($result['slidecount'] ?? 0)) {
            throw new \moodle_exception('emptygeneratorresult', 'local_aicoursebuilder');
        }
    }

    /**
     * Whether all native adapter dependencies are present.
     *
     * @return bool
     */
    public static function is_available(): bool {
        return class_exists('\local_aicoursebuilder\local\generator_runtime')
            && class_exists('\mod_productexplainer\local\manifest_storage');
    }

    /**
     * Adapter estimate entry point.
     *
     * @param array $brief
     * @return int
     */
    public static function estimate(array $brief): int {
        return \local_aicoursebuilder\local\generator_runtime::estimate(self::COMPONENT, $brief);
    }

    /**
     * Adapter generation entry point.
     *
     * @param int $cmid
     * @param array $brief
     * @return string
     */
    public static function generate(int $cmid, array $brief): string {
        return \local_aicoursebuilder\local\generator_runtime::generate(self::COMPONENT, $cmid, $brief);
    }

    /**
     * Adapter status entry point.
     *
     * @param int $cmid
     * @param string $jobid
     * @return array
     */
    public static function status(int $cmid, string $jobid): array {
        return \local_aicoursebuilder\local\generator_runtime::status(self::COMPONENT, $cmid, $jobid);
    }
}
