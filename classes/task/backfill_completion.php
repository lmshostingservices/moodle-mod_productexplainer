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

namespace mod_productexplainer\task;

/**
 * One-off backfill: students who used AI Slide Flow before v1.0.116 were never
 * recorded as having viewed it, and the quiz rule was never evaluated. Anyone with a
 * stored attempt has demonstrably viewed the activity, so mark the view and
 * re-evaluate completion for them.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class backfill_completion extends \core\task\adhoc_task {
    /**
     * Run the backfill.
     */
    public function execute() {
        global $CFG, $DB;
        require_once($CFG->libdir . '/completionlib.php');

        $rs = $DB->get_recordset_sql(
            'SELECT DISTINCT a.userid, p.id AS peid, p.course
               FROM {productexplainer_attempts} a
               JOIN {productexplainer} p ON p.id = a.productexplainerid
           ORDER BY p.course, p.id'
        );
        $courses = [];
        $done = 0;
        foreach ($rs as $row) {
            if (!isset($courses[$row->course])) {
                $course = $DB->get_record('course', ['id' => $row->course]);
                $courses = [$row->course => $course ? [$course, new \completion_info($course), get_fast_modinfo($course)] : null];
            }
            if (!$courses[$row->course]) {
                continue;
            }
            [$course, $completion, $modinfo] = $courses[$row->course];
            if (empty($modinfo->instances['productexplainer'][$row->peid])) {
                continue;
            }
            $cm = $modinfo->instances['productexplainer'][$row->peid];
            if ($completion->is_enabled($cm) != COMPLETION_TRACKING_AUTOMATIC) {
                continue;
            }
            try {
                // Records the view (if required) and re-evaluates every rule.
                $completion->set_module_viewed($cm, (int)$row->userid);
                $completion->update_state($cm, COMPLETION_UNKNOWN, (int)$row->userid);
                $done++;
            } catch (\Throwable $e) {
                mtrace('productexplainer completion backfill: cm ' . $cm->id . ' user ' . $row->userid . ': ' . $e->getMessage());
            }
        }
        $rs->close();
        mtrace('productexplainer completion backfill: re-evaluated ' . $done . ' user/activity pairs.');
    }
}
