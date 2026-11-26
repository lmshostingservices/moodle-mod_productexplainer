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
 * Tests for making Slide Flow decks, pictures and narration on the site's own AI.
 *
 * local\byok\engine was compared with the LMS Labs service code on more than 8,000 randomised requests and AI
 * answers across its four routes (identical validation, prompts, token budgets, parsing, quiz repair, picture
 * prompts, narration chunking, responses and errors); these tests cover the wiring into the plugin.
 *
 * @package    mod_productexplainer
 * @copyright  2026 LMS Hosting Services
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \mod_productexplainer\byok
 * @covers     \mod_productexplainer\local\byok\engine
 * @covers     \mod_productexplainer\aicoursebuilder\generator
 */
#[\PHPUnit\Framework\Attributes\CoversClass(byok::class)]
#[\PHPUnit\Framework\Attributes\CoversClass(engine::class)]
#[\PHPUnit\Framework\Attributes\CoversClass(aicoursebuilder\generator::class)]
final class byok_test extends \advanced_testcase {
    /** @var array Requests the mocked providers received. */
    protected $requests = [];
    /** @var array Text answers the mocked text provider gives, in order. */
    protected $answers = [];
    /** @var string|null An error the mocked voice gives. */
    protected $voiceerror = null;
    /** @var \stdClass */
    protected $activity;
    /** @var \stdClass */
    protected $cm;

    /**
     * Licence the site for Bring your own AI on a test key: text on Anthropic, pictures on OpenAI, voice on Google.
     */
    protected function setUp(): void {
        parent::setUp();
        if (!class_exists('\local_aiconfig\byok\ai')) {
            $this->markTestSkipped('AI Grader Central Config 1.1.0 or later is not installed.');
        }
        $this->resetAfterTest();
        $pair = sodium_crypto_sign_keypair();
        set_config('testpublickey', base64_encode(sodium_crypto_sign_publickey($pair)), 'local_aiconfig');
        $payload = json_encode(['v' => 1, 'id' => 'lic_t', 'site' => \local_aiconfig\byok\licence::site_host(),
            'plan' => 'pro', 'byok' => true, 'products' => ['*'], 'sub' => 'sub_t', 'exp' => time() + DAYSECS]);
        $b64 = function (string $s): string {
            return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
        };
        set_config('licencekey', $b64($payload) . '.' .
            $b64(sodium_crypto_sign_detached($payload, sodium_crypto_sign_secretkey($pair))), 'local_aiconfig');
        foreach (['text' => 'anthropic', 'image' => 'openai', 'voice' => 'googletts'] as $service => $vendor) {
            set_config('src_' . $service, 'ownkey', 'local_aiconfig');
            set_config('vendor_' . $service, $vendor, 'local_aiconfig');
        }
        set_config('key_anthropic', 'sk-test', 'local_aiconfig');
        set_config('key_openai', 'sk-open', 'local_aiconfig');
        set_config('key_gemini', 'g-test', 'local_aiconfig');
        set_config('key_googletts', 'g-test', 'local_aiconfig');
        // No LMS Labs credentials: everything on the site's own AI must work without them.
        foreach (['local_aiconfig', 'mod_productexplainer'] as $plugin) {
            set_config('siteid', '', $plugin);
            set_config('apikey', '', $plugin);
        }
        $this->requests = [];
        $this->answers = [];
        $this->voiceerror = null;
        $GLOBALS['local_aiconfig_byok_mock'] = function ($url, $headers, $body, $vendor, $raw = false) {
            $this->requests[] = ['url' => $url, 'body' => $body, 'vendor' => $vendor];
            if (strpos($url, 'texttospeech') !== false || strpos($url, 'audio/speech') !== false) {
                if ($this->voiceerror !== null) {
                    throw new \moodle_exception('byok_callfailed', 'local_aiconfig', '', (object) ['vendor' => $vendor,
                        'detail' => $this->voiceerror]);
                }
                $audio = $this->ogg(96000);
                return strpos($url, 'texttospeech') !== false ? ['audioContent' => base64_encode($audio)] : $audio;
            }
            if (strpos($url, 'images/generations') !== false) {
                $image = imagecreatetruecolor(32, 48);
                ob_start();
                imagepng($image);
                return ['data' => [['b64_json' => base64_encode(ob_get_clean())]]];
            }
            $answer = array_shift($this->answers);
            if ($answer === null) {
                throw new \moodle_exception('byok_callfailed', 'local_aiconfig', '', (object) ['vendor' => $vendor,
                    'detail' => 'Overloaded']);
            }
            return ['content' => [['type' => 'text', 'text' => $answer]], 'stop_reason' => 'end_turn'];
        };
        $course = $this->getDataGenerator()->create_course();
        $teacher = $this->getDataGenerator()->create_and_enrol($course, 'editingteacher');
        $this->activity = $this->getDataGenerator()->create_module('productexplainer', ['course' => $course->id]);
        $this->cm = get_coursemodule_from_instance('productexplainer', $this->activity->id);
        $this->setUser($teacher);
    }

