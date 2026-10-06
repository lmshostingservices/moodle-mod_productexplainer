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
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle. If not, see <http://www.gnu.org/licenses/>.

/**
 * Standalone canonical narration, export and MIME regression harness.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
require_once(__DIR__ . '/../classes/local/narration.php');
require_once(__DIR__ . '/../classes/local/audio_format.php');
require_once(__DIR__ . '/../classes/local/exporter.php');
use mod_productexplainer\local\narration;
use mod_productexplainer\local\audio_format;
use mod_productexplainer\local\exporter;
function format_string($value) { return htmlspecialchars($value); }
function userdate($value) { return '2026-07-17'; }
function check($value, $message) {
    if (!$value) { fwrite(STDERR, $message . "\n"); exit(1); }
}
$slides = json_decode(stream_get_contents(STDIN), true);
$scripts = array_map([narration::class, 'resolve'], $slides);
$pe = (object)['id' => 42, 'name' => 'Safety & practice', 'manifestjson' => json_encode(['slides' => $slides]),
    'enablevoiceover' => 1, 'voicelanguage' => 'fr-CA', 'voicestyle' => 'Leda'];
$course = (object)['fullname' => 'Workplace learning', 'shortname' => 'WORK'];
$export = new exporter($pe, $course);
check(array_column($export->to_array()['slides'], 'narration') === $scripts, 'JSON export differs from canonical TTS script');
check(strpos($export->to_text(), 'Teacher exact script!') !== false, 'Text export ignores teacher override');
check(strpos($export->to_markdown(), 'Teacher exact script!') !== false, 'Markdown export ignores teacher override');
check(!narration::incomplete(['voiceoverUrl' => '/old.ogg', 'title' => 'Existing']), 'Legacy audio was gratuitously blocked');
check(narration::incomplete(['voiceoverUrl' => '/old.ogg', 'title' => 'Changed', 'generatedNarrationText' => 'Original.']), 'Stale audio was not blocked');
check(!narration::incomplete(['narrationRequested' => true, 'narrationOmitted' => true]), 'Explicit omission was blocked');
check(narration::incomplete(['narrationRequested' => true]), 'Missing requested audio was not blocked');
$valid = [
    ['OggS' . str_repeat("\0", 600), 'audio/ogg', 'ogg'],
    ['ID3' . str_repeat("\0", 600), 'audio/mpeg', 'mp3'],
    ["\xff\xfb\x90\x00" . str_repeat("\0", 600), '', 'mp3'],
    ['RIFF' . "\0\0\0\0" . 'WAVE' . str_repeat("\0", 600), 'audio/x-wav', 'wav'],
];
foreach ($valid as [$bytes, $type, $extension]) {
    $format = audio_format::decode(base64_encode($bytes), $type);
    check($format['bytes'] === $bytes && $format['extension'] === $extension, 'Wrong MIME mapping');
}
$invalid = [
    ['!not base64!', 'audio/ogg'],
    [base64_encode(str_repeat('junk', 200)), 'audio/mpeg'],
    [base64_encode('OggS'), 'audio/ogg'],
    [base64_encode('OggS' . str_repeat("\0", 600)), 'audio/mpeg'],
    [base64_encode('ID3' . str_repeat("\0", 600)), 'text/html'],
];
foreach ($invalid as [$bytes, $type]) {
    try { audio_format::decode($bytes, $type); check(false, 'Invalid audio was accepted'); }
    catch (InvalidArgumentException $e) { /* Expected. */ }
}
echo json_encode(['scripts' => $scripts, 'fields' => narration::FIELDS, 'nested' => narration::NESTED, 'mimeTests' => count($valid) + count($invalid)]);
