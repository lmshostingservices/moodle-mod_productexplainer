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
 * Upgrade script for mod_productexplainer.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();


function xmldb_productexplainer_upgrade($oldversion) {
    if ($oldversion < 2026072300) {
        upgrade_mod_savepoint(true, 2026072300, 'productexplainer');
    }

    if ($oldversion < 2026110200) {
        // Views were never recorded and the quiz rule was never evaluated before this
        // version. Queue a one-off task to repair completion for existing students.
        // Cached course module info carried an invalid customcompletionrules key; rebuild it.
        global $DB;
        foreach ($DB->get_fieldset_sql('SELECT DISTINCT course FROM {productexplainer}') as $courseid) {
            rebuild_course_cache((int)$courseid, true);
        }
        \core\task\manager::queue_adhoc_task(new \mod_productexplainer\task\backfill_completion(), true);
        upgrade_mod_savepoint(true, 2026110200, 'productexplainer');
    }
    return true;
}
