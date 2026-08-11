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
    global $DB;
    $dbman = $DB->get_manager();

    // Savepoints MUST be in ascending version order.

    if ($oldversion < 2026061000002) {
        upgrade_mod_savepoint(true, 2026061000002, 'productexplainer');
    }
    if ($oldversion < 2026061000003) {
        upgrade_mod_savepoint(true, 2026061000003, 'productexplainer');
    }
    if ($oldversion < 2026061000004) {
        upgrade_mod_savepoint(true, 2026061000004, 'productexplainer');
    }
    if ($oldversion < 2026061000005) {
        upgrade_mod_savepoint(true, 2026061000005, 'productexplainer');
    }
    if ($oldversion < 2026061000006) {
        upgrade_mod_savepoint(true, 2026061000006, 'productexplainer');
    }
    if ($oldversion < 2026061000007) {
        upgrade_mod_savepoint(true, 2026061000007, 'productexplainer');
    }
    if ($oldversion < 2026061000008) {
        upgrade_mod_savepoint(true, 2026061000008, 'productexplainer');
    }
    if ($oldversion < 2026061200009) {
        upgrade_mod_savepoint(true, 2026061200009, 'productexplainer');
    }
    if ($oldversion < 2026061200010) {
        upgrade_mod_savepoint(true, 2026061200010, 'productexplainer');
    }
    if ($oldversion < 2026061200011) {
        upgrade_mod_savepoint(true, 2026061200011, 'productexplainer');
    }
    if ($oldversion < 2026061200012) {
        upgrade_mod_savepoint(true, 2026061200012, 'productexplainer');
    }
    if ($oldversion < 2026061200013) {
        upgrade_mod_savepoint(true, 2026061200013, 'productexplainer');
    }
    if ($oldversion < 2026061200014) {
        upgrade_mod_savepoint(true, 2026061200014, 'productexplainer');
    }

    // v1.0.16: accentcolor + slidetransition fields on productexplainer table.
    if ($oldversion < 2026061200016) {
        global $DB;
        $dbman = $DB->get_manager();
        $table = new xmldb_table('productexplainer');

        $fieldAccent = new xmldb_field('accentcolor', XMLDB_TYPE_CHAR, '20', null, XMLDB_NOTNULL, null, '#3b82f6', 'requirevoiceover');
        if (!$dbman->field_exists($table, $fieldAccent)) {
            $dbman->add_field($table, $fieldAccent);
        }
        $fieldTrans = new xmldb_field('slidetransition', XMLDB_TYPE_CHAR, '20', null, XMLDB_NOTNULL, null, 'slide', 'accentcolor');
        if (!$dbman->field_exists($table, $fieldTrans)) {
            $dbman->add_field($table, $fieldTrans);
        }
        upgrade_mod_savepoint(true, 2026061200016, 'productexplainer');
    }

    if ($oldversion < 2026061300017) {
        upgrade_mod_savepoint(true, 2026061300017, 'productexplainer');
    }
    if ($oldversion < 2026061300018) {
        upgrade_mod_savepoint(true, 2026061300018, 'productexplainer');
    }
    if ($oldversion < 2026061300019) {
        upgrade_mod_savepoint(true, 2026061300019, 'productexplainer');
    }
    if ($oldversion < 2026061300020) {
        upgrade_mod_savepoint(true, 2026061300020, 'productexplainer');
    }
    if ($oldversion < 2026061300021) {
        upgrade_mod_savepoint(true, 2026061300021, 'productexplainer');
    }
    if ($oldversion < 2026061300022) {
        upgrade_mod_savepoint(true, 2026061300022, 'productexplainer');
    }
    if ($oldversion < 2026061300023) {
        upgrade_mod_savepoint(true, 2026061300023, 'productexplainer');
    }
    if ($oldversion < 2026061300024) {
        upgrade_mod_savepoint(true, 2026061300024, 'productexplainer');
    }
    if ($oldversion < 2026061300025) {
        upgrade_mod_savepoint(true, 2026061300025, 'productexplainer');
    }

    // v1.0.26: completionquiz + completionquizpercent fields + productexplainer_attempts table.
    if ($oldversion < 2026061300026) {
        global $DB;
        $dbman = $DB->get_manager();
        $table = new xmldb_table('productexplainer');

        if (!$dbman->field_exists($table, 'completionquiz')) {
            $field = new xmldb_field('completionquiz', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '0', 'slidetransition');
            $dbman->add_field($table, $field);
        }
        if (!$dbman->field_exists($table, 'completionquizpercent')) {
            $field = new xmldb_field('completionquizpercent', XMLDB_TYPE_INTEGER, '3', null, XMLDB_NOTNULL, null, '100', 'completionquiz');
            $dbman->add_field($table, $field);
        }
        if (!$dbman->table_exists('productexplainer_attempts')) {
            $attempts = new xmldb_table('productexplainer_attempts');
            $attempts->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
            $attempts->add_field('productexplainerid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);
            $attempts->add_field('userid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);
            $attempts->add_field('score', XMLDB_TYPE_INTEGER, '3', null, XMLDB_NOTNULL, null, '0');
            $attempts->add_field('timecreated', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
            $attempts->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
            $attempts->add_index('userid_perid', XMLDB_INDEX_NOTUNIQUE, ['userid', 'productexplainerid']);
            $dbman->create_table($attempts);
        }
        upgrade_mod_savepoint(true, 2026061300026, 'productexplainer');
    }

    if ($oldversion < 2026061300027) {
        upgrade_mod_savepoint(true, 2026061300027, 'productexplainer');
    }
    if ($oldversion < 2026061300028) {
        upgrade_mod_savepoint(true, 2026061300028, 'productexplainer');
    }

    // v1.0.29: REPORTING-MODULE
    // Extends productexplainer_attempts with timetaken, route, slidecount, questioncount.
    // Creates productexplainer_slidetimes (per-slide dwell times).
    // Creates productexplainer_answers (per-question right/wrong).
    if ($oldversion < 2026061300029) {
        global $DB;
        $dbman = $DB->get_manager();

        // ── Extend productexplainer_attempts ────────────────────────────────
        $attTable = new xmldb_table('productexplainer_attempts');

        $fieldTimetaken = new xmldb_field('timetaken', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0', 'score');
        if (!$dbman->field_exists($attTable, $fieldTimetaken)) {
            $dbman->add_field($attTable, $fieldTimetaken);
        }
        $fieldRoute = new xmldb_field('route', XMLDB_TYPE_CHAR, '10', null, XMLDB_NOTNULL, null, '', 'timetaken');
        if (!$dbman->field_exists($attTable, $fieldRoute)) {
            $dbman->add_field($attTable, $fieldRoute);
        }
        $fieldSlidecount = new xmldb_field('slidecount', XMLDB_TYPE_INTEGER, '5', null, XMLDB_NOTNULL, null, '0', 'route');
        if (!$dbman->field_exists($attTable, $fieldSlidecount)) {
            $dbman->add_field($attTable, $fieldSlidecount);
        }
        $fieldQcount = new xmldb_field('questioncount', XMLDB_TYPE_INTEGER, '5', null, XMLDB_NOTNULL, null, '0', 'slidecount');
        if (!$dbman->field_exists($attTable, $fieldQcount)) {
            $dbman->add_field($attTable, $fieldQcount);
        }

        // ── Create productexplainer_slidetimes ───────────────────────────────
        if (!$dbman->table_exists('productexplainer_slidetimes')) {
            $t = new xmldb_table('productexplainer_slidetimes');
            $t->add_field('id',         XMLDB_TYPE_INTEGER, '10',  null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
            $t->add_field('attemptid',  XMLDB_TYPE_INTEGER, '10',  null, XMLDB_NOTNULL, null, null);
            $t->add_field('slideidx',   XMLDB_TYPE_INTEGER, '5',   null, XMLDB_NOTNULL, null, '0');
            $t->add_field('slidetype',  XMLDB_TYPE_CHAR,    '40',  null, XMLDB_NOTNULL, null, '');
            $t->add_field('slidetitle', XMLDB_TYPE_CHAR,    '255', null, XMLDB_NOTNULL, null, '');
            $t->add_field('timesecs',   XMLDB_TYPE_INTEGER, '10',  null, XMLDB_NOTNULL, null, '0');
            $t->add_key('primary',    XMLDB_KEY_PRIMARY, ['id']);
            $t->add_index('attemptid', XMLDB_INDEX_NOTUNIQUE, ['attemptid']);
            $dbman->create_table($t);
        }

        // ── Create productexplainer_answers ──────────────────────────────────
        if (!$dbman->table_exists('productexplainer_answers')) {
            $t = new xmldb_table('productexplainer_answers');
            $t->add_field('id',          XMLDB_TYPE_INTEGER, '10',  null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
            $t->add_field('attemptid',   XMLDB_TYPE_INTEGER, '10',  null, XMLDB_NOTNULL, null, null);
            $t->add_field('qidx',        XMLDB_TYPE_INTEGER, '5',   null, XMLDB_NOTNULL, null, '0');
            $t->add_field('qtext',       XMLDB_TYPE_CHAR,    '255', null, XMLDB_NOTNULL, null, '');
            $t->add_field('selectedidx', XMLDB_TYPE_INTEGER, '3',   null, XMLDB_NOTNULL, null, '0');
            $t->add_field('correctidx',  XMLDB_TYPE_INTEGER, '3',   null, XMLDB_NOTNULL, null, '0');
            $t->add_field('iscorrect',   XMLDB_TYPE_INTEGER, '1',   null, XMLDB_NOTNULL, null, '0');
            $t->add_key('primary',    XMLDB_KEY_PRIMARY, ['id']);
            $t->add_index('attemptid', XMLDB_INDEX_NOTUNIQUE, ['attemptid']);
            $dbman->create_table($t);
        }

        upgrade_mod_savepoint(true, 2026061300029, 'productexplainer');
    }

    if ($oldversion < 2026061700068) {
        global $DB;
        $dbman = $DB->get_manager();
        $table = new xmldb_table('productexplainer');

        $fieldEnableCert = new xmldb_field('enablecertificate', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '0', 'completionquizpercent');
        if (!$dbman->field_exists($table, $fieldEnableCert)) {
            $dbman->add_field($table, $fieldEnableCert);
        }

        $fieldCpdPoints = new xmldb_field('cpdpoints', XMLDB_TYPE_INTEGER, '5', null, XMLDB_NOTNULL, null, '0', 'enablecertificate');
        if (!$dbman->field_exists($table, $fieldCpdPoints)) {
            $dbman->add_field($table, $fieldCpdPoints);
        }

        $fieldCertPdf = new xmldb_field('certificatepdf', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '1', 'cpdpoints');
        if (!$dbman->field_exists($table, $fieldCertPdf)) {
            $dbman->add_field($table, $fieldCertPdf);
        }

        upgrade_mod_savepoint(true, 2026061700068, 'productexplainer');
    }

    if ($oldversion < 2026061800081) {
        // FIX-TESTER-FEEDBACK-V6: CSS and JS fixes only — no DB schema changes.
        // Savepoint required for version progression.
        upgrade_mod_savepoint(true, 2026061800081, 'productexplainer');
    }

    if ($oldversion < 2026061800082) {
        // FIX-TESTER-FEEDBACK-V7: CSS and JS fixes only — no DB schema changes.
        // (1) Must-watch label now visible on light add-slide panel background.
        // (2) Image slides use object-fit:contain to preserve original aspect ratio.
        // (3) "Back to Slides" returns student to Slide 1 (not last slide).
        upgrade_mod_savepoint(true, 2026061800082, 'productexplainer');
    }

    if ($oldversion < 2026061900083) {
        // FEAT-QUIZ-EDITOR: Quiz Questions editor in builder view — no DB schema changes.
        // Teachers can now edit question text, answer options, correct answer, and
        // feedback/explanation directly from the slide builder before saving.
        upgrade_mod_savepoint(true, 2026061900083, 'productexplainer');
    }

    if ($oldversion < 2026061900084) {
        // FIX-QUIZ-ANSWER-PADDING: More padding between question textarea and answer
        // options in the quiz editor. No DB schema changes.
        upgrade_mod_savepoint(true, 2026061900084, 'productexplainer');
    }

    if ($oldversion < 2026061900085) {
        // FEAT-QUIZ-COUNT: Teachers can now choose how many quiz questions to generate
        // (1–10) in both Product and Concept builder forms. No DB schema changes.
        upgrade_mod_savepoint(true, 2026061900085, 'productexplainer');
    }

    if ($oldversion < 2026061900086) {
        // FEAT-CERT-LOGO: New certificatelogourl field lets teachers paste their own
        // logo URL for the completion certificate. Also fixes "Authorised by AI Grader"
        // to use the actual site name.
        $table = new xmldb_table('productexplainer');
        $field = new xmldb_field('certificatelogourl', XMLDB_TYPE_CHAR, '1333', null, false, null, '', 'certificatepdf');
        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }
        upgrade_mod_savepoint(true, 2026061900086, 'productexplainer');
    }

    if ($oldversion < 2026061900090) {
        // FIX-QUIZ-VOICE-CONSISTENCY: Quiz narration now uses the same voice as slide
        // voiceovers. manifest.voiceStyle saved at generation time; speakQuizText() and
        // prefetchFeedbackTts() read manifest.voiceStyle as primary, cfg.voiceStyle as
        // fallback. No DB schema changes.
        upgrade_mod_savepoint(true, 2026061900090, 'productexplainer');
    }

    if ($oldversion < 2026062200093) {
        // VERSION-TRACKING-FIX: Formal version bump to surface quiz-voice fixes in the
        // plugin directory. v1.0.92 shipped FIX-QUIZ-VOICE-BROKEN and
        // FIX-QUIZ-VOICE-CONSISTENCY in the same release. No DB schema changes.
        upgrade_mod_savepoint(true, 2026062200093, 'productexplainer');
    }

    if ($oldversion < 2026062200094) {
        // v1.0.94 - FIX-TESTER-FEEDBACK-V8: Three fixes for web app + SCORM/HTML5 export.
        // (1) SCORM-KC-ONE-AT-A-TIME: renderQuiz() in SCORM/HTML5 INLINE_PLAYER_JS rewritten
        //     to show one question per screen instead of all at once. Adds progress bar,
        //     question counter, "Check Answer" button (disabled until selection made),
        //     correct/incorrect feedback block with explanation, "Next Question"/"See Results"
        //     navigation, and final score screen with "Finish Module" button.
        // (2) SCORM-KC-NARRATION-CHROME-FIX: Web Speech API narration added to SCORM KC.
        //     sfSpeak() uses cancel() + 50ms setTimeout before every speak() call — prevents
        //     Q2+ narration delay caused by Chrome's synthesiser not being fully idle between
        //     utterances. Question text narrated on display; feedback narrated after Check Answer.
        //     voiceLanguage from manifest used as utterance lang (defaults to en-AU).
        // (3) PRE-GEN-PREFERENCES: Language (11 locales), Voice (Female=Aoede/Male=Charon),
        //     Slide count (4-6), Quiz question count now shown before generation on both
        //     Product Explainer and Concept Explainer modes. Values stored in manifest
        //     (manifest.voiceLanguage, manifest.voiceName) and used for studio voiceover.
        // No DB schema changes.
        upgrade_mod_savepoint(true, 2026062200094, 'productexplainer');
    }

    // v1.0.97 - FIX-XMLDB-DEFAULT: Removed empty-string DEFAULT from NOTNULL CHAR fields
    // in install.xml (route, slidetype, slidetitle, qtext, certificatelogourl).
    // Source-only fix — no DB schema changes. Stops XMLDB debugging warnings on sites
    // running local_adminer or similar XMLDB scanners.
    if ($oldversion < 2026071500097) {
        if (function_exists('opcache_invalidate')) {
            $_pluginDir = realpath(__DIR__ . '/..');
            foreach (['version.php', 'db/upgrade.php', 'db/install.xml'] as $_f) {
                $_full = $_pluginDir . '/' . $_f;
                if (file_exists($_full)) {
                    opcache_invalidate($_full, true);
                }
            }
        } elseif (function_exists('opcache_reset')) {
            opcache_reset();
        }
        upgrade_mod_savepoint(true, 2026071500097, 'productexplainer');
    }

    // v1.0.98: ADD-BACKUP-RESTORE — Added full Moodle backup/restore support.
    //   Fixes stuck progress when a teacher copies or deletes the activity.
    //   Backs up manifest JSON; optionally backs up attempts, slide times and answers.
    //   No DB schema changes.
    if ($oldversion < 2026072200098) {
        if (function_exists('opcache_invalidate')) {
            $_pluginDir = realpath(__DIR__ . '/..');
            foreach (['version.php', 'db/upgrade.php', 'backup/moodle2/backup_productexplainer_activity_task.class.php', 'backup/moodle2/restore_productexplainer_activity_task.class.php'] as $_f) {
                $_full = $_pluginDir . '/' . $_f;
                if (file_exists($_full)) {
                    opcache_invalidate($_full, true);
                }
            }
        } elseif (function_exists('opcache_reset')) {
            opcache_reset();
        }
        upgrade_mod_savepoint(true, 2026072200098, 'productexplainer');
    }

    if ($oldversion < 2026072300230) {
        // FIX-API-DOMAIN: Updated all API endpoint URLs from lms-labs.com to lms-labs.com.
        // lms-labs.com has no DNS resolution from Moodle server side; lms-labs.com is the
        // correct working domain. All ajax.php, api_client, unlock_verifier, lib.php calls updated.
        if (function_exists('opcache_invalidate')) {
            $_pluginDir = realpath(__DIR__ . '/..');
            foreach (['version.php', 'db/upgrade.php'] as $_f) {
                $_full = $_pluginDir . '/' . $_f;
                if (file_exists($_full)) {
                    opcache_invalidate($_full, true);
                }
            }
        } elseif (function_exists('opcache_reset')) {
            opcache_reset();
        }
        upgrade_mod_savepoint(true, 2026072300230, 'productexplainer');
    }

    if ($oldversion < 2026072300231) {
        // FIX-API-DOMAIN: Reverted API endpoint to lms-labs.com (correct domain).
        // essaygraderai.app was the original single-plugin domain; lms-labs.com is correct.
        if (function_exists('opcache_invalidate')) {
            $_pluginDir = realpath(__DIR__ . '/..');
            foreach (['version.php', 'db/upgrade.php'] as $_f) {
                $_full = $_pluginDir . '/' . $_f;
                if (file_exists($_full)) { opcache_invalidate($_full, true); }
            }
        } elseif (function_exists('opcache_reset')) { opcache_reset(); }
        upgrade_mod_savepoint(true, 2026072300231, 'productexplainer');
    }

    if ($oldversion < 2026072300232) {
        // Domain update: lms-labs.com → lms-labs.com
        if (function_exists('opcache_invalidate')) {
            $_pluginDir = realpath(__DIR__ . '/..');
            foreach (['version.php', 'lib.php', 'db/upgrade.php'] as $_f) {
                $_full = $_pluginDir . '/' . $_f;
                if (file_exists($_full)) { opcache_invalidate($_full, true); }
            }
        } elseif (function_exists('opcache_reset')) { opcache_reset(); }
        upgrade_mod_savepoint(true, 2026072300232, 'productexplainer');
    }

    return true;
}