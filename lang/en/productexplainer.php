<?php
/**
 * Language strings for mod_productexplainer
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$string['modulename'] = 'AI Slide Flow';
$string['modulenameplural'] = 'AI Slide Flows';
$string['modulename_help'] = 'Create AI-powered training slides in two modes: Product Slides (upload a product document and generate structured retail training slides) or Concept Slides (teach any workplace concept with 7 fixed AI-structured slides and AI-generated images). Generating slides costs 10 credits. Concept images are 2 credits each. Voiceover narration is 3 credits per slide.';
$string['pluginname'] = 'AI Slide Flow';
$string['pluginadministration'] = 'AI Slide Flow administration';

$string['productexplainer:addinstance'] = 'Add a new AI Slide Flow activity';
$string['productexplainer:view'] = 'View AI Slide Flow';
$string['productexplainer:manage'] = 'Manage AI Slide Flow content';

$string['name'] = 'Activity name';

$string['creditcosts'] = 'Credit costs';
$string['voiceover'] = 'Voiceover settings';
$string['enablevoiceover'] = 'Enable voiceover';
$string['enablevoiceover_help'] = 'When enabled, a teacher can add AI-generated voiceover narration to each slide. Each slide costs 3 credits to narrate. Students replay voiceovers for free — no credits are charged during student viewing. When voiceover is enabled it will automatically play when each slide loads.';
$string['voicelanguage'] = 'Voiceover language';
$string['voicelanguage_help'] = 'Language for the AI voiceover narration.';
$string['voicestyle'] = 'Voiceover voice';
$string['voicestyle_help'] = 'Choose the AI voice for narration.';
$string['requirevoiceover'] = 'Require voiceover before advancing';
$string['requirevoiceover_help'] = 'If enabled, students must listen to the full voiceover before the Next arrow becomes active and they can advance to the next slide.';

$string['appearanceheading'] = 'Appearance &amp; transitions';
$string['accentcolor'] = 'Slide accent colour';
$string['accentcolor_help'] = 'Choose the highlight colour used for icons, headings, progress bar and slide dots. Enter a hex colour code (e.g. #3b82f6 for blue, #10b981 for green, #f59e0b for amber). Leave blank to use the default blue.';
$string['slidetransition'] = 'Slide transition effect';
$string['slidetransition_help'] = 'Choose how slides animate when the student navigates between them.';
$string['transition_fade'] = 'Fade';
$string['transition_slide'] = 'Slide left / right';
$string['transition_slideup'] = 'Slide up / down';
$string['transition_zoom'] = 'Zoom in / out';

$string['siteid'] = 'Site ID';
$string['siteid_desc'] = 'Your AI Grader Site ID (from local_aiconfig or plugin settings).';
$string['apikey'] = 'API Key';
$string['apikey_desc'] = 'Your AI Grader API Key.';

$string['nocontentyet'] = 'No slides generated yet.';
$string['editslides'] = 'Edit slides';
$string['previous'] = 'Previous';
$string['next'] = 'Next';
$string['slidecount'] = 'Slide {$a->current} of {$a->total}';

$string['privacy:metadata'] = 'The AI Slide Flow activity stores the generated slide manifest in the database. No personal data is stored beyond Moodle\'s standard activity completion tracking.';

$string['completionquiz'] = 'Pass the knowledge quiz';
$string['completionquiz_desc'] = 'Student must pass the knowledge quiz';
$string['completionquizpercent'] = 'Minimum score required';
$string['completionquiz_help'] = 'When enabled, the activity is only marked complete after the student achieves the required score on the knowledge quiz at the end of the slides.';

$string['certificateheading'] = 'Completion certificate';
$string['enablecertificate'] = 'Enable certificate';
$string['enablecertificate_help'] = 'When enabled, students receive a beautiful landscape certificate of completion once they finish all slides (and pass the quiz if one is required). The certificate displays the site logo, accent colour, student name, and activity name.';
$string['cpdpoints'] = 'CPD points';
$string['cpdpoints_help'] = 'Number of Continuing Professional Development (CPD) points to display on the certificate. Set to 0 to hide the CPD points section.';
$string['certificatepdf'] = 'Allow PDF download';
$string['certificatepdf_help'] = "If enabled, students can download a PDF copy of their certificate using their browser's print-to-PDF feature.";
$string['certificatelogourl'] = 'Certificate logo URL';
$string['certificatelogourl_help'] = 'Paste the full URL of your organisation logo to display on the completion certificate (e.g. https://yoursite.com/logo.png). Leave blank to use the Moodle site logo if one is configured, or the site name as text.';