    /**
     * Clean up the provider mock.
     */
    protected function tearDown(): void {
        unset($GLOBALS['local_aiconfig_byok_mock']);
        engine::$aicall = engine::$image = engine::$tts = engine::$sleep = null;
        parent::tearDown();
    }

    /**
     * A short Ogg Opus stream whose last page ends at a granule position.
     *
     * @param int $granule Samples at 48 kHz.
     * @return string
     */
    protected function ogg(int $granule): string {
        $page = function (int $g, string $data): string {
            $lacing = str_repeat(chr(255), intdiv(strlen($data), 255)) . chr(strlen($data) % 255);
            return 'OggS' . "\0\0" . pack('P', $g) . str_repeat("\0", 12) . chr(strlen($lacing)) . $lacing . $data;
        };
        return $page(0, 'OpusHead' . chr(1) . chr(1) . pack('v', 0) . str_repeat("\0", 7))
            . $page($granule, str_repeat('a', 600));
    }

    /**
     * Text requests the mocked Anthropic key received.
     *
     * @return array
     */
    protected function text_requests(): array {
        return array_values(array_filter($this->requests, function ($r) {
            return strpos($r['url'], 'anthropic') !== false;
        }));
    }

    /**
     * A complete five-question quiz.
     *
     * @return array
     */
    protected function quiz(): array {
        $quiz = [];
        foreach (['brakes', 'horn', 'lights', 'forks', 'leaks'] as $i => $topic) {
            $quiz[] = ['question' => "What do you check about the {$topic}?",
                'options' => ["{$topic} A", "{$topic} B", "{$topic} C", "{$topic} D"], 'correctAnswer' => $i % 4,
                'explanation' => 'Because the pre-start check covers it. Every shift.'];
        }
        return $quiz;
    }

    /**
     * A concept deck as the model writes it.
     *
     * @param bool $withquiz
     * @return array
     */
    protected function concept(bool $withquiz = true): array {
        $content = [
            'cx-introduction' => ['conceptName' => 'Pre-start checks', 'tagline' => 'Check before you drive.',
                'whyItMatters' => 'Faults found early stop injuries.'],
            'cx-scenario' => ['scenarioTitle' => 'A busy Monday', 'situation' => 'Sam is late for the shift.',
                'whatHappened' => 'Sam skips the brake test.'],
            'cx-key-concept' => ['definition' => 'A pre-start check is a short inspection.'],
            'cx-real-example' => ['contextSetting' => 'A Perth warehouse.', 'whatTheyDid' => 'Priya tagged out a leak.'],
            'cx-common-mistake' => ['mistakeLabel' => 'Rushing the check', 'whatItLooksLike' => 'A glance, not a test.'],
            'cx-best-practice' => ['practiceTitle' => 'Same order, every shift'],
            'cx-summary' => ['reflectionQuestion' => 'What will you check first?'],
        ];
        $slides = [];
        foreach ($content as $type => $fields) {
            $slides[] = ['type' => $type, 'title' => ucfirst(substr($type, 3)), 'content' => $fields,
                'voiceoverText' => 'Narration.', 'imagePrompt' => $type === 'cx-summary' ? '' : "Portrait of {$type} scene"];
        }
        $deck = ['mode' => 'concept', 'slides' => $slides];
        if ($withquiz) {
            $deck['quizQuestions'] = $this->quiz();
        }
        return $deck;
    }

