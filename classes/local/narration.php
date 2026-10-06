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
 * Canonical narration resolution and publication validation.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace mod_productexplainer\local;

/**
 * Canonical narration contract. Keep ordered fields in parity with amd/src/narration.js.
 * Legacy AI voiceoverText is not a teacher override.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class narration {
    /** @var array Ordered content fields displayed by each supported slide renderer. */
    const FIELDS = [
        'product-overview' => 'badge productName valueProp quickFacts',
        'what-how' => 'whatIsIt howItWorks customerExplanation',
        'key-benefits' => 'benefits talkingPoint',
        'who-for' => 'personas bestFit',
        'how-recommend' => 'discoverNeeds matchBenefits conversationExample',
        'using-product' => 'gettingStarted relatedProducts staffTip',
        'faq' => 'faqs',
        'handling-objections' => 'objections closingLine',
        'care-maintenance' => 'careSteps lifespan staffReminder',
        'competitive-advantage' => 'vsAlternatives uniqueSellingPoint staffPitch',
        'seasonal-use' => 'scenarios peakPeriod displayTip',
        'upsell-bundle' => 'upsells bundleIdea upsellScript',
        'customer-story' => 'scenario challenge solution outcome staffUse',
        'troubleshooting' => 'issues escalationTip',
        'staff-tips' => 'tips proTip',
        'cx-introduction' => 'conceptName tagline whyItMatters statOrFact inYourRole',
        'cx-scenario' => 'scenarioTitle situation whatHappened challenge reflection',
        'cx-key-concept' => 'conceptName definition components metaphor',
        'cx-real-example' => 'contextSetting whatTheyDid behaviours result insight',
        'cx-common-mistake' => 'mistakeLabel whatItLooksLike whyItHappens impacts doThisInstead',
        'cx-best-practice' => 'practiceTitle steps proTip',
        'cx-summary' => 'conceptName keyTakeaways reflectionQuestion commitmentPrompt',
        'pe-video-slide' => '',
        'pe-image-slide' => '',
    ];
    /** @var array Ordered rendered subfields for structured content elements. */
    const NESTED = [
        'quickFacts' => 'label value', 'benefits' => 'title description', 'personas' => 'type description',
        'discoverNeeds' => 'title points', 'matchBenefits' => 'title points',
        'conversationExample' => 'customer staff', 'gettingStarted' => 'step description',
        'relatedProducts' => 'name', 'faqs' => 'question answer', 'objections' => 'objection response',
        'careSteps' => 'action detail', 'vsAlternatives' => 'competitor ourAdvantage',
        'scenarios' => 'situation pitch', 'upsells' => 'product reason', 'issues' => 'problem solution',
        'tips' => 'tip', 'components' => 'name description', 'steps' => 'step detail', 'keyTakeaways' => 'point',
    ];
    /**
     * Resolve the script used for both generation and content exports.
     *
     * @param array $slide A slide from the presentation manifest.
     * @return string Explicit teacher override or ordered rendered content.
     */
    public static function resolve(array $slide): string {
        if (($slide['narrationMode'] ?? '') === 'override') {
            return trim((string)($slide['narrationOverride'] ?? ''));
        }
        $parts = [];
        self::walk($slide['title'] ?? '', '', 0, $parts);
        $content = $slide['content'] ?? [];
        $type = $slide['type'] ?? '';
        if (array_key_exists($type, self::FIELDS)) {
            foreach (array_filter(explode(' ', self::FIELDS[$type])) as $key) {
                $value = $content[$key] ?? null;
                if ($key === 'productName' && empty($value)) {
                    $value = $slide[$key] ?? null;
                }
                self::walk($value, $key, 0, $parts);
            }
        } else {
            self::walk($content, '', 0, $parts);
        }
        return implode('  ', $parts);
    }
    /**
     * Collect spoken content without presentation metadata or unbounded recursion.
     *
     * @param mixed $value Content fragment to inspect.
     * @param string $key Field name used to select its rendered subfields.
     * @param int $depth Current recursion depth.
     * @param array $parts Output sentences, appended in display order.
     * @return void
     */
    private static function walk($value, string $key, int $depth, array &$parts): void {
        if ($depth > 6) {
            return;
        }
        if (is_array($value)) {
            if ($value === [] || array_keys($value) === range(0, count($value) - 1)) {
                foreach ($value as $v) {
                    self::walk($v, $key, $depth + 1, $parts);
                }
            } else {
                $keys = isset(self::NESTED[$key]) ? explode(' ', self::NESTED[$key]) : array_keys($value);
                foreach ($keys as $k) {
                    if (!preg_match('/url|prompt|icon|color|colour|voiceover|narration|^_|class|mustWatch/i', $k)) {
                        self::walk($value[$k] ?? null, $k, $depth + 1, $parts);
                    }
                }
            }
        } else if (is_string($value) || is_numeric($value)) {
            $text = trim((string)$value);
            if ($text !== '') {
                $parts[] = preg_match('/[.!?]$/u', $text) ? $text : $text . '.';
            }
        }
    }
    /**
     * Determine whether requested narration prevents publication.
     *
     * Unchanged legacy recordings without known source text are grandfathered.
     *
     * @param array $slide A slide from the presentation manifest.
     * @return bool True for missing, failed or stale requested narration unless explicitly omitted.
     */
    public static function incomplete(array $slide): bool {
        if (!empty($slide['narrationOmitted'])) {
            return false;
        }
        $source = $slide['generatedNarrationText'] ?? $slide['narrationBaselineText'] ?? null;
        return (!empty($slide['narrationRequested']) && (empty($slide['voiceoverUrl']) || !empty($slide['narrationGenerationFailed'])))
            || (!empty($slide['voiceoverUrl']) && is_string($source) && $source !== self::resolve($slide));
    }
}
