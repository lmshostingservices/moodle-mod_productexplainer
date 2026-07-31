<?php
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
