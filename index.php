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
 * List all Product Explainer instances in a course.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require('../../config.php');

$id = required_param('id', PARAM_INT);

$course = $DB->get_record('course', ['id' => $id], '*', MUST_EXIST);
require_login($course);
$PAGE->set_pagelayout('incourse');
$PAGE->set_context(context_course::instance($course->id));

$PAGE->set_url('/mod/productexplainer/index.php', ['id' => $id]);
$PAGE->set_title($course->shortname . ': ' . get_string('modulenameplural', 'productexplainer'));
$PAGE->set_heading($course->fullname);

// The plugin stylesheet is not loaded automatically on this page, and the bulk export
// block below uses the plugin's own classes.
$PAGE->requires->css(new moodle_url(
    '/mod/productexplainer/styles.css',
    ['ver' => get_config('mod_productexplainer', 'version')]
));

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('modulenameplural', 'productexplainer'));

$cms = get_fast_modinfo($course)->get_instances_of('productexplainer');
if (empty($cms)) {
    // The notice() function detects that the header is already printed and closes the
    // open containers itself, then prints its own footer and exits.
    notice(get_string('nocontentyet', 'productexplainer'), new moodle_url('/course/view.php', ['id' => $id]));
}

$table = new html_table();
$table->head = [get_string('name')];
$table->data = [];
foreach ($cms as $cm) {
    if (!$cm->uservisible) {
        continue;
    }
    $link = html_writer::link(new moodle_url('/mod/productexplainer/view.php', ['id' => $cm->id]), format_string($cm->name));
    $table->data[] = [$link];
}
echo html_writer::table($table);

// FEAT-CONTENT-EXPORT: course-wide bulk download of every activity's generated content.
$coursecontext = context_course::instance($course->id);
if (
    has_capability('moodle/course:manageactivities', $coursecontext)
    || has_capability('mod/productexplainer:manage', $coursecontext)
) {
    echo $OUTPUT->heading(get_string('exportcourseheading', 'productexplainer'), 3);
    echo html_writer::start_div('pe-export-bar');
    foreach ([0 => 'exportcoursecombined', 1 => 'exportcoursezip'] as $bundle => $labelkey) {
        echo html_writer::tag('p', get_string($labelkey, 'productexplainer') . ':', ['class' => 'pe-export-label']);
        echo html_writer::start_div('pe-export-links');
        foreach (['txt' => 'exporttxt', 'md' => 'exportmd', 'json' => 'exportjson'] as $fmt => $strkey) {
            $exporturl = new moodle_url('/mod/productexplainer/export.php', [
                'courseid' => $course->id, 'format' => $fmt, 'bundle' => $bundle, 'sesskey' => sesskey(),
            ]);
            echo html_writer::link(
                $exporturl,
                get_string($strkey, 'productexplainer'),
                ['class' => 'btn btn-outline-secondary btn-sm']
            );
            echo ' ';
        }
        echo html_writer::end_div();
    }
    echo html_writer::end_div();
}

echo $OUTPUT->footer();
