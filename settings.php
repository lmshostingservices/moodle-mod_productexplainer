<?php
/**
 * Admin settings for mod_productexplainer.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig && isset($settings)) {
    $settings->add(new admin_setting_configtext(
        'mod_productexplainer/siteid',
        get_string('siteid', 'productexplainer'),
        get_string('siteid_desc', 'productexplainer'),
        '',
        PARAM_TEXT
    ));

    $settings->add(new admin_setting_configpasswordunmask(
        'mod_productexplainer/apikey',
        get_string('apikey', 'productexplainer'),
        get_string('apikey_desc', 'productexplainer'),
        ''
    ));
}
