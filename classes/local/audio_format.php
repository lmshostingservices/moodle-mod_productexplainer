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
 * Narration service audio validation.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace mod_productexplainer\local;

/**
 * Validates service bytes and declared MIME before any file is written.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class audio_format {
    /**
     * Decode and validate supported narration bytes against their declared MIME.
     *
     * Missing MIME in legacy responses is inferred from the format signature.
     *
     * @param string $base64 Base64-encoded service audio.
     * @param string $type Declared MIME, optionally including parameters.
     * @return array Validated bytes, canonical MIME and safe filename extension.
     * @throws \InvalidArgumentException When encoding, size, signature or MIME is invalid.
     */
    public static function decode(string $base64, string $type = ''): array {
        $bytes = base64_decode($base64, true);
        if ($bytes === false || strlen($bytes) < 512) {
            throw new \InvalidArgumentException('The narration service returned invalid or empty audio. Existing recordings are retained.');
        }
        $detected = '';
        if (substr($bytes, 0, 4) === 'OggS') {
            $detected = 'audio/ogg';
        } else if (substr($bytes, 0, 3) === 'ID3'
                || (ord($bytes[0]) === 255 && (ord($bytes[1]) & 224) === 224
                    && (ord($bytes[1]) & 6) !== 0 && (ord($bytes[2]) & 240) !== 240
                    && (ord($bytes[2]) & 12) !== 12)) {
            $detected = 'audio/mpeg';
        } else if (substr($bytes, 0, 4) === 'RIFF' && substr($bytes, 8, 4) === 'WAVE') {
            $detected = 'audio/wav';
        }
        $type = strtolower(trim(explode(';', $type)[0]));
        $aliases = ['audio/mp3' => 'audio/mpeg', 'audio/x-wav' => 'audio/wav', 'audio/wave' => 'audio/wav',
            'application/ogg' => 'audio/ogg'];
        $type = $aliases[$type] ?? $type;
        $extensions = ['audio/ogg' => 'ogg', 'audio/mpeg' => 'mp3', 'audio/wav' => 'wav'];
        // Legacy responses omitted MIME: infer from the bytes, never assume Ogg.
        if ($detected === '' || ($type !== '' && $type !== $detected)) {
            throw new \InvalidArgumentException('The narration service returned an unsupported audio format or a MIME/signature mismatch. Existing recordings are retained.');
        }
        return ['bytes' => $bytes, 'type' => $detected, 'extension' => $extensions[$detected]];
    }
}
