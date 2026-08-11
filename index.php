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
require_login();

$id = required_param('id', PARAM_INT);

$course = $DB->get_record('course', ['id' => $id], '*', MUST_EXIST);
require_course_login($course);
$PAGE->set_pagelayout('incourse');

$PAGE->set_url('/mod/productexplainer/index.php', ['id' => $id]);
$PAGE->set_title($course->shortname . ': ' . get_string('modulenameplural', 'productexplainer'));
$PAGE->set_heading($course->fullname);

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('modulenameplural', 'productexplainer'));

$cms = get_fast_modinfo($course)->get_instances_of('productexplainer');
if (empty($cms)) {
    notice(get_string('nocontentyet', 'productexplainer'), new moodle_url('/course/view.php', ['id' => $id]));
}

$table = new html_table();
$table->head = [get_string('name')];
$table->data = [];
foreach ($cms as $cm) {
    if (!$cm->uservisible) continue;
    $link = html_writer::link(new moodle_url('/mod/productexplainer/view.php', ['id' => $cm->id]), format_string($cm->name));
    $table->data[] = [$link];
}
echo html_writer::table($table);
echo $OUTPUT->footer();
