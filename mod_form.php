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
 * Activity settings form for mod_productexplainer.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/course/moodleform_mod.php');

class mod_productexplainer_mod_form extends moodleform_mod {
    public function definition() {
        global $CFG, $PAGE;
        $mform = $this->_form;

        $mform->addElement('header', 'general', get_string('general', 'form'));

        $mform->addElement('text', 'name', get_string('name'), ['size' => '64']);
        $mform->setType('name', PARAM_TEXT);
        $mform->addRule('name', null, 'required', null, 'client');
        $mform->addRule('name', get_string('maximumchars', '', 255), 'maxlength', 255, 'client');

        $this->standard_intro_elements();

        // Credit cost info — always visible so teachers know before configuring.
        $credithtml  = '<div style="padding:12px 14px;background:#f0fdf4;border:1px solid #22c55e;border-radius:8px;margin:4px 0 8px;">';
        $credithtml .= '<strong style="color:#15803d;font-size:0.95em;">AI credit costs for this activity</strong>';
        $credithtml .= '<table style="margin-top:8px;border-collapse:collapse;width:100%;font-size:0.88em;">';
        $credithtml .= '<tr>'
            . '<td style="padding:4px 12px 4px 0;font-weight:600;">Generate 6 training slides</td>'
            . '<td style="padding:4px 8px 4px 0;color:#15803d;font-weight:700;white-space:nowrap;">10 credits</td>'
            . '<td style="padding:4px 0;color:#6b7280;">Charged once per generation (re-generating replaces old slides)</td>'
            . '</tr>';
        $credithtml .= '<tr>'
            . '<td style="padding:4px 12px 4px 0;font-weight:600;">AI voiceover per slide</td>'
            . '<td style="padding:4px 8px 4px 0;color:#d97706;font-weight:700;white-space:nowrap;">3 credits</td>'
            . '<td style="padding:4px 0;color:#6b7280;">Only if voiceover is enabled &mdash; full set of 6 slides = 18 credits</td>'
            . '</tr>';
        $credithtml .= '<tr>'
            . '<td style="padding:4px 12px 4px 0;font-weight:600;">Students viewing / replaying</td>'
            . '<td style="padding:4px 8px 4px 0;color:#6b7280;font-weight:700;">Free</td>'
            . '<td style="padding:4px 0;color:#6b7280;">No credits charged when students view or replay</td>'
            . '</tr>';
        $credithtml .= '</table>';
        $credithtml .= '<p style="margin:8px 0 0;font-size:0.82em;color:#374151;">'
            . 'Worst case (slides + all voiceovers): <strong>28 credits = $2.80 AUD</strong>. '
            . 'Slides without voiceover: <strong>10 credits = $1.00 AUD</strong>.</p>';
        $credithtml .= '</div>';
        $mform->addElement('static', 'creditinfo_always', get_string('creditcosts', 'productexplainer'), $credithtml);

        $mform->addElement('header', 'voiceoverheading', get_string('voiceover', 'productexplainer'));

        $mform->addElement('selectyesno', 'enablevoiceover', get_string('enablevoiceover', 'productexplainer'));
        $mform->addHelpButton('enablevoiceover', 'enablevoiceover', 'productexplainer');
        $mform->setDefault('enablevoiceover', 0);

        $languages = [
            'ar-XA'   => 'Arabic',
            'bn-IN'   => 'Bengali (India)',
            'bg-BG'   => 'Bulgarian',
            'yue-HK'  => 'Cantonese (Hong Kong)',
            'ca-ES'   => 'Catalan (Spain)',
            'hr-HR'   => 'Croatian',
            'cs-CZ'   => 'Czech',
            'da-DK'   => 'Danish',
            'nl-BE'   => 'Dutch (Belgium)',
            'nl-NL'   => 'Dutch (Netherlands)',
            'en-AU'   => 'English (Australian)',
            'en-GB'   => 'English (British)',
            'en-IN'   => 'English (Indian)',
            'en-US'   => 'English (American)',
            'et-EE'   => 'Estonian',
            'fil-PH'  => 'Filipino (Philippines)',
            'fi-FI'   => 'Finnish',
            'fr-CA'   => 'French (Canadian)',
            'fr-FR'   => 'French (France)',
            'de-DE'   => 'German',
            'el-GR'   => 'Greek',
            'gu-IN'   => 'Gujarati (India)',
            'he-IL'   => 'Hebrew',
            'hi-IN'   => 'Hindi (India)',
            'hu-HU'   => 'Hungarian',
            'is-IS'   => 'Icelandic',
            'id-ID'   => 'Indonesian',
            'it-IT'   => 'Italian',
            'ja-JP'   => 'Japanese',
            'kn-IN'   => 'Kannada (India)',
            'ko-KR'   => 'Korean',
            'lv-LV'   => 'Latvian',
            'lt-LT'   => 'Lithuanian',
            'ms-MY'   => 'Malay (Malaysia)',
            'ml-IN'   => 'Malayalam (India)',
            'cmn-CN'  => 'Mandarin Chinese (China)',
            'cmn-TW'  => 'Mandarin Chinese (Taiwan)',
            'mr-IN'   => 'Marathi (India)',
            'nb-NO'   => 'Norwegian',
            'pl-PL'   => 'Polish',
            'pt-BR'   => 'Portuguese (Brazil)',
            'pt-PT'   => 'Portuguese (Portugal)',
            'pa-IN'   => 'Punjabi (India)',
            'ro-RO'   => 'Romanian',
            'ru-RU'   => 'Russian',
            'sr-RS'   => 'Serbian',
            'sk-SK'   => 'Slovak',
            'sl-SI'   => 'Slovenian',
            'es-ES'   => 'Spanish (Spain)',
            'es-US'   => 'Spanish (US)',
            'sw-KE'   => 'Swahili',
            'sv-SE'   => 'Swedish',
            'ta-IN'   => 'Tamil (India)',
            'te-IN'   => 'Telugu (India)',
            'th-TH'   => 'Thai',
            'tr-TR'   => 'Turkish',
            'uk-UA'   => 'Ukrainian',
            'ur-IN'   => 'Urdu',
            'vi-VN'   => 'Vietnamese',
        ];
        $mform->addElement('select', 'voicelanguage', get_string('voicelanguage', 'productexplainer'), $languages);
        $mform->setDefault('voicelanguage', 'en-AU');
        $mform->hideIf('voicelanguage', 'enablevoiceover', 'eq', 0);

        $voices = [
            'Zephyr'  => 'Zephyr (bright, female)',
            'Aoede'   => 'Aoede (warm, female)',
            'Kore'    => 'Kore (clear, female)',
            'Leda'    => 'Leda (gentle, female)',
            'Orus'    => 'Orus (smooth, male)',
            'Charon'  => 'Charon (deep, male)',
            'Fenrir'  => 'Fenrir (strong, male)',
            'Puck'    => 'Puck (friendly, male)',
        ];
        $mform->addElement('select', 'voicestyle', get_string('voicestyle', 'productexplainer'), $voices);
        $mform->setDefault('voicestyle', 'Zephyr');
        $mform->hideIf('voicestyle', 'enablevoiceover', 'eq', 0);

        $mform->addElement('selectyesno', 'requirevoiceover', get_string('requirevoiceover', 'productexplainer'));
        $mform->setDefault('requirevoiceover', 1);
        $mform->hideIf('requirevoiceover', 'enablevoiceover', 'eq', 0);

        $mform->addElement('header', 'appearanceheading', get_string('appearanceheading', 'productexplainer'));

        $mform->addElement('text', 'accentcolor', get_string('accentcolor', 'productexplainer'), ['maxlength' => 20, 'size' => 12]);
        $mform->setType('accentcolor', PARAM_TEXT);
        $defaultaccentcolor = '#3b82f6';
        // Method 1: theme_config::load() — most reliable, reads DB directly.
        try {
            $themeconfig = \theme_config::load($PAGE->theme->name);
            if (!empty($themeconfig->settings->brandcolor)) {
                $defaultaccentcolor = $themeconfig->settings->brandcolor;
            } else if (!empty($themeconfig->settings->primarycolor)) {
                $defaultaccentcolor = $themeconfig->settings->primarycolor;
            } else if (!empty($themeconfig->settings->primary)) {
                $defaultaccentcolor = $themeconfig->settings->primary;
            }
        } catch (\Exception $e) {
            // Fall through to next method.
        }
        // Method 2: get_config() for current theme — works when $PAGE->theme isn't populated.
        if ($defaultaccentcolor === '#3b82f6') {
            $themename = !empty($PAGE->theme->name) ? $PAGE->theme->name : '';
            if (!empty($themename)) {
                $bc = get_config('theme_' . $themename, 'brandcolor');
                if (!empty($bc)) {
                    $defaultaccentcolor = $bc;
                } else {
                    $pc = get_config('theme_' . $themename, 'primarycolor');
                    if (!empty($pc)) {
                        $defaultaccentcolor = $pc;
                    }
                }
            }
        }
        // Method 3: parent theme traversal.
        if ($defaultaccentcolor === '#3b82f6' && !empty($PAGE->theme->name)) {
            try {
                $themeconfig = \theme_config::load($PAGE->theme->name);
                if (!empty($themeconfig->parents)) {
                    foreach ($themeconfig->parents as $parent) {
                        $pc = get_config('theme_' . $parent, 'brandcolor');
                        if (!empty($pc)) {
                            $defaultaccentcolor = $pc;
                            break;
                        }
                    }
                }
            } catch (\Exception $e) { /* fall through */ }
        }
        // Method 4: Boost fallback.
        if ($defaultaccentcolor === '#3b82f6') {
            $bc = get_config('theme_boost', 'brandcolor');
            if (!empty($bc)) {
                $defaultaccentcolor = $bc;
            }
        }
        $mform->setDefault('accentcolor', $defaultaccentcolor);
        $mform->addHelpButton('accentcolor', 'accentcolor', 'productexplainer');

        $transitions = [
            'slide'    => get_string('transition_slide', 'productexplainer'),
            'fade'     => get_string('transition_fade', 'productexplainer'),
            'slide-up' => get_string('transition_slideup', 'productexplainer'),
            'zoom'     => get_string('transition_zoom', 'productexplainer'),
        ];
        $mform->addElement('select', 'slidetransition', get_string('slidetransition', 'productexplainer'), $transitions);
        $mform->setDefault('slidetransition', 'slide');
        $mform->addHelpButton('slidetransition', 'slidetransition', 'productexplainer');

        $mform->addElement('header', 'certificateheading', get_string('certificateheading', 'productexplainer'));

        $mform->addElement('selectyesno', 'enablecertificate', get_string('enablecertificate', 'productexplainer'));
        $mform->setDefault('enablecertificate', 0);
        $mform->addHelpButton('enablecertificate', 'enablecertificate', 'productexplainer');

        $mform->addElement('text', 'cpdpoints', get_string('cpdpoints', 'productexplainer'), ['size' => '5']);
        $mform->setType('cpdpoints', PARAM_INT);
        $mform->setDefault('cpdpoints', 0);
        $mform->addHelpButton('cpdpoints', 'cpdpoints', 'productexplainer');
        $mform->disabledIf('cpdpoints', 'enablecertificate', 'eq', 0);

        $mform->addElement('selectyesno', 'certificatepdf', get_string('certificatepdf', 'productexplainer'));
        $mform->setDefault('certificatepdf', 1);
        $mform->addHelpButton('certificatepdf', 'certificatepdf', 'productexplainer');
        $mform->disabledIf('certificatepdf', 'enablecertificate', 'eq', 0);

        $mform->addElement('text', 'certificatelogourl', get_string('certificatelogourl', 'productexplainer'), ['size' => '60']);
        $mform->setType('certificatelogourl', PARAM_URL);
        $mform->setDefault('certificatelogourl', '');
        $mform->addHelpButton('certificatelogourl', 'certificatelogourl', 'productexplainer');
        $mform->disabledIf('certificatelogourl', 'enablecertificate', 'eq', 0);

        $this->standard_coursemodule_elements();
        $this->add_action_buttons();
    }

    public function add_completion_rules() {
        $mform = $this->_form;

        $mform->addElement('checkbox', 'completionquiz', '', get_string('completionquiz', 'productexplainer'));
        $mform->addHelpButton('completionquiz', 'completionquiz', 'productexplainer');

        $options = [
            100 => '100%',
            90  => '90%',
            80  => '80%',
            70  => '70%',
            60  => '60%',
            50  => '50%',
        ];
        $mform->addElement('select', 'completionquizpercent', get_string('completionquizpercent', 'productexplainer'), $options);
        $mform->setDefault('completionquizpercent', 100);
        $mform->hideIf('completionquizpercent', 'completionquiz', 'notchecked');

        return ['completionquiz'];
    }

    public function completion_rule_enabled($data) {
        return !empty($data['completionquiz']);
    }

    public function data_postprocessing($data) {
        parent::data_postprocessing($data);
        if (isset($data->completionunlocked)) {
            if (empty($data->completionquiz)) {
                $data->completionquiz = 0;
            }
        }
    }
}
