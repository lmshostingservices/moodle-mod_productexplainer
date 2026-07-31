<?php
/**
 * AI Slide Flow — Teacher Analytics Dashboard.
 *
 * Provides two-tab reporting: Class Overview and Individual Student.
 * Requires manage capability. Loads report.js AMD module which renders
 * all charts and tables client-side from a single AJAX payload.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require('../../config.php');

$id = required_param('id', PARAM_INT);

$cm     = get_coursemodule_from_id('productexplainer', $id, 0, false, MUST_EXIST);
$course = $DB->get_record('course', ['id' => $cm->course], '*', MUST_EXIST);
$pe     = $DB->get_record('productexplainer', ['id' => $cm->instance], '*', MUST_EXIST);

require_login($course, true, $cm);
$context = context_module::instance($cm->id);

// Require teacher / manager capability.
if (!has_capability('mod/productexplainer:manage', $context) && !has_capability('moodle/course:manageactivities', $context)) {
    throw new required_capability_exception($context, 'mod/productexplainer:manage', 'nopermissions', '');
}

$PAGE->set_url('/mod/productexplainer/report.php', ['id' => $id]);
$PAGE->set_title(format_string($pe->name) . ' \u2014 Reports');
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($context);

$verStr  = get_config('mod_productexplainer', 'version');
$backUrl = (new moodle_url('/mod/productexplainer/view.php', ['id' => $id]))->out(false);
$ajaxUrl = (new moodle_url('/mod/productexplainer/ajax.php'))->out(false);

$PAGE->requires->css(new moodle_url('/mod/productexplainer/styles.css', ['ver' => $verStr]));
$PAGE->requires->js_call_amd('mod_productexplainer/report', 'init', [[
    'cmid'    => $cm->id,
    'sesskey' => sesskey(),
    'ajaxUrl' => $ajaxUrl,
    'backUrl' => $backUrl,
]]);

echo $OUTPUT->header();
?>
<div class="pe-report">

  <!-- ── Header ─────────────────────────────────────────────────────────── -->
  <div class="pe-rpt-header">
    <div>
      <h2 class="pe-rpt-title">Analytics: <?php echo format_string($pe->name); ?></h2>
      <p class="pe-rpt-subtitle">Student performance &amp; engagement data for this AI Slide Flow activity</p>
    </div>
    <a href="<?php echo $backUrl; ?>" class="btn btn-secondary btn-sm">Back to Activity</a>
  </div>

  <!-- ── Loading state ─────────────────────────────────────────────────── -->
  <div id="pe-rpt-loading" class="pe-rpt-loading">
    <div class="pe-rpt-spinner-lg"></div>
    <p>Loading report data&hellip;</p>
  </div>

  <!-- ── Main content (hidden until JS renders) ────────────────────────── -->
  <div id="pe-rpt-content" style="display:none">

    <!-- Tab bar -->
    <div class="pe-rpt-tabs" role="tablist">
      <button class="pe-rpt-tab pe-rpt-tab--active" data-tab="class" role="tab">Class Overview</button>
      <button class="pe-rpt-tab" data-tab="student" role="tab">Individual Student</button>
    </div>

    <!-- ── CLASS OVERVIEW TAB ──────────────────────────────────────────── -->
    <div class="pe-rpt-panel" id="pe-rpt-panel-class">

      <!-- KPI summary row -->
      <div id="pe-rpt-kpis"></div>

      <!-- Score distribution + avg donut (side by side) -->
      <div class="pe-rpt-charts-row">
        <div class="pe-rpt-chart-card" style="flex:2 1 380px" id="pe-rpt-score-dist"></div>
        <div class="pe-rpt-chart-card" style="flex:1 1 220px" id="pe-rpt-avg-donut"></div>
      </div>

      <!-- Score trend (all attempts) -->
      <div class="pe-rpt-chart-card" id="pe-rpt-timeline">
        <p class="pe-rpt-nodata">Loading&hellip;</p>
      </div>

      <!-- Knowledge check difficulty -->
      <div class="pe-rpt-chart-card" id="pe-rpt-q-difficulty">
        <p class="pe-rpt-nodata">Loading&hellip;</p>
      </div>

      <!-- Average time per slide -->
      <div class="pe-rpt-chart-card" id="pe-rpt-avg-slide-time">
        <p class="pe-rpt-nodata">Loading&hellip;</p>
      </div>

      <!-- Student leaderboard -->
      <div class="pe-rpt-chart-card" id="pe-rpt-student-table">
        <p class="pe-rpt-nodata">Loading&hellip;</p>
      </div>

      <!-- Export -->
      <div class="pe-rpt-export-row">
        <button class="btn btn-outline-secondary btn-sm" id="pe-rpt-export-class">Export Class CSV</button>
      </div>
    </div>

    <!-- ── INDIVIDUAL STUDENT TAB ───────────────────────────────────────── -->
    <div class="pe-rpt-panel pe-rpt-panel--hidden" id="pe-rpt-panel-student">

      <!-- Student selector -->
      <div class="pe-rpt-selector">
        <label for="pe-rpt-student-sel">Select student to view their results:</label>
        <select id="pe-rpt-student-sel"><option value="">Loading&hellip;</option></select>
      </div>

      <!-- Student detail (shown after selection) -->
      <div id="pe-rpt-student-detail">
        <p class="pe-rpt-nodata">Select a student above to view their results.</p>
      </div>

      <!-- Score trend -->
      <div class="pe-rpt-chart-card" id="pe-rpt-score-trend" style="display:none"></div>

      <!-- Time per slide -->
      <div class="pe-rpt-chart-card" id="pe-rpt-student-slide-times" style="display:none"></div>

      <!-- Q&A breakdown -->
      <div class="pe-rpt-chart-card" id="pe-rpt-qa-detail" style="display:none"></div>

      <!-- All attempts table -->
      <div class="pe-rpt-chart-card" id="pe-rpt-attempts-table" style="display:none"></div>

      <!-- Export -->
      <div class="pe-rpt-export-row" id="pe-rpt-student-export-row" style="display:none">
        <button class="btn btn-outline-secondary btn-sm" id="pe-rpt-export-student">Export Student CSV</button>
      </div>
    </div>

  </div><!-- /pe-rpt-content -->

</div><!-- /pe-report -->
<?php
echo $OUTPUT->footer();
