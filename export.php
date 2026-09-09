<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Download the generated slide and quiz content of one activity, or of every
 * AI Slide Flow activity in a course, as text, Markdown or JSON.
 *
 * The export contains the quiz answer key, so it requires the manage capability.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require('../../config.php');
require_once($CFG->libdir . '/filelib.php');

$id       = optional_param('id', 0, PARAM_INT);        // Course module id (single activity).
$courseid = optional_param('courseid', 0, PARAM_INT);  // Course id (bulk export).
$format   = optional_param('format', 'txt', PARAM_ALPHA);
$bundle   = optional_param('bundle', 0, PARAM_BOOL);   // Bulk only: one zip instead of one file.

if (!in_array($format, ['txt', 'md', 'json'], true)) {
    $format = 'txt';
}

$mimetypes = [
    'txt'  => 'text/plain; charset=utf-8',
    'md'   => 'text/markdown; charset=utf-8',
    'json' => 'application/json; charset=utf-8',
];

if (empty($id) && empty($courseid)) {
    throw new moodle_exception('missingparam', 'error', '', 'id');
}

/**
 * Filter a Moodle text field for output into a plain-text download.
 *
 * format_string() HTML-escapes its result, which would put &amp; and &quot; into a
 * .txt/.md/.json file.
 *
 * @param  string $text Raw text field value.
 * @return string
 */
function productexplainer_plain($text) {
    return html_entity_decode(format_string((string)$text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/**
 * Render one activity in the requested format.
 *
 * @param  \mod_productexplainer\local\exporter $exporter Exporter for the activity.
 * @param  string                               $format   One of txt, md, json.
 * @return string
 */
function productexplainer_render_export(\mod_productexplainer\local\exporter $exporter, $format) {
    if ($format === 'json') {
        return json_encode($exporter->to_array(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
    if ($format === 'md') {
        return $exporter->to_markdown();
    }
    return $exporter->to_text();
}

if (!empty($id)) {
    // Single activity.
    $cm      = get_coursemodule_from_id('productexplainer', $id, 0, false, MUST_EXIST);
    $course  = $DB->get_record('course', ['id' => $cm->course], '*', MUST_EXIST);
    $pe      = $DB->get_record('productexplainer', ['id' => $cm->instance], '*', MUST_EXIST);

    require_login($course, false, $cm);
    require_sesskey();
    $context = context_module::instance($cm->id);

    if (
        !has_capability('mod/productexplainer:manage', $context)
        && !has_capability('moodle/course:manageactivities', $context)
    ) {
        throw new required_capability_exception($context, 'mod/productexplainer:manage', 'nopermissions', '');
    }

    $exporter = new \mod_productexplainer\local\exporter($pe, $course);
    $content  = productexplainer_render_export($exporter, $format);
    $filename = $exporter->filename_base() . '.' . $format;

    send_file($content, $filename, 0, 0, true, true, $mimetypes[$format]);
    exit;
}

// Whole course.
$course = $DB->get_record('course', ['id' => $courseid], '*', MUST_EXIST);
require_login($course);
require_sesskey();
$coursecontext = context_course::instance($course->id);

if (
    !has_capability('moodle/course:manageactivities', $coursecontext)
    && !has_capability('mod/productexplainer:manage', $coursecontext)
) {
    throw new required_capability_exception($coursecontext, 'mod/productexplainer:manage', 'nopermissions', '');
}

$modinfo  = get_fast_modinfo($course);
$exports  = [];

foreach ($modinfo->get_instances_of('productexplainer') as $cm) {
    $modcontext = context_module::instance($cm->id);
    // Re-check per activity: a user may manage some activities in a course but not all.
    if (
        !has_capability('mod/productexplainer:manage', $modcontext)
        && !has_capability('moodle/course:manageactivities', $modcontext)
    ) {
        continue;
    }
    $pe = $DB->get_record('productexplainer', ['id' => $cm->instance]);
    if (!$pe) {
        continue;
    }
    $exporter = new \mod_productexplainer\local\exporter($pe, $course);
    if (!$exporter->has_content()) {
        continue;
    }
    $exports[] = [
        'name'     => $exporter->filename_base(),
        'exporter' => $exporter,
    ];
}

$coursename = clean_filename(html_entity_decode(
    format_string($course->shortname, true, ['context' => $coursecontext]),
    ENT_QUOTES | ENT_HTML5,
    'UTF-8'
));
$coursename = trim(preg_replace('/_+/', '_', preg_replace('/[^A-Za-z0-9_\-]+/', '_', $coursename)), '_');
if ($coursename === '') {
    $coursename = 'course';
}
$coursename = 'slideflow_' . $coursename;

if (empty($exports)) {
    // Nothing to send — return to the index page with an explanation rather than
    // downloading an empty file.
    redirect(
        new moodle_url('/mod/productexplainer/index.php', ['id' => $course->id]),
        get_string('exportnothing', 'productexplainer'),
        null,
        \core\output\notification::NOTIFY_WARNING
    );
}

if ($bundle) {
    // One file per activity, delivered as a zip.
    $tempdir = make_request_directory();
    $files   = [];
    foreach ($exports as $item) {
        $path = $tempdir . '/' . $item['name'] . '.' . $format;
        file_put_contents($path, productexplainer_render_export($item['exporter'], $format));
        $files[$item['name'] . '.' . $format] = $path;
    }
    $packer  = get_file_packer('application/zip');
    $zippath = $tempdir . '/' . $coursename . '.zip';
    $packer->archive_to_pathname($files, $zippath);
    send_temp_file($zippath, $coursename . '.zip');
    exit;
}

// One combined file.
if ($format === 'json') {
    $combined = [
        'course'     => productexplainer_plain($course->fullname),
        'shortname'  => productexplainer_plain($course->shortname),
        'exportedAt' => userdate(time()),
        'activities' => [],
    ];
    foreach ($exports as $item) {
        $combined['activities'][] = $item['exporter']->to_array();
    }
    $content = json_encode($combined, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
} else {
    $md    = ($format === 'md');
    $parts = [];
    if ($md) {
        $parts[] = '# ' . productexplainer_plain($course->fullname);
        $parts[] = '';
        $parts[] = '_AI Slide Flow content export - ' . count($exports) . ' activit'
            . (count($exports) === 1 ? 'y' : 'ies') . ', ' . userdate(time()) . '_';
        $parts[] = '';
    } else {
        $parts[] = str_repeat('#', 78);
        $parts[] = 'AI SLIDE FLOW - COURSE CONTENT EXPORT';
        $parts[] = 'Course  : ' . productexplainer_plain($course->fullname);
        $parts[] = 'Includes: ' . count($exports) . ' activit' . (count($exports) === 1 ? 'y' : 'ies');
        $parts[] = 'Exported: ' . userdate(time());
        $parts[] = str_repeat('#', 78);
        $parts[] = '';
    }
    foreach ($exports as $item) {
        $parts[] = productexplainer_render_export($item['exporter'], $format);
        $parts[] = $md ? "\n---\n" : "\n" . str_repeat('#', 78) . "\n";
    }
    $content = implode("\n", $parts);
}

send_file($content, $coursename . '.' . $format, 0, 0, true, true, $mimetypes[$format]);
exit;