    /**
     * Each kind of work follows its own Central Config setting.
     */
    public function test_state_follows_central_config(): void {
        $this->assertSame(['text' => true, 'image' => true, 'voice' => true], byok::state());
        set_config('src_voice', 'credits', 'local_aiconfig');
        set_config('src_image', 'credits', 'local_aiconfig');
        $this->assertSame(['text' => true, 'image' => false, 'voice' => false], byok::state());
    }

    /**
     * A product deck is written on the site's own AI with the service's prompt, without LMS Labs credentials.
     */
    public function test_product_deck_on_own_ai(): void {
        $slides = array_fill(0, 8, ['type' => 'product-overview', 'title' => 'Overview', 'content' => new \stdClass()]);
        $this->answers = [json_encode(['quizQuestions' => $this->quiz(), 'slides' => $slides])];
        $result = byok::product(['siteId' => null, 'apiKey' => null, 'productName' => 'Torque wrench',
            'documentContent' => 'Clicks at the set torque.', 'slideCount' => 8, 'quizCount' => 5, 'questionCount' => 5,
            'creditsToUse' => 13, 'voiceLanguage' => 'en-US']);
        $this->assertTrue($result['success']);
        $this->assertTrue($result['ownai']);
        $this->assertSame(0, $result['creditsUsed']);
        $this->assertCount(8, $result['manifest']->slides);
        $this->assertInstanceOf(\stdClass::class, $result['manifest']->slides[0]->content, 'Empty objects stay objects.');
        $sent = $this->text_requests();
        $this->assertCount(1, $sent);
        $this->assertStringContainsString('Generate a 8-slide product training manifest', $sent[0]['body']['system']);
        $this->assertStringContainsString('Use American English spelling', $sent[0]['body']['system']);
        $this->assertStringContainsString("Product name: Torque wrench\n\nProduct document content:\nClicks at the set torque.",
            $sent[0]['body']['messages'][0]['content'][0]['text']);
        $this->assertSame(13000, $sent[0]['body']['max_tokens']);
    }

    /**
     * A deck the model cuts short is refused with the service's message.
     */
    public function test_product_deck_cut_short(): void {
        $this->answers = [json_encode(['slides' => [['type' => 'faq']]])];
        $result = byok::product(['productName' => 'Torque wrench', 'slideCount' => 6, 'voiceLanguage' => 'en-AU']);
        $this->assertFalse($result['success']);
        $this->assertSame('AI returned incomplete slide data. Please try again.', $result['error']);
        $this->answers = ['not json'];
        $result = byok::product(['productName' => 'Torque wrench']);
        $this->assertSame('AI returned invalid JSON. Please try again.', $result['error']);
        $result = byok::product(['productName' => '']);
        $this->assertSame('Invalid request parameters', $result['error']);
    }

    /**
     * A concept deck gets the service's picture prompts and mode.
     */
    public function test_concept_deck_on_own_ai(): void {
        $this->answers = [json_encode($this->concept())];
        $result = byok::concept(['siteId' => '', 'apiKey' => '', 'conceptName' => 'Pre-start checks',
            'context' => 'warehouse', 'learnerRole' => 'forklift operator', 'learningObjective' => 'Check daily',
            'ownContent' => '', 'creditsToUse' => 10, 'voiceLanguage' => 'th-TH']);
        $this->assertTrue($result['success']);
        $slides = $result['manifest']->slides;
        $this->assertCount(7, $slides);
        $this->assertStringStartsWith('Portrait of cx-introduction scene Use only fictional, unbranded surroundings.',
            $slides[0]->imagePrompt);
        $this->assertStringStartsWith('Portrait photograph illustrating Summary: {"reflectionQuestion"', $slides[6]->imagePrompt);
        $this->assertSame('concept', $result['manifest']->mode);
        $sent = $this->text_requests();
        $this->assertCount(1, $sent);
        $this->assertStringContainsString('LANGUAGE REQUIREMENT: ALL text content in this JSON response MUST be written ' .
            'entirely in Thai', $sent[0]['body']['system']);
        $this->assertStringContainsString("Concept: Pre-start checks\nWorkplace context: warehouse\nTarget learner: forklift " .
            "operator\nNationality/cultural context: Thai\nOutput language: Thai\nLearning objective: Check daily",
            $sent[0]['body']['messages'][0]['content'][0]['text']);
    }

