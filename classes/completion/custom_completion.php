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

namespace mod_productexplainer\completion;

use core_completion\activity_custom_completion;

/**
 * Custom completion rules for AI Slide Flow.
 *
 * Moodle 3.11+ ignores the legacy productexplainer_get_completion_state() callback;
 * custom rules are evaluated only through this class.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class custom_completion extends activity_custom_completion {

    /**
     * Fetches the completion state for a given completion rule.
     *
     * @param string $rule The completion rule.
     * @return int The completion state.
     */
    public function get_state(string $rule): int {
        global $DB;

        $this->validate_rule($rule);

        $pe = $DB->get_record('productexplainer', ['id' => $this->cm->instance],
            'id, completionquizpercent', MUST_EXIST);
        $best = $DB->get_field_sql(
            'SELECT MAX(score) FROM {productexplainer_attempts} WHERE productexplainerid = ? AND userid = ?',
            [$pe->id, $this->userid]
        );
        if ($best === false || $best === null) {
            return COMPLETION_INCOMPLETE;
        }
        return ((int)$best >= (int)$pe->completionquizpercent) ? COMPLETION_COMPLETE : COMPLETION_INCOMPLETE;
    }

    /**
     * Fetch the list of custom completion rules that this module defines.
     *
     * @return array
     */
    public static function get_defined_custom_rules(): array {
        return ['completionquiz'];
    }

    /**
     * Returns an associative array of the descriptions of custom completion rules.
     *
     * @return array
     */
    public function get_custom_rule_descriptions(): array {
        $pct = (int)($this->cm->customdata['completionquizpercent'] ?? 100);
        return [
            'completionquiz' => get_string('completionquiz_desc', 'productexplainer') . ' (' . $pct . '%)',
        ];
    }

    /**
     * Returns an array of all completion rules, in the order they should be displayed to users.
     *
     * @return array
     */
    public function get_sort_order(): array {
        return ['completionview', 'completionquiz'];
    }
}
