<?php
defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/mod/productexplainer/backup/moodle2/backup_productexplainer_stepslib.php');

class backup_productexplainer_activity_task extends backup_activity_task {

    protected function define_my_settings() {
    }

    protected function define_my_steps() {
        $this->add_step(new backup_productexplainer_activity_structure_step('productexplainer_structure', 'productexplainer.xml'));
    }

    public static function encode_content_links($content) {
        global $CFG;
        $base = preg_quote($CFG->wwwroot, '/');
        $search = '/(' . $base . '\/mod\/productexplainer\/view.php\?id=)([0-9]+)/';
        $content = preg_replace($search, '$@PRODUCTEXPLAINERVIEWBYID*$2@$', $content);
        $search = '/(' . $base . '\/mod\/productexplainer\/index.php\?id=)([0-9]+)/';
        $content = preg_replace($search, '$@PRODUCTEXPLAINERINDEX*$2@$', $content);
        return $content;
    }
}
