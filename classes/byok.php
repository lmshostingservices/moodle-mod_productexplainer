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

namespace mod_productexplainer;

use mod_productexplainer\local\byok\engine;

/**
 * Bring your own AI: Slide Flow work that runs on the site's own AI instead of LMS Labs credits.
 *
 * AI Grader Central Config (local_aiconfig) decides, for each kind of work, whether it runs on LMS Labs credits,
 * the Moodle AI subsystem or the site's own key. Slide text, slide pictures and narration are decided separately,
 * so a site can write slides on its own AI and still narrate on credits. Work on the site's own AI runs the service's
 * own logic (local\byok\engine) inside this Moodle site and answers exactly as the service would.
 *
 * @package    mod_productexplainer
 * @copyright  2026 LMS Hosting Services
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class byok {
    /** The component Central Config knows this plugin by. */
    const COMPONENT = 'mod_productexplainer';
    /** Seconds one text call may take: a 20-slide deck is a long answer. */
    const TEXT_TIMEOUT = 240;
    /** Seconds a request may run while the site's own AI writes a deck. */
    const TIME_LIMIT = 300;
    /** The plugin's Google voices, and the closest OpenAI voice for each. */
    const OPENAI_VOICES = ['Aoede' => 'nova', 'Kore' => 'shimmer', 'Leda' => 'coral', 'Zephyr' => 'sage',
        'Puck' => 'onyx', 'Charon' => 'echo', 'Fenrir' => 'ash', 'Orus' => 'ballad'];
    /** What the routes need in siteId and apiKey when nothing goes to LMS Labs. */
    const NO_CREDENTIALS = 'byok';

    /**
     * Whether a kind of work runs on the site's own AI now.
     *
     * @param string $kind text, image or voice.
     * @return bool
     */
    public static function uses(string $kind): bool {
        return class_exists('\local_aiconfig\byok\ai') && \local_aiconfig\byok\ai::uses_own_ai(self::COMPONENT, $kind);
    }

    /**
     * Which kinds of work run on the site's own AI, for the page.
     *
     * @return array text, image, voice => bool.
     */
    public static function state(): array {
        return ['text' => self::uses('text'), 'image' => self::uses('image'), 'voice' => self::uses('voice')];
    }

    /**
     * Write a product deck (POST /api/moodle/product-explainer/generate) on the site's own AI.
     *
     * @param array $payload The request the plugin would send to LMS Labs.
     * @return array The service's answer.
     */
    public static function product(array $payload): array {
        \core_php_time_limit::raise(self::TIME_LIMIT);
        self::hooks();
        return self::answer(engine::product(self::strings($payload)));
    }

    /**
     * Write a concept deck (POST /api/moodle/concept-explainer/generate) on the site's own AI.
     *
     * @param array $payload
     * @return array
     */
    public static function concept(array $payload): array {
        \core_php_time_limit::raise(self::TIME_LIMIT);
        self::hooks();
        return self::answer(engine::concept(self::credentials($payload)));
    }

    /**
     * Make one slide picture (POST /api/moodle/concept-explainer/generate-image) on the site's own AI.
     *
     * @param array $payload
     * @return array
     */
    public static function image(array $payload): array {
        \core_php_time_limit::raise(self::TIME_LIMIT);
        self::hooks();
        return self::answer(engine::image(self::credentials($payload)));
    }

    /**
     * Narrate a piece of text (POST /api/moodle/content-creator/tts) on the site's own voice.
     *
     * @param array $payload
     * @return array
     */
    public static function tts(array $payload): array {
        self::hooks();
        return self::answer(engine::tts(self::strings($payload)));
    }

    /**
     * The service's answer, marked as made on the site's own AI.
     *
     * @param array $result [status, body] from the engine.
     * @return array
     */
    protected static function answer(array $result): array {
        [, $body] = $result;
        $body['ownai'] = true;
        return $body;
    }

    /**
     * The credentials as strings, as the plugin sends them to LMS Labs when they are not set.
     *
     * @param array $payload
     * @return array
     */
    protected static function strings(array $payload): array {
        foreach (['siteId', 'apiKey'] as $key) {
            $payload[$key] = (string) ($payload[$key] ?? '');
        }
        return $payload;
    }

    /**
     * Fill in the credentials the routes check for when the work does not go to LMS Labs.
     *
     * @param array $payload
     * @return array
     */
    protected static function credentials(array $payload): array {
        foreach (['siteId', 'apiKey'] as $key) {
            if (!is_string($payload[$key] ?? null) || trim($payload[$key]) === '') {
                $payload[$key] = self::NO_CREDENTIALS;
            }
        }
        return $payload;
    }

    /**
     * Point the engine at the site's own AI.
     */
    protected static function hooks(): void {
        engine::$aicall = function (string $system, string $user, array $options): string {
            return \local_aiconfig\byok\ai::text(self::COMPONENT, $system, $user, [
                'json' => !empty($options['json']),
                'maxtokens' => (int) $options['maxtokens'],
                'temperature' => (float) $options['temperature'],
                'timeout' => self::TEXT_TIMEOUT,
            ]);
        };
        engine::$image = function (string $prompt): string {
            // The service draws slide pictures in portrait, at high quality.
            return \local_aiconfig\byok\ai::image(self::COMPONENT, $prompt, ['size' => '1024x1536', 'quality' => 'high']);
        };
        engine::$tts = function (string $text, string $voiceid, string $language, string $format): string {
            return self::speech($text, $voiceid, $language, $format);
        };
        engine::$sleep = null;
    }

    /**
     * One narration request.
     *
     * The service narrates with Google Chirp 3 HD voices at normal speed. A Google key uses the same voice; an OpenAI
     * key gets the closest OpenAI voice of the same kind; ElevenLabs uses the voice the administrator chose.
     *
     * @param string $text
     * @param string $voiceid A Chirp 3 HD voice, such as en-AU-Chirp3-HD-Zephyr.
     * @param string $language
     * @param string $format ogg or mp3.
     * @return string Audio bytes.
     */
    protected static function speech(string $text, string $voiceid, string $language, string $format): string {
        $vendor = \local_aiconfig\byok\router::vendor(\local_aiconfig\byok\router::VOICE);
        if ($vendor === 'googletts') {
            $name = $voiceid;
        } else if ($vendor === 'openai') {
            $parts = explode('-', $voiceid);
            $name = self::OPENAI_VOICES[end($parts)] ?? '';
        } else {
            $name = '';
        }
        return \local_aiconfig\byok\ai::speech(self::COMPONENT, $text,
            ['language' => $language, 'voice' => $name, 'format' => $format, 'rate' => 1.0]);
    }
}
