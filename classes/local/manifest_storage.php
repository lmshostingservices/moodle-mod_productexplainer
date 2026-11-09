<?php
// This file is part of Moodle - https://moodle.org/
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
// along with Moodle. If not, see <https://www.gnu.org/licenses/>.

namespace mod_productexplainer\local;

defined('MOODLE_INTERNAL') || die();

/**
 * The single storage boundary for generated Product Explainer manifests.
 *
 * @package    mod_productexplainer
 * @copyright  2026 LMS Hosting Services
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
final class manifest_storage {
    /**
     * Decode an activity's stored manifest, including the compressed representation.
     *
     * @param string|null $raw
     * @return array|null
     */
    public static function decode(?string $raw): ?array {
        if ($raw === null || $raw === '') {
            return null;
        }
        if (strncmp($raw, 'gz:', 3) === 0) {
            $decoded = gzdecode(base64_decode(substr($raw, 3), true) ?: '');
            if ($decoded === false) {
                return null;
            }
            $raw = $decoded;
        }
        $manifest = json_decode($raw, true);
        return is_array($manifest) && isset($manifest['slides']) && is_array($manifest['slides'])
            ? $manifest : null;
    }

    /**
     * Validate and store a generated manifest using Product Explainer's persisted format.
     *
     * @param \stdClass $activity
     * @param array $manifest
     * @param bool $requirevoiceover Whether every slide must have current narration.
     * @return void
     */
    public static function save(\stdClass $activity, array $manifest, bool $requirevoiceover = false): void {
        global $DB;
        if (empty($manifest['slides']) || !is_array($manifest['slides'])) {
            throw new \moodle_exception('invalidslides', 'mod_productexplainer');
        }
        foreach ($manifest['slides'] as &$slide) {
            if (!is_array($slide) || ($requirevoiceover && narration::incomplete($slide))) {
                throw new \moodle_exception('narrationincomplete', 'mod_productexplainer');
            }
            $slide['narrationScript'] = narration::resolve($slide);
        }
        unset($slide);

        $json = json_encode($manifest, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        $stored = 'gz:' . base64_encode(gzencode($json, 6));
        $DB->set_field('productexplainer', 'manifestjson', $stored, ['id' => (int)$activity->id]);
        $DB->set_field('productexplainer', 'timemodified', time(), ['id' => (int)$activity->id]);
        $activity->manifestjson = $stored;
        $activity->timemodified = time();
    }
}
