<?php
defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/mod/productexplainer/backup/moodle2/restore_productexplainer_stepslib.php');

class restore_productexplainer_activity_task extends restore_activity_task {

    protected function define_my_settings() {
    }

    protected function define_my_steps() {
        $this->add_step(new restore_productexplainer_activity_structure_step('productexplainer_structure', 'productexplainer.xml'));
    }

    public static function define_decode_contents() {
        $contents = [];
        $contents[] = new restore_decode_content('productexplainer', ['intro'], 'productexplainer');
        return $contents;
    }

    public static function define_decode_rules() {
        $rules = [];
        $rules[] = new restore_decode_rule('PRODUCTEXPLAINERVIEWBYID', '/mod/productexplainer/view.php?id=$1', 'course_module');
        $rules[] = new restore_decode_rule('PRODUCTEXPLAINERINDEX', '/mod/productexplainer/index.php?id=$1', 'course');
        return $rules;
    }

    public static function define_restore_log_rules() {
        $rules = [];
        $rules[] = new restore_log_rule('productexplainer', 'add', 'view.php?id={course_module}', '{productexplainer}');
        $rules[] = new restore_log_rule('productexplainer', 'update', 'view.php?id={course_module}', '{productexplainer}');
        $rules[] = new restore_log_rule('productexplainer', 'view', 'view.php?id={course_module}', '{productexplainer}');
        return $rules;
    }

    public static function define_restore_log_rules_for_course() {
        $rules = [];
        $rules[] = new restore_log_rule('productexplainer', 'view all', 'index.php?id={course}', null);
        return $rules;
    }
}