    /**
     * An incomplete quiz is repaired once, as the service does, and a second failure is reported.
     */
    public function test_concept_quiz_repair(): void {
        $this->answers = [json_encode($this->concept(false)), json_encode(['quizQuestions' => $this->quiz()])];
        $result = byok::concept(['conceptName' => 'Pre-start checks']);
        $this->assertTrue($result['success']);
        $this->assertCount(5, $result['manifest']->quizQuestions);
        $sent = $this->text_requests();
        $this->assertCount(2, $sent);
        $this->assertStringContainsString('Return JSON {"quizQuestions":[...]} with exactly five distinct questions.',
            $sent[1]['body']['system']);
        $this->assertSame(2400, $sent[1]['body']['max_tokens']);

        $this->requests = [];
        $this->answers = [json_encode($this->concept(false)), json_encode(['quizQuestions' => []])];
        $result = byok::concept(['conceptName' => 'Pre-start checks']);
        $this->assertFalse($result['success']);
        $this->assertSame('AI returned an incomplete concept quiz. Your credits were not charged.', $result['error']);
    }

    /**
     * A failed provider call reports the provider's message, as the service reports its own.
     */
    public function test_concept_provider_failure(): void {
        $result = byok::concept(['conceptName' => 'Pre-start checks']);
        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Overloaded', $result['error']);
    }

    /**
     * A slide picture is drawn on the site's own image AI in portrait and returned as the service returns it.
     */
    public function test_slide_picture_on_own_ai(): void {
        $result = byok::image(['siteId' => '', 'apiKey' => '', 'imagePrompt' => 'A nurse checks a chart in a ward',
            'slideIndex' => 3, 'creditsToUse' => 2, 'voiceLanguage' => 'th-TH', 'context' => 'aged care']);
        $this->assertTrue($result['success']);
        $this->assertSame(3, $result['slideIndex']);
        $this->assertStringStartsWith('data:image/jpeg;base64,', $result['imageData']);
        $bytes = base64_decode(substr($result['imageData'], strlen('data:image/jpeg;base64,')));
        $this->assertSame([32, 48], array_slice(getimagesizefromstring($bytes), 0, 2));
        $this->assertCount(1, $this->requests);
        $body = $this->requests[0]['body'];
        $this->assertSame('1024x1536', $body['size']);
        $this->assertSame('high', $body['quality']);
        $this->assertStringStartsWith('A nurse checks a chart in a ward The subject must visibly be Thai in a aged care ' .
            'setting. Use only fictional', $body['prompt']);
    }

    /**
     * Narration on a Google key uses the same Chirp 3 HD voice at normal speed, and reports the Ogg length.
     */
    public function test_narration_on_google_key(): void {
        $result = byok::tts(['siteId' => null, 'apiKey' => null, 'text' => "## Step one\n--- Check   the brakes.",
            'languageCode' => 'en-AU', 'voiceId' => 'en-AU-Chirp3-HD-Zephyr', 'voiceGender' => 'Zephyr', 'creditsToUse' => 3]);
        $this->assertTrue($result['success']);
        $this->assertSame('audio/ogg', $result['audioType']);
        $this->assertSame(2, $result['durationSeconds']);
        $this->assertSame($this->ogg(96000), base64_decode($result['audioContent']));
        $body = $this->requests[0]['body'];
        $this->assertSame('Step one Check the brakes.', $body['input']['text']);
        $this->assertSame('en-AU-Chirp3-HD-Zephyr', $body['voice']['name']);
        $this->assertSame(['audioEncoding' => 'OGG_OPUS', 'speakingRate' => 1.0], $body['audioConfig']);
        // The plugin's own check of the clip accepts it.
        $format = local\audio_format::decode($result['audioContent'], $result['audioType']);
        $this->assertSame('audio/ogg', $format['type']);
    }

