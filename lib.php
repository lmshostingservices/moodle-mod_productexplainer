<?php
/**
 * Library functions for mod_productexplainer.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

function productexplainer_supports($feature) {
    if (defined('FEATURE_MOD_PURPOSE') && $feature === FEATURE_MOD_PURPOSE) {
        return MOD_PURPOSE_CONTENT;
    }
    switch ($feature) {
        case FEATURE_MOD_INTRO:
            return true;
        case FEATURE_SHOW_DESCRIPTION:
            return true;
        case FEATURE_GRADE_HAS_GRADE:
            return false;
        case FEATURE_BACKUP_MOODLE2:
            return true;
        case FEATURE_COMPLETION_TRACKS_VIEWS:
            return true;
        case FEATURE_COMPLETION_HAS_RULES:
            return true;
        default:
            return null;
    }
}

function productexplainer_add_instance($productexplainer, $mform = null) {
    global $DB;
    $productexplainer->timecreated  = time();
    $productexplainer->timemodified = time();
    $productexplainer->manifestjson = null;
    return $DB->insert_record('productexplainer', $productexplainer);
}

function productexplainer_update_instance($productexplainer, $mform = null) {
    global $DB;
    $productexplainer->timemodified = time();
    $productexplainer->id = $productexplainer->instance;
    return $DB->update_record('productexplainer', $productexplainer);
}

function productexplainer_delete_instance($id) {
    global $DB;
    if (!$pe = $DB->get_record('productexplainer', ['id' => $id])) {
        return false;
    }
    $cm = get_coursemodule_from_instance('productexplainer', $id, $pe->course, false, MUST_EXIST);
    $context = context_module::instance($cm->id);
    $fs = get_file_storage();
    $fs->delete_area_files($context->id, 'mod_productexplainer', 'slideimages', $id);
    $fs->delete_area_files($context->id, 'mod_productexplainer', 'slidevoiceovers', $id);
    $DB->delete_records('productexplainer', ['id' => $id]);
    return true;
}

function productexplainer_pluginfile($course, $cm, $context, $filearea, $args, $forcedownload, array $options = []) {
    require_login();
    if ($context->contextlevel != CONTEXT_MODULE) {
        return false;
    }
    if ($filearea !== 'slideimages' && $filearea !== 'slidevoiceovers') {
        return false;
    }
    $fs = get_file_storage();
    $itemid  = (int) array_shift($args);
    $filename = array_pop($args);
    $filepath = $args ? '/' . implode('/', $args) . '/' : '/';
    $file = $fs->get_file($context->id, 'mod_productexplainer', $filearea, $itemid, $filepath, $filename);
    if (!$file) {
        return false;
    }
    send_stored_file($file, 0, 0, $forcedownload, $options);
}

function productexplainer_get_coursemodule_info($coursemodule) {
    global $DB;
    $fields = 'id, name, intro, introformat, timemodified, completionquiz, completionquizpercent';
    if (!$pe = $DB->get_record('productexplainer', ['id' => $coursemodule->instance], $fields)) {
        return false;
    }
    $result = new cached_cm_info();
    $result->name = $pe->name;
    if ($coursemodule->showdescription) {
        $result->content = format_module_intro('productexplainer', $pe, $coursemodule->id, false);
    }
    $result->customdata['customcompletionrules'] = [
        'completionquiz'        => (int)($pe->completionquiz ?? 0),
        'completionquizpercent' => (int)($pe->completionquizpercent ?? 100),
    ];
    return $result;
}

function productexplainer_get_completion_state($course, $cm, $userid, $type) {
    global $DB;
    $pe = $DB->get_record('productexplainer', ['id' => $cm->instance], 'id, completionquiz, completionquizpercent', MUST_EXIST);
    if (empty($pe->completionquiz)) {
        return ($type == COMPLETION_AND) ? true : false;
    }
    $minpercent = (int)($pe->completionquizpercent ?? 100);
    $bestscore = $DB->get_field_sql(
        'SELECT MAX(score) FROM {productexplainer_attempts} WHERE productexplainerid = ? AND userid = ?',
        [$pe->id, $userid]
    );
    if ($bestscore === false || $bestscore === null) {
        return false;
    }
    return ((int)$bestscore >= $minpercent);
}

function productexplainer_get_completion_active_rule_descriptions($cm) {
    $descriptions = [];
    $rules = $cm->customdata['customcompletionrules'] ?? [];
    if (!empty($rules['completionquiz'])) {
        $pct  = (int)($rules['completionquizpercent'] ?? 100);
        $descriptions[] = get_string('completionquiz_desc', 'productexplainer') . ' (' . $pct . '%)';
    }
    return $descriptions;
}
