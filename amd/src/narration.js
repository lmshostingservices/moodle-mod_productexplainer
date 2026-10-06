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
 * Canonical narration scripts and publication validation.
 *
 * @module     mod_productexplainer/narration
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
/* jshint ignore:start */
define('mod_productexplainer/narration', [], function() {
    'use strict';
    // Ordered fields actually displayed by each renderer. Nested metadata is never spoken.
    var fields = {
        'product-overview': 'badge productName valueProp quickFacts',
        'what-how': 'whatIsIt howItWorks customerExplanation',
        'key-benefits': 'benefits talkingPoint',
        'who-for': 'personas bestFit',
        'how-recommend': 'discoverNeeds matchBenefits conversationExample',
        'using-product': 'gettingStarted relatedProducts staffTip',
        'faq': 'faqs',
        'handling-objections': 'objections closingLine',
        'care-maintenance': 'careSteps lifespan staffReminder',
        'competitive-advantage': 'vsAlternatives uniqueSellingPoint staffPitch',
        'seasonal-use': 'scenarios peakPeriod displayTip',
        'upsell-bundle': 'upsells bundleIdea upsellScript',
        'customer-story': 'scenario challenge solution outcome staffUse',
        'troubleshooting': 'issues escalationTip',
        'staff-tips': 'tips proTip',
        'cx-introduction': 'conceptName tagline whyItMatters statOrFact inYourRole',
        'cx-scenario': 'scenarioTitle situation whatHappened challenge reflection',
        'cx-key-concept': 'conceptName definition components metaphor',
        'cx-real-example': 'contextSetting whatTheyDid behaviours result insight',
        'cx-common-mistake': 'mistakeLabel whatItLooksLike whyItHappens impacts doThisInstead',
        'cx-best-practice': 'practiceTitle steps proTip',
        'cx-summary': 'conceptName keyTakeaways reflectionQuestion commitmentPrompt',
        'pe-video-slide': '',
        'pe-image-slide': ''
    };
    var nested = {
        quickFacts: 'label value', benefits: 'title description', personas: 'type description',
        discoverNeeds: 'title points', matchBenefits: 'title points',
        conversationExample: 'customer staff', gettingStarted: 'step description',
        relatedProducts: 'name', faqs: 'question answer', objections: 'objection response',
        careSteps: 'action detail', vsAlternatives: 'competitor ourAdvantage',
        scenarios: 'situation pitch', upsells: 'product reason', issues: 'problem solution',
        tips: 'tip', components: 'name description', steps: 'step detail', keyTakeaways: 'point'
    };
    function resolve(slide) {
        if (slide.narrationMode === 'override') return String(slide.narrationOverride || '').trim();
        var parts = [];
        function add(value) {
            if (typeof value !== 'string' && typeof value !== 'number') return;
            var text = String(value).trim();
            if (!text) return;
            if (!/[.!?]$/.test(text)) text += '.';
            parts.push(text);
        }
        function walk(value, key, depth) {
            if (depth > 6) return;
            if (Array.isArray(value)) { value.forEach(function(v) { walk(v, key, depth + 1); }); return; }
            if (value && typeof value === 'object') {
                var keys = nested[key] ? nested[key].split(' ') : Object.keys(value).filter(function(k) {
                    return !/url|prompt|icon|color|colour|voiceover|narration|^_|class|mustWatch/i.test(k);
                });
                keys.forEach(function(k) { walk(value[k], k, depth + 1); });
            } else add(value);
        }
        add(slide.title);
        var c = slide.content || {};
        if (Object.prototype.hasOwnProperty.call(fields, slide.type)) {
            fields[slide.type].split(' ').filter(Boolean).forEach(function(k) {
                walk(k === 'productName' ? (c[k] || slide[k]) : c[k], k, 0);
            });
        } else walk(c, '', 0);
        return parts.join('  ');
    }
    function stale(slide) {
        var source = typeof slide.generatedNarrationText === 'string' ? slide.generatedNarrationText : slide.narrationBaselineText;
        return !!slide.voiceoverUrl && typeof source === 'string' && source !== resolve(slide);
    }
    function incomplete(slide) {
        return !slide.narrationOmitted && (stale(slide)
            || (slide.narrationRequested && (!slide.voiceoverUrl || slide.narrationGenerationFailed)));
    }
    return {resolve: resolve, stale: stale, incomplete: incomplete, fields: fields, nested: nested};
});