    /**
     * Narration on an OpenAI key gets the closest OpenAI voice.
     */
    public function test_narration_on_openai_key(): void {
        set_config('vendor_voice', 'openai', 'local_aiconfig');
        $result = byok::tts(['siteId' => '', 'apiKey' => '', 'text' => 'Check the horn.', 'languageCode' => 'fr-FR',
            'voiceId' => 'fr-FR-Chirp3-HD-Charon']);
        $this->assertTrue($result['success']);
        $this->assertSame('echo', $this->requests[0]['body']['voice']);
        $this->assertSame('opus', $this->requests[0]['body']['response_format']);
    }

    /**
     * A rate-limited voice is tried four times, then reported with the service's message.
     */
    public function test_narration_rate_limited(): void {
        $this->voiceerror = 'RESOURCE_EXHAUSTED: quota';
        engine::$sleep = function (int $ms): void {
        };
        $result = byok::tts(['text' => 'Check the lights.', 'voiceId' => 'en-AU-Chirp3-HD-Kore', 'apiKey' => '',
            'siteId' => '']);
        $this->assertCount(4, $this->requests);
        $this->assertFalse($result['success']);
        $this->assertSame('quota', $result['errorType']);
        $this->assertSame('Voice generation temporarily unavailable due to rate limits. Please try again in a minute.',
            $result['error']);
    }

    /**
     * AI Course Builder builds a full concept deck, pictures included, with no credits and no LMS Labs credentials.
     */
    public function test_course_builder_on_own_ai(): void {
        global $DB;
        $this->assertSame(0, aicoursebuilder\generator::native_estimate([]));
        set_config('src_image', 'credits', 'local_aiconfig');
        $this->assertSame(14, aicoursebuilder\generator::native_estimate([]));
        set_config('src_image', 'ownkey', 'local_aiconfig');

        $this->answers = [json_encode($this->concept())];
        $id = aicoursebuilder\generator::native_generate((int) $this->cm->id, [
            'program' => ['country' => 'Australia', 'subject' => 'Warehousing', 'learnerProfile' => 'New starters'],
            'lesson' => ['title' => 'Pre-start checks', 'outcomes' => ['Check a forklift before use']],
        ]);
        $this->assertSame((string) $this->activity->id, $id);
        $manifest = local\manifest_storage::decode(
            $DB->get_field('productexplainer', 'manifestjson', ['id' => $this->activity->id]));
        $this->assertSame('concept', $manifest['mode']);
        $withpictures = array_filter($manifest['slides'], function ($slide) {
            return !empty($slide['imageUrl']);
        });
        $this->assertCount(7, $withpictures);
        $files = get_file_storage()->get_area_files(\context_module::instance($this->cm->id)->id, 'mod_productexplainer',
            'slideimages', $this->activity->id, 'filename', false);
        $this->assertCount(7, $files);
    }

    /**
     * The service's narration pieces: one Ogg clip when short, MP3 pieces split at sentences when long.
     */
    public function test_long_narration_is_split(): void {
        $sentence = str_repeat('word ', 99) . 'end. ';
        $chunks = engine::chunks(trim(str_repeat($sentence, 20)), engine::TTS_MAX_BYTES);
        $this->assertCount(3, $chunks);
        foreach ($chunks as $chunk) {
            $this->assertLessThanOrEqual(engine::TTS_MAX_BYTES, strlen($chunk));
        }
        $this->assertSame(2.0, engine::ogg_seconds($this->ogg(96000)));
        $this->assertFalse(engine::complete_quiz(array_slice($this->quiz(), 0, 4)));
    }
}
