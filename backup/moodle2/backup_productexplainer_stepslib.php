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
 * mod_productexplainer file.
 *
 * @package    mod_productexplainer
 * @copyright  2026 LMS-Labs
 * @license    http://www.gnu.org/licenses/gpl-3.0.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

class backup_productexplainer_activity_structure_step extends backup_activity_structure_step {
    protected function define_structure() {
        $userinfo = $this->get_setting_value('userinfo');

        $productexplainer = new backup_nested_element('productexplainer', ['id'], [
            'course', 'name', 'intro', 'introformat',
            'manifestjson', 'enablevoiceover', 'voicelanguage', 'voicestyle',
            'requirevoiceover', 'accentcolor', 'slidetransition',
            'completionquiz', 'completionquizpercent',
            'enablecertificate', 'cpdpoints', 'certificatepdf', 'certificatelogourl',
            'timecreated', 'timemodified',
        ]);

        $attempts   = new backup_nested_element('attempts');
        $attempt    = new backup_nested_element('attempt', ['id'], [
            'productexplainerid', 'userid', 'score', 'timetaken',
            'route', 'slidecount', 'questioncount', 'timecreated',
        ]);

        $slidetimes = new backup_nested_element('slidetimes');
        $slidetime  = new backup_nested_element('slidetime', ['id'], [
            'attemptid', 'slideidx', 'slidetype', 'slidetitle', 'timesecs',
        ]);

        $answers = new backup_nested_element('answers');
        $answer  = new backup_nested_element('answer', ['id'], [
            'attemptid', 'qidx', 'qtext', 'selectedidx', 'correctidx', 'iscorrect',
        ]);

        $productexplainer->add_child($attempts);
        $attempts->add_child($attempt);
        $attempt->add_child($slidetimes);
        $slidetimes->add_child($slidetime);
        $attempt->add_child($answers);
        $answers->add_child($answer);

        $productexplainer->set_source_table('productexplainer', ['id' => backup::VAR_ACTIVITYID]);

        if ($userinfo) {
            $attempt->set_source_table('productexplainer_attempts', ['productexplainerid' => backup::VAR_PARENTID], 'id ASC');
            $slidetime->set_source_table('productexplainer_slidetimes', ['attemptid' => backup::VAR_PARENTID], 'id ASC');
            $answer->set_source_table('productexplainer_answers', ['attemptid' => backup::VAR_PARENTID], 'id ASC');
            $attempt->annotate_ids('user', 'userid');
        }

        return $this->prepare_activity_structure($productexplainer);
    }
}
