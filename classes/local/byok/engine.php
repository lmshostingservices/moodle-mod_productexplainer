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

namespace mod_productexplainer\local\byok;

/**
 * The LMS Labs Slide Flow routes, ported to run on the site's own AI (Bring your own AI).
 *
 * A line-for-line port of POST /api/moodle/product-explainer/generate, /api/moodle/concept-explainer/generate,
 * /api/moodle/concept-explainer/generate-image and /api/moodle/content-creator/tts: the same request checks,
 * prompts, checks on the AI's answer, quiz repair, image prompt and narration chunking, so a deck comes out the
 * same whichever AI does the work. Credits are not counted: the site pays its own provider.
 *
 * Each route returns [HTTP status, JSON body] as the service would answer.
 *
 * @package    mod_productexplainer
 * @copyright  2026 LMS Hosting Services
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class engine {
    /** JavaScript's whitespace, for String.prototype.trim() and \s. */
    const WS = '\x{0009}-\x{000D}\x{0020}\x{00A0}\x{1680}\x{2000}-\x{200A}\x{2028}\x{2029}\x{202F}\x{205F}\x{3000}\x{FEFF}';

    /** @var callable|null fn(string $system, string $user, array $options): string, the site's own text AI. */
    public static $aicall = null;

    /** @var callable|null fn(string $prompt): string raw image bytes (portrait), the site's own image AI. */
    public static $image = null;

    /** @var callable|null fn(string $text, string $voiceid, string $language, string $format): string audio bytes. */
    public static $tts = null;

    /** @var callable|null fn(int $ms): void, waits between narration retries. */
    public static $sleep = null;

    /** Bytes of text in one narration request. */
    const TTS_MAX_BYTES = 4800;

    /** @var string */
    const SOURCE_RULE = 'Use the teacher\'s source material and instructions as authoritative, unless unsafe or ' .
        'inaccurate. Never invent numerical claims, percentages, statistics, research findings, citations, policies or ' .
        'legal thresholds. Include such claims only when explicitly supplied in the source; otherwise use a qualitative ' .
        'explanation. Keep examples within the supplied learner role and location.';

    /** @var string */
    const UNBRANDED_RULE = 'Use only fictional, unbranded surroundings. No real business names, brand names, logos or ' .
        'trademarks anywhere, including signs, uniforms, badges, products and equipment. Replace source brand ' .
        'references with generic unbranded equivalents. Do not render lettering or text overlays.';

    /** Content each concept slide must have. */
    const CONCEPT_REQUIRED = [
        'cx-introduction' => ['conceptName', 'tagline', 'whyItMatters'],
        'cx-scenario' => ['scenarioTitle', 'situation', 'whatHappened'],
        'cx-key-concept' => ['definition'],
        'cx-real-example' => ['contextSetting', 'whatTheyDid'],
        'cx-common-mistake' => ['mistakeLabel', 'whatItLooksLike'],
        'cx-best-practice' => ['practiceTitle'],
        'cx-summary' => ['reflectionQuestion'],
    ];

    /** @var string */
    const SPELL_AU = 'Use Australian English spelling (organisation, behaviour, practise, recognise).';
    /** @var string */
    const SPELL_US = 'Use American English spelling (organization, behavior, practice, recognize).';
    /** @var string */
    const SPELL_GB = 'Use British English spelling (organisation, behaviour, practise, recognise).';

    const SLIDE_TYPE_DEFS = [
        '    {
      "type": "product-overview",
      "title": "Product Overview",
      "voiceoverText": "string (read aloud every text element on this slide in order — title, badge, productName, valueProp, every quickFact label+value — 90-130 words)",
      "content": {
        "badge": "string (short category label, e.g. Power Tools)",
        "productName": "string",
        "valueProp": "string (1-2 sentences — why customers love this product)",
        "quickFacts": [
          { "label": "Category",    "value": "string", "icon": "box"    },
          { "label": "Price Point", "value": "string", "icon": "target" },
          { "label": "Key Feature", "value": "string", "icon": "star"   },
          { "label": "Best For",    "value": "string", "icon": "user"   }
        ]
      }
    }',
        '    {
      "type": "what-how",
      "title": "What Is It & How Does It Work",
      "voiceoverText": "string",
      "content": {
        "whatIsIt": "string (2-3 sentences describing what the product physically is)",
        "howItWorks": "string (2-3 sentences describing the mechanism or process)",
        "customerExplanation": "string (simple plain-English explanation staff can say to a customer in one sentence)"
      }
    }',
        '    {
      "type": "key-benefits",
      "title": "Key Benefits",
      "voiceoverText": "string",
      "content": {
        "benefits": [
          { "title": "string (benefit name)", "description": "string (1 sentence)", "icon": "star"   },
          { "title": "string",               "description": "string",               "icon": "target" },
          { "title": "string",               "description": "string",               "icon": "tool"   },
          { "title": "string",               "description": "string",               "icon": "box"    }
        ],
        "talkingPoint": "string (the single most persuasive selling point staff should memorise)"
      }
    }',
        '    {
      "type": "who-for",
      "title": "Who Is It For",
      "voiceoverText": "string",
      "content": {
        "personas": [
          { "type": "string (customer type, e.g. DIY Enthusiast)", "description": "string (why it suits them)", "icon": "user"      },
          { "type": "string",                                       "description": "string",                    "icon": "users"     },
          { "type": "string",                                       "description": "string",                    "icon": "briefcase" },
          { "type": "string",                                       "description": "string",                    "icon": "target"    }
        ],
        "bestFit": "string (1-2 sentences on the ideal customer profile)"
      }
    }',
        '    {
      "type": "how-recommend",
      "title": "How To Recommend It",
      "voiceoverText": "string",
      "content": {
        "discoverNeeds": {
          "title": "Discover Customer Needs",
          "points": ["string (question to ask)", "string", "string"]
        },
        "matchBenefits": {
          "title": "Match Benefits to Needs",
          "points": ["string (benefit matched to a need)", "string", "string"]
        },
        "conversationExample": {
          "customer": "string (realistic customer statement or question)",
          "staff":    "string (ideal staff response that closes the recommendation)"
        }
      }
    }',
        '    {
      "type": "using-product",
      "title": "Using The Product",
      "voiceoverText": "string",
      "content": {
        "gettingStarted": [
          { "step": "string (step name)", "description": "string (1 sentence)", "icon": "box"      },
          { "step": "string",             "description": "string",              "icon": "settings" },
          { "step": "string",             "description": "string",              "icon": "tool"     }
        ],
        "relatedProducts": [
          { "name": "string (complementary product type)" },
          { "name": "string" }
        ],
        "staffTip": "string (practical insider tip only experienced staff know)"
      }
    }',
        '    {
      "type": "faq",
      "title": "Frequently Asked Questions",
      "voiceoverText": "string",
      "content": {
        "faqs": [
          { "question": "string (common customer question)", "answer": "string (concise staff answer)" },
          { "question": "string", "answer": "string" },
          { "question": "string", "answer": "string" }
        ]
      }
    }',
        '    {
      "type": "handling-objections",
      "title": "Handling Price & Value Objections",
      "voiceoverText": "string",
      "content": {
        "objections": [
          { "objection": "string (e.g. It’s too expensive)", "response": "string (empathetic staff response that re-frames value)" },
          { "objection": "string", "response": "string" },
          { "objection": "string", "response": "string" }
        ],
        "closingLine": "string (confident closing line to reinforce value)"
      }
    }',
        '    {
      "type": "care-maintenance",
      "title": "Care & Maintenance",
      "voiceoverText": "string",
      "content": {
        "careSteps": [
          { "action": "string (care action)", "detail": "string (1 sentence how-to or why)", "icon": "tool" },
          { "action": "string",               "detail": "string",                             "icon": "settings" },
          { "action": "string",               "detail": "string",                             "icon": "star" }
        ],
        "lifespan": "string (expected product life or warranty highlight)",
        "staffReminder": "string (what staff should tell customers about ongoing care)"
      }
    }',
        '    {
      "type": "competitive-advantage",
      "title": "Competitive Advantage",
      "voiceoverText": "string",
      "content": {
        "vsAlternatives": [
          { "competitor": "string (generic alternative type, not a brand)", "ourAdvantage": "string (why our product wins)" },
          { "competitor": "string", "ourAdvantage": "string" }
        ],
        "uniqueSellingPoint": "string (the one thing competitors cannot match)",
        "staffPitch": "string (one-liner staff use when a customer mentions a competitor)"
      }
    }',
        '    {
      "type": "seasonal-use",
      "title": "When To Recommend It",
      "voiceoverText": "string",
      "content": {
        "scenarios": [
          { "situation": "string (seasonal or situational trigger, e.g. Renovation projects)", "pitch": "string (why this product is ideal)" },
          { "situation": "string", "pitch": "string" },
          { "situation": "string", "pitch": "string" }
        ],
        "peakPeriod": "string (busiest selling season or occasion for this product)",
        "displayTip": "string (merchandising or placement tip for peak season)"
      }
    }',
        '    {
      "type": "upsell-bundle",
      "title": "Upsell & Bundle Opportunities",
      "voiceoverText": "string",
      "content": {
        "upsells": [
          { "product": "string (higher-tier version or add-on)", "reason": "string (why it’s worth the extra spend)" },
          { "product": "string", "reason": "string" }
        ],
        "bundleIdea": "string (suggested product bundle that increases basket value)",
        "upsellScript": "string (natural script for offering the upsell without pressure)"
      }
    }',
        '    {
      "type": "customer-story",
      "title": "Customer Success Story",
      "voiceoverText": "string",
      "content": {
        "scenario": "string (relatable customer situation, e.g. A tradie renovating a kitchen)",
        "challenge": "string (the problem they faced before buying)",
        "solution":  "string (how this product solved it)",
        "outcome":   "string (measurable or emotional result)",
        "staffUse":  "string (how staff can naturally reference this story in conversation)"
      }
    }',
        '    {
      "type": "troubleshooting",
      "title": "Common Issues & Solutions",
      "voiceoverText": "string",
      "content": {
        "issues": [
          { "problem": "string (common issue customers report)", "solution": "string (quick fix or explanation)", "icon": "tool" },
          { "problem": "string", "solution": "string", "icon": "settings" },
          { "problem": "string", "solution": "string", "icon": "star" }
        ],
        "escalationTip": "string (when and how to escalate to a specialist or manufacturer)"
      }
    }',
        '    {
      "type": "staff-tips",
      "title": "Expert Staff Tips",
      "voiceoverText": "string",
      "content": {
        "tips": [
          { "tip": "string (insider knowledge only experienced staff know)", "icon": "star" },
          { "tip": "string", "icon": "tool" },
          { "tip": "string", "icon": "target" },
          { "tip": "string", "icon": "briefcase" }
        ],
        "proTip": "string (single most valuable piece of staff knowledge about this product)"
      }
    }',
    ];

    const PRODUCT_LANG_NAME = [
        'en-AU' => 'English',
        'en-GB' => 'English',
        'en-US' => 'English',
        'en-IN' => 'English',
        'th-TH' => 'Thai',
        'de-DE' => 'German',
        'fr-FR' => 'French',
        'fr-CA' => 'French',
        'es-ES' => 'Spanish',
        'es-US' => 'Spanish',
        'ja-JP' => 'Japanese',
        'ko-KR' => 'Korean',
        'cmn-CN' => 'Chinese (Simplified)',
        'cmn-TW' => 'Chinese (Traditional)',
        'yue-HK' => 'Cantonese',
        'hi-IN' => 'Hindi',
        'ar-XA' => 'Arabic',
        'vi-VN' => 'Vietnamese',
        'id-ID' => 'Indonesian',
        'ms-MY' => 'Malay',
        'fil-PH' => 'Filipino',
        'pt-BR' => 'Portuguese',
        'pt-PT' => 'Portuguese',
        'ru-RU' => 'Russian',
        'pl-PL' => 'Polish',
        'nl-NL' => 'Dutch',
        'it-IT' => 'Italian',
        'tr-TR' => 'Turkish',
        'bn-IN' => 'Bengali',
        'ta-IN' => 'Tamil',
        'ur-IN' => 'Urdu',
        'ur-PK' => 'Urdu',
        'pa-IN' => 'Punjabi',
        'gu-IN' => 'Gujarati',
        'mr-IN' => 'Marathi',
        'kn-IN' => 'Kannada',
        'ml-IN' => 'Malayalam',
        'te-IN' => 'Telugu',
        'sv-SE' => 'Swedish',
        'nb-NO' => 'Norwegian',
        'da-DK' => 'Danish',
        'fi-FI' => 'Finnish',
        'el-GR' => 'Greek',
        'cs-CZ' => 'Czech',
        'ro-RO' => 'Romanian',
        'hu-HU' => 'Hungarian',
        'uk-UA' => 'Ukrainian',
        'sw-KE' => 'Swahili',
        'he-IL' => 'Hebrew',
    ];

    const LANG_NATIONALITY = [
        'en-AU' => 'Australian',
        'en-GB' => 'British',
        'en-US' => 'American',
        'en-IN' => 'Indian',
        'th-TH' => 'Thai',
        'de-DE' => 'German',
        'fr-FR' => 'French',
        'fr-CA' => 'French Canadian',
        'es-ES' => 'Spanish',
        'es-US' => 'Latin American',
        'ja-JP' => 'Japanese',
        'ko-KR' => 'Korean',
        'cmn-CN' => 'Chinese (mainland)',
        'cmn-TW' => 'Taiwanese Chinese',
        'yue-HK' => 'Hong Kong Chinese',
        'hi-IN' => 'Indian',
        'ar-XA' => 'Arabic-speaking',
        'vi-VN' => 'Vietnamese',
        'id-ID' => 'Indonesian',
        'ms-MY' => 'Malaysian',
        'fil-PH' => 'Filipino',
        'pt-BR' => 'Brazilian',
        'pt-PT' => 'Portuguese',
        'ru-RU' => 'Russian',
        'uk-UA' => 'Ukrainian',
        'pl-PL' => 'Polish',
        'nl-NL' => 'Dutch',
        'nl-BE' => 'Belgian',
        'sv-SE' => 'Swedish',
        'da-DK' => 'Danish',
        'nb-NO' => 'Norwegian',
        'fi-FI' => 'Finnish',
        'it-IT' => 'Italian',
        'bg-BG' => 'Bulgarian',
        'cs-CZ' => 'Czech',
        'hr-HR' => 'Croatian',
        'hu-HU' => 'Hungarian',
        'ro-RO' => 'Romanian',
        'sk-SK' => 'Slovak',
        'sl-SI' => 'Slovenian',
        'sr-RS' => 'Serbian',
        'el-GR' => 'Greek',
        'he-IL' => 'Israeli',
        'tr-TR' => 'Turkish',
        'sw-KE' => 'East African',
        'bn-IN' => 'Bengali Indian',
        'gu-IN' => 'Gujarati Indian',
        'kn-IN' => 'Kannada Indian',
        'ml-IN' => 'Malayalam Indian',
        'mr-IN' => 'Marathi Indian',
        'ta-IN' => 'Tamil',
        'te-IN' => 'Telugu Indian',
        'pa-IN' => 'Punjabi Indian',
        'ur-IN' => 'Urdu-speaking South Asian',
        'et-EE' => 'Estonian',
        'lt-LT' => 'Lithuanian',
        'lv-LV' => 'Latvian',
        'ca-ES' => 'Catalan Spanish',
        'is-IS' => 'Icelandic',
    ];

    const LANG_NAME = [
        'en-AU' => 'English',
        'en-GB' => 'English',
        'en-US' => 'English',
        'en-IN' => 'English',
        'th-TH' => 'Thai',
        'de-DE' => 'German',
        'fr-FR' => 'French',
        'fr-CA' => 'French',
        'es-ES' => 'Spanish',
        'es-US' => 'Spanish',
        'ja-JP' => 'Japanese',
        'ko-KR' => 'Korean',
        'cmn-CN' => 'Chinese (Simplified)',
        'cmn-TW' => 'Chinese (Traditional)',
        'yue-HK' => 'Cantonese',
        'hi-IN' => 'Hindi',
        'ar-XA' => 'Arabic',
        'vi-VN' => 'Vietnamese',
        'id-ID' => 'Indonesian',
        'ms-MY' => 'Malay',
        'fil-PH' => 'Filipino',
        'pt-BR' => 'Portuguese',
        'pt-PT' => 'Portuguese',
        'ru-RU' => 'Russian',
        'uk-UA' => 'Ukrainian',
        'pl-PL' => 'Polish',
        'nl-NL' => 'Dutch',
        'nl-BE' => 'Dutch',
        'sv-SE' => 'Swedish',
        'da-DK' => 'Danish',
        'nb-NO' => 'Norwegian',
        'fi-FI' => 'Finnish',
        'it-IT' => 'Italian',
        'bg-BG' => 'Bulgarian',
        'cs-CZ' => 'Czech',
        'hr-HR' => 'Croatian',
        'hu-HU' => 'Hungarian',
        'ro-RO' => 'Romanian',
        'sk-SK' => 'Slovak',
        'sl-SI' => 'Slovenian',
        'sr-RS' => 'Serbian',
        'el-GR' => 'Greek',
        'he-IL' => 'Hebrew',
        'tr-TR' => 'Turkish',
        'sw-KE' => 'Swahili',
        'bn-IN' => 'Bengali',
        'gu-IN' => 'Gujarati',
        'kn-IN' => 'Kannada',
        'ml-IN' => 'Malayalam',
        'mr-IN' => 'Marathi',
        'ta-IN' => 'Tamil',
        'te-IN' => 'Telugu',
        'pa-IN' => 'Punjabi',
        'ur-IN' => 'Urdu',
        'et-EE' => 'Estonian',
        'lt-LT' => 'Lithuanian',
        'lv-LV' => 'Latvian',
        'ca-ES' => 'Catalan',
        'is-IS' => 'Icelandic',
    ];

    const LANG_NAT_IMG = [
        'en-AU' => 'Australian',
        'en-GB' => 'British',
        'en-US' => 'American',
        'en-IN' => 'Indian',
        'th-TH' => 'Thai',
        'de-DE' => 'German',
        'fr-FR' => 'French',
        'fr-CA' => 'French Canadian',
        'es-ES' => 'Spanish',
        'ja-JP' => 'Japanese',
        'ko-KR' => 'Korean',
        'cmn-CN' => 'Chinese',
        'cmn-TW' => 'Taiwanese',
        'yue-HK' => 'Hong Kong Chinese',
        'hi-IN' => 'Indian',
        'ar-XA' => 'Arabic-speaking',
        'vi-VN' => 'Vietnamese',
        'id-ID' => 'Indonesian',
        'ms-MY' => 'Malaysian',
        'fil-PH' => 'Filipino',
        'pt-BR' => 'Brazilian',
        'ru-RU' => 'Russian',
        'it-IT' => 'Italian',
        'nl-NL' => 'Dutch',
        'sv-SE' => 'Swedish',
        'da-DK' => 'Danish',
        'nb-NO' => 'Norwegian',
        'fi-FI' => 'Finnish',
        'pl-PL' => 'Polish',
        'tr-TR' => 'Turkish',
        'he-IL' => 'Israeli',
        'el-GR' => 'Greek',
        'uk-UA' => 'Ukrainian',
        'cs-CZ' => 'Czech',
        'hu-HU' => 'Hungarian',
        'ro-RO' => 'Romanian',
        'bg-BG' => 'Bulgarian',
        'sk-SK' => 'Slovak',
        'hr-HR' => 'Croatian',
        'sl-SI' => 'Slovenian',
        'sr-RS' => 'Serbian',
        'sw-KE' => 'East African',
        'ta-IN' => 'Tamil',
        'bn-IN' => 'Bengali Indian',
    ];

    /** @var string */
    const PRODUCT_SYSTEM = 'You are an expert retail product trainer. Generate a %%slideCount%%-slide product training manifest in JSON format.%%langDirective%%

CRITICAL RULES:
1. Return ONLY valid JSON (no markdown, no code fences, no extra text).
1a. JSON KEY NAMES MUST ALWAYS REMAIN IN ENGLISH — never translate field/key names. Only the VALUES are written in the target language.
2. The "slides" array MUST contain exactly %%slideCount%% objects, one per slide type listed below.
3. Every slide MUST have completely distinct content — no repeating facts, phrases, or ideas across slides.
4. Write 2–3 full, complete sentences for every text field — never single-word labels or sentence fragments.
5. Use culturally relevant examples appropriate to the learner\'s language and context. %%spellingRule%%
6. Conversation scripts (customer/staff dialogues) must feel natural and be 2–4 exchange turns — not robotic bullet points.
7. VOICEOVER EXACTNESS (CRITICAL): Each voiceoverText MUST speak the exact words shown on the slide — do NOT paraphrase, summarise, or skip any visible text. Read every field in the order it appears: slide title, badge label, value proposition, every quickFact label AND its value, every bullet point, step name AND its detail, every heading and body paragraph. Write as natural flowing speech — connect the items naturally but DO NOT drop any content. If productName or valueProp is on the slide, say it verbatim. Minimum 90 words, target 110–130 words per slide.
8. All content must be entirely specific to the product — never generic filler or placeholder text.
9. Always generate exactly 5 quizQuestions testing key product knowledge. Each question MUST have exactly 4 options, correctAnswer index (0–3), and a 2-sentence spoken explanation of why the correct answer is right.
10. SOURCE MATERIAL RULE: If "Product document content" is provided in the user message, treat it as the PRIMARY source — extract product specs, features, benefits, prices, use cases, and details directly from it. Do NOT invent facts not found in the document. Where it is silent on a required field, use cautious qualitative wording; never invent a statistic, percentage, measured effect, citation, date, threshold, regulation, warranty or certification.
11. SINGLE-BEST-ANSWER QUIZZES: Each quiz question has exactly one answer that is supported by the supplied source. Avoid context-dependent "best" questions unless the stem specifies the conditions that make one answer uniquely correct. Before returning, check all options together; rewrite any question where a knowledgeable learner could defend two answers.

Return JSON matching this exact schema:
{
  "productName": "string",
  "quizQuestions": [
    {
      "question": "string (question text, max 20 words)",
      "options": ["string (option A)", "string (option B)", "string (option C)", "string (option D)"],
      "correctAnswer": 0,
      "explanation": "string (2 sentences explaining why the correct answer is right — spoken aloud as feedback)"
    }
  ],
  "slides": [
%%defs%%
  ]
}';

    /** @var string */
    const PRODUCT_USER = 'Product name: %%productName%%%%docSection%%

Generate the complete %%slideCount%%-slide product training manifest for this product. Make every slide\'s content specific, practical and unique — each slide must cover a different aspect with no repetition. %%spellingRule%%';

    /** @var string */
    const CONCEPT_SYSTEM = 'You are a world-class workplace learning designer specialising in workplace learning across all industries and cultures globally. Generate a 7-slide Concept Explainer manifest in JSON format.%%langDirective%%

CRITICAL RULES:
1. Return ONLY valid JSON (no markdown, no code fences, no extra text).
1a. JSON KEY NAMES MUST ALWAYS REMAIN IN ENGLISH — NEVER translate, romanize or modify any JSON key/field name. Only the VALUES (the text content) are written in the target language. For example, always use "conceptName", "tagline", "whyItMatters" — never translate these keys into Thai, Japanese or any other language.
2. The "slides" array MUST contain exactly 7 objects in this EXACT order: cx-introduction, cx-scenario, cx-key-concept, cx-real-example, cx-common-mistake, cx-best-practice, cx-summary. Do NOT change slide order or types.
3. Every slide MUST have completely distinct content — no repeating phrases, facts or ideas across slides.
4. Write 2–3 full, complete sentences for every text field — never single-word labels or sentence fragments.
5. Use concrete workplace examples drawn from the exact industry context and learner role provided — never substitute a generic Australian example when the context specifies a different country, culture or industry.
6. FIELD GENERATION ORDER IS MANDATORY — for each slide object, write the "content" fields FIRST, then write "voiceoverText" reading from those content fields, then write "imagePrompt" deriving its scene from those content fields. Never write voiceoverText or imagePrompt before the content object is complete. Each voiceoverText MUST read aloud every piece of text the student sees on that slide — cover every content field in order: slide title, badge/section label, all body paragraphs, component names and their descriptions, callout text, every bullet-point item, step names with their detail sentences, reflection questions, and commitment prompts. Write as natural flowing speech. The student MUST hear exactly what they read — do NOT summarise, skip any field or introduce information not shown on the slide. Typically 90–140 words per slide.
7. For each imagePrompt: write a 60–90 word photorealistic workplace photography prompt that DIRECTLY DEPICTS the content of that specific slide — NOT a generic workplace scene. Derive every visual element from that slide\'s own content fields: if the slide describes a manager ignoring a WHS hazard, show that exact scene; if it shows a best-practice step being performed, depict that precise action. The subject, characters, actions and setting in the image MUST match what the slide text says. CRITICAL: The image will be displayed in a TALL PORTRAIT column (9:16 aspect ratio). Always compose for portrait/vertical framing: use a close-up or medium shot of ONE primary subject filling the vertical frame, shot from waist or chest up. DO NOT compose wide two-person-side-by-side scenes — they will be cropped. Always specify: portrait orientation, the exact workplace location from the slide content, the specific person and their precise action as described in the slide text, lighting quality, mood. NATIONALITY RULE: Every person in every imagePrompt MUST visually represent the nationality and cultural background matching the workplace context — embed the specific nationality name directly in the prompt text (e.g. "Thai recruitment consultant in a Bangkok office", "German automotive factory worker in Stuttgart", "Indian software engineer in a Bengaluru tech office"). NEVER default to generic Western-looking people when the context specifies a different nationality. NEVER include text overlays, graphics, illustrations or cartoons. NEVER generate a generic "busy office" or "handshake" filler image.
8. All content must be entirely specific to the concept, industry context, and target learner — no generic filler.
9. %%spellingRule%%
10. Always generate exactly 5 quizQuestions testing understanding of the concept. Each question MUST have exactly 4 options, correctAnswer index (0–3), and a 2-sentence spoken explanation of why the correct answer is right.
11. SOURCE MATERIAL RULE: %%sourceRule%% Adapt the reference material into the 7-slide structure. Do not fill gaps with invented facts.
12. IMAGE RULE: %%unbrandedRule%%
13. QUIZ ACCURACY: Exactly one option must be supported as correct by the supplied material and the other three must be unambiguously wrong in the stated situation. Narrow an ambiguous question rather than inventing a rule to force an answer.

Return JSON matching this exact schema:
{
  "mode": "concept",
  "quizQuestions": [
    {
      "question": "string (question text, max 20 words)",
      "options": ["string (option A)", "string (option B)", "string (option C)", "string (option D)"],
      "correctAnswer": 0,
      "explanation": "string (2 sentences explaining why the correct answer is right — spoken aloud as feedback)"
    }
  ],
  "slides": [
    {
      "type": "cx-introduction",
      "title": "string (4-6 word display title)",
      "content": {
        "conceptName": "string",
        "tagline": "string (one punchy sentence defining the concept in plain language)",
        "whyItMatters": "string (2-3 sentences on real workplace impact — concrete and specific to the industry)",
        "statOrFact": "string (a source-supported qualitative insight; a number or research claim only if explicitly supplied in the reference material)",
        "inYourRole": "string (1-2 sentences directly addressing the target learner in their specific role)"
      },
      "voiceoverText": "string (write AFTER filling content above — narrate in order: title, conceptName, tagline, whyItMatters, statOrFact, inYourRole — 90-140 words)",
      "imagePrompt": "string (write AFTER filling content above — 60-90 word portrait-orientation prompt: depict the SPECIFIC workplace impact described in \'whyItMatters\' and \'inYourRole\' — close/medium shot of ONE person in their actual workplace setting encountering the concept. Vertical framing, subject fills the frame from waist up. Derive the scene from those fields. No wide two-person side-by-side scenes. No generic imagery.)"
    },
    {
      "type": "cx-scenario",
      "title": "string (4-6 word display title)",
      "content": {
        "scenarioTitle": "string (evocative title, e.g. \'A moment you recognise\')",
        "situation": "string (2-3 sentences: vivid realistic workplace scene with specific characters and setting)",
        "whatHappened": "string (2-3 sentences: what occurred — authentic and recognisable)",
        "challenge": "string (1-2 sentences: the gap or problem this scenario reveals)",
        "reflection": "string (a thought-provoking question for the learner)"
      },
      "voiceoverText": "string (write AFTER filling content above — narrate in order: title, scenarioTitle, situation, whatHappened, challenge, reflection — 90-140 words)",
      "imagePrompt": "string (write AFTER filling content above — 60-90 word portrait-orientation prompt: depict the EXACT moment from \'situation\'/\'whatHappened\' — close/medium shot of the PRIMARY character in that scenario, vertical framing, subject fills the frame from waist up. Must visually recreate that specific moment. No wide two-person side-by-side scenes. No generic imagery.)"
    },
    {
      "type": "cx-key-concept",
      "title": "string (4-6 word display title)",
      "content": {
        "definition": "string (2-3 sentence clear, jargon-free definition in plain workplace language)",
        "components": [
          { "name": "string (2-4 words)", "description": "string (1 sentence)", "icon": "star" },
          { "name": "string", "description": "string", "icon": "target" },
          { "name": "string", "description": "string", "icon": "user" }
        ],
        "metaphor": "string (simple everyday analogy starting with \'Think of it like...\' or \'It’s a bit like...\')"
      },
      "voiceoverText": "string (write AFTER filling content above — narrate in order: title, definition, each component name+description, metaphor — 90-140 words)",
      "imagePrompt": "string (write AFTER filling content above — 60-90 word portrait-orientation prompt: depict ONE person ACTIVELY DEMONSTRATING a named \'component\' skill in the exact workplace context — close/medium shot, vertical framing, subject fills frame from waist up. Must match the component description. No wide scenes. No generic imagery.)"
    },
    {
      "type": "cx-real-example",
      "title": "string (4-6 word display title)",
      "content": {
        "contextSetting": "string (1-2 sentences: who, where, what was happening)",
        "whatTheyDid": "string (2-3 sentences: specific observable skill behaviours demonstrated)",
        "behaviours": [
          "string (concrete observable action 1 — specific and visual)",
          "string (concrete observable action 2)",
          "string (concrete observable action 3)"
        ],
        "result": "string (the specific, tangible positive outcome)",
        "insight": "string (why this worked — the skill or mindset that made the difference)"
      },
      "voiceoverText": "string (write AFTER filling content above — narrate in order: title, contextSetting, whatTheyDid, each behaviour bullet, result, insight — 90-140 words)",
      "imagePrompt": "string (write AFTER filling content above — 60-90 word portrait-orientation prompt: depict the primary person performing the EXACT positive action from \'whatTheyDid\' in the \'contextSetting\' — close/medium shot, vertical framing, subject from waist up. Must show that precise real-world moment. No wide scenes. No generic success imagery.)"
    },
    {
      "type": "cx-common-mistake",
      "title": "string (4-6 word display title)",
      "content": {
        "mistakeLabel": "string (memorable name for the mistake, 3-5 words)",
        "whatItLooksLike": "string (2-3 sentences: concrete vivid description of the mistake behaviour)",
        "whyItHappens": "string (1-2 sentences: root cause — time pressure, habit, assumption, stress)",
        "impacts": [
          "string (specific negative consequence 1)",
          "string (specific negative consequence 2)",
          "string (specific negative consequence 3)"
        ],
        "doThisInstead": "string (the corrective behaviour — specific, actionable, positively framed)"
      },
      "voiceoverText": "string (write AFTER filling content above — narrate in order: title, mistakeLabel, whatItLooksLike, whyItHappens, each impact bullet, doThisInstead — 90-140 words)",
      "imagePrompt": "string (write AFTER filling content above — 60-90 word portrait-orientation prompt: depict ONE person making the SPECIFIC mistake from \'mistakeLabel\'/\'whatItLooksLike\' — close/medium shot, vertical framing, subject from waist up, in the exact workplace context. Must show this specific error, not a generic stressed-worker scene. No wide scenes.)"
    },
    {
      "type": "cx-best-practice",
      "title": "string (4-6 word display title)",
      "content": {
        "practiceTitle": "string (memorable headline for this approach)",
        "steps": [
          { "step": "string (action verb + noun)", "detail": "string (1-2 sentences on exactly HOW to do this)" },
          { "step": "string", "detail": "string" },
          { "step": "string", "detail": "string" }
        ],
        "proTip": "string (insight separating good from great — 1-2 sentences, experienced practitioner voice)"
      },
      "voiceoverText": "string (write AFTER filling content above — narrate in order: title, practiceTitle, each step name+detail, proTip — 90-140 words)",
      "imagePrompt": "string (write AFTER filling content above — 60-90 word portrait-orientation prompt: depict ONE person PERFORMING the \'practiceTitle\' — close/medium shot, vertical framing, subject from waist up, in the exact workplace. The scene must visually match the step detail sentences. No wide scenes. No generic professional imagery.)"
    },
    {
      "type": "cx-summary",
      "title": "string (4-6 word display title)",
      "content": {
        "keyTakeaways": [
          { "point": "string (one punchy memorable takeaway — complete sentence)", "icon": "star" },
          { "point": "string", "icon": "target" },
          { "point": "string", "icon": "users" }
        ],
        "reflectionQuestion": "string (thought-provoking question learners carry into their next interaction)",
        "commitmentPrompt": "string (one specific actionable behaviour — must start with \'This week, I will...\')"
      },
      "voiceoverText": "string (write AFTER filling content above — narrate in order: title, each keyTakeaway point, reflectionQuestion, commitmentPrompt — 90-140 words)",
      "imagePrompt": "string (write AFTER filling content above — 60-90 word portrait-orientation prompt: depict the learner role SUCCESSFULLY APPLYING the first \'keyTakeaways\' point — close/medium shot of ONE person, vertical framing, subject from waist up, in the exact workplace. Must show that specific positive outcome as a concrete moment. No wide scenes. No celebration or handshake imagery.)"
    }
  ]
}';

    /** @var string */
    const PRODUCT_DIRECTIVE = "\n⚠️ LANGUAGE REQUIREMENT: ALL text content in this JSON response MUST be written entirely in " .
        "{L}. This applies to every field: slide titles, body text, voiceoverText narrations, quiz questions, quiz " .
        "options, and quiz explanations. Do NOT write any text in English. Write naturally and natively in {L}.\n";

    /** @var string */
    const CONCEPT_DIRECTIVE = "\n⚠️ LANGUAGE REQUIREMENT: ALL text content in this JSON response MUST be written entirely in " .
        "{L}. This applies to every field without exception: slide titles, all body text fields, voiceoverText " .
        "narrations, quiz questions, quiz answer options, and quiz explanations. Do NOT write any text in English. " .
        "Write naturally and natively in {L}.\n";

    /** @var string */
    const LANGUAGE_RULE = 'LANGUAGE DIRECTIVE: Write ALL content in {L}. Every slide title, every body text field, every ' .
        'voiceoverText, every quiz question, every quiz option, and every quiz explanation MUST be written entirely in ' .
        '{L}. Do NOT write any text in English. Write natively in {L} — do not translate word-by-word.';

    /** @var string */
    const QUIZ_REPAIR = ' Return JSON {"quizQuestions":[...]} with exactly five distinct questions. Each has question, ' .
        'four distinct options, correctAnswer (integer 0-3), and explanation. Exactly one option is correct, supported ' .
        'by the source. Preserve English JSON keys.';

    /**
     * POST /api/moodle/product-explainer/generate: a product training deck.
     *
     * @param mixed $body The request.
     * @return array [status, body]
     */
    public static function product($body): array {
        $v = self::check($body, [
            'siteId' => ['str', ''], 'apiKey' => ['str', ''],
            'productName' => ['str', null, 1, 200], 'documentContent' => ['str', '', 0, 100000],
            'slideCount' => ['num', 6, 3, 20], 'creditsToUse' => ['num', 100, 1], 'voiceLanguage' => ['str', 'en-AU'],
        ]);
        if ($v === null) {
            return [400, ['success' => false, 'error' => 'Invalid request parameters']];
        }
        $count = $v['slideCount'];
        $lang = $v['voiceLanguage'];
        $docsection = self::jtrim($v['documentContent']) !== ''
            ? "\n\nProduct document content:\n" . self::slice($v['documentContent'], 0, 8000) : '';
        $defs = array_slice(self::SLIDE_TYPE_DEFS, 0, (int) floor($count));
        $langname = self::PRODUCT_LANG_NAME[$lang] ?? 'English';
        $english = str_starts_with($lang, 'en-');
        $spelling = self::spelling($lang, $langname);
        $system = strtr(self::PRODUCT_SYSTEM, [
            '%%slideCount%%' => self::numstr($count),
            '%%langDirective%%' => $english ? '' : str_replace('{L}', $langname, self::PRODUCT_DIRECTIVE),
            '%%spellingRule%%' => $spelling,
            '%%defs%%' => implode(",\n", $defs),
        ]);
        $user = strtr(self::PRODUCT_USER, [
            '%%productName%%' => $v['productName'],
            '%%docSection%%' => $docsection,
            '%%slideCount%%' => self::numstr($count),
            '%%spellingRule%%' => $spelling,
        ]);
        try {
            $raw = (self::$aicall)($system, $user,
                ['maxtokens' => min(18000, 11000 + ($count - 6) * 1000), 'json' => true, 'temperature' => 0.7]);
        } catch (\Throwable $e) {
            return [500, ['success' => false,
                'error' => $e->getMessage() !== '' ? $e->getMessage() : 'AI generation failed. Your credits were not charged.']];
        }
        try {
            $manifest = json_decode($raw, false, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            return [500, ['success' => false, 'error' => 'AI returned invalid JSON. Please try again.']];
        }
        if ($manifest === null) {
            return [500, ['success' => false, 'error' => "Cannot read properties of null (reading 'slides')"]];
        }
        $slides = is_object($manifest) ? ($manifest->slides ?? null) : null;
        if (!self::truthy($slides) || !is_array($slides) || count($slides) < $count) {
            return [500, ['success' => false, 'error' => 'AI returned incomplete slide data. Please try again.']];
        }
        return [200, ['success' => true, 'manifest' => $manifest, 'creditsUsed' => 0, 'creditsRemaining' => -1]];
    }

    /**
     * POST /api/moodle/concept-explainer/generate: the seven-slide concept deck.
     *
     * @param mixed $body The request.
     * @return array [status, body]
     */
    public static function concept($body): array {
        $v = self::check($body, [
            'siteId' => ['str', null, 1], 'apiKey' => ['str', null, 1],
            'conceptName' => ['str', null, 1, 200], 'context' => ['str', '', 0, 200], 'learnerRole' => ['str', '', 0, 200],
            'learningObjective' => ['str', '', 0, 500], 'ownContent' => ['str', '', 0, 100000],
            'creditsToUse' => ['num', 10, 1], 'voiceLanguage' => ['str', 'en-AU'],
        ]);
        if ($v === null) {
            return [400, ['success' => false, 'error' => 'Invalid request parameters']];
        }
        $name = $v['conceptName'];
        $context = $v['context'];
        $learner = $v['learnerRole'];
        $lang = $v['voiceLanguage'];
        $ownsection = self::jtrim($v['ownContent']) !== '' ? "\n\nReference material:\n" . $v['ownContent'] : '';
        $objsection = self::jtrim($v['learningObjective']) !== '' ? "\nLearning objective: " . $v['learningObjective'] : '';
        $nationality = self::LANG_NATIONALITY[$lang] ?? 'culturally appropriate to the context';
        $langname = self::LANG_NAME[$lang] ?? 'English';
        $english = str_starts_with($lang, 'en-');
        $spelling = self::spelling($lang, $langname);
        $system = strtr(self::CONCEPT_SYSTEM, [
            '%%langDirective%%' => $english ? '' : str_replace('{L}', $langname, self::CONCEPT_DIRECTIVE),
            '%%spellingRule%%' => $spelling,
            '%%sourceRule%%' => self::SOURCE_RULE,
            '%%unbrandedRule%%' => self::UNBRANDED_RULE,
        ]);
        $hascontext = self::jtrim($context) !== '';
        $haslearner = self::jtrim($learner) !== '';
        $contextline = $hascontext ? "Workplace context: {$context}\n" : '';
        $learnerline = $haslearner ? "Target learner: {$learner}\n" : '';
        $hint = $hascontext
            ? "in a {$context} setting — e.g. \"{$nationality} [role] in [specific location from context]\""
            : "in a realistic {$nationality} workplace or learning setting";
        $user = "Concept: {$name}\n{$contextline}{$learnerline}Nationality/cultural context: {$nationality}\n" .
            "Output language: {$langname}{$objsection}{$ownsection}\n\n" .
            'Generate the complete 7-slide Concept Explainer manifest. Make every slide specific, practical and deeply ' .
            'relevant to this concept' . ($hascontext ? ', context' : '') . ($haslearner ? ' and learner role' : '') .
            ". CRITICAL IMAGE RULE: Every imagePrompt MUST explicitly name \"{$nationality}\" people {$hint}. " .
            "Never produce a generic Western or Australian-looking scene. {$spelling}" .
            ($english ? '' : " FINAL REMINDER: Every word of slide and quiz content MUST be in {$langname}, not English.");
        try {
            $raw = (self::$aicall)($system, $user, ['maxtokens' => 14000, 'json' => true, 'temperature' => 0.7]);
        } catch (\Throwable $e) {
            return [500, ['success' => false,
                'error' => $e->getMessage() !== '' ? $e->getMessage() : 'AI generation failed. Your credits were not charged.']];
        }
        try {
            $manifest = json_decode($raw, false, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            return [500, ['success' => false, 'error' => 'AI returned invalid JSON. Please try again.']];
        }
        if ($manifest === null) {
            return [500, ['success' => false, 'error' => "Cannot read properties of null (reading 'slides')"]];
        }
        $slides = is_object($manifest) ? ($manifest->slides ?? null) : null;
        if (!self::truthy($slides) || !is_array($slides) || count($slides) < 7) {
            return [500, ['success' => false, 'error' => 'AI returned incomplete concept slide data. Please try again.']];
        }
        foreach ($slides as $slide) {
            if ($slide === null) {
                return [500, ['success' => false, 'error' => "Cannot read properties of null (reading 'type')"]];
            }
            $type = is_object($slide) && isset($slide->type) && is_string($slide->type) ? $slide->type : null;
            $required = $type !== null ? (self::CONCEPT_REQUIRED[$type] ?? []) : [];
            $content = is_object($slide) ? ($slide->content ?? null) : null;
            foreach ($required as $field) {
                $value = is_object($content) && property_exists($content, $field) ? $content->$field : null;
                if (!self::truthy($value) || (is_array($value) && !$value)
                        || (is_string($value) && self::jtrim($value) === '')) {
                    return [500, ['success' => false, 'error' => 'AI returned slides with missing content. Please try again.']];
                }
            }
        }
        if (!self::complete_quiz(property_exists($manifest, 'quizQuestions') ? $manifest->quizQuestions : null)) {
            try {
                $raw = (self::$aicall)(self::SOURCE_RULE . ' ' . $spelling . self::QUIZ_REPAIR,
                    "Concept: {$name}\n{$contextline}{$learnerline}{$ownsection}\nSlides: " . self::json($slides) .
                    "\nWrite all question values in {$langname}.",
                    ['maxtokens' => 2400, 'json' => true, 'temperature' => 0.25]);
                $repaired = json_decode($raw, false, 512, JSON_THROW_ON_ERROR);
                $quiz = is_object($repaired) && property_exists($repaired, 'quizQuestions') ? $repaired->quizQuestions : null;
                if (!self::complete_quiz($quiz)) {
                    throw new \RuntimeException('Incomplete concept quiz');
                }
                $manifest->quizQuestions = $quiz;
            } catch (\Throwable $e) {
                return [502, ['success' => false,
                    'error' => 'AI returned an incomplete concept quiz. Your credits were not charged.']];
            }
        }
        foreach ($manifest->slides as $slide) {
            if (is_array($slide)) {
                continue;
            }
            if (!is_object($slide)) {
                return [500, ['success' => false, 'error' => "Cannot create property 'imagePrompt' on " .
                    (is_string($slide) ? 'string' : (is_bool($slide) ? 'boolean' : 'number')) . " '" .
                    self::jsstr($slide) . "'"]];
            }
            $prompt = property_exists($slide, 'imagePrompt') ? $slide->imagePrompt : null;
            if (is_string($prompt) && self::jtrim($prompt) !== '') {
                $scene = self::jtrim($prompt);
            } else {
                $title = property_exists($slide, 'title') ? self::jsstr($slide->title) : 'undefined';
                $content = property_exists($slide, 'content') ? self::json($slide->content) : 'undefined';
                $scene = "Portrait photograph illustrating {$title}: {$content}. {$contextline}{$learnerline}";
            }
            $slide->imagePrompt = self::slice($scene, 0, 650) . ' ' . self::UNBRANDED_RULE;
        }
        $manifest->mode = 'concept';
        return [200, ['success' => true, 'manifest' => $manifest, 'creditsUsed' => 0, 'creditsRemaining' => -1]];
    }

    /**
     * POST /api/moodle/concept-explainer/generate-image: one portrait slide picture.
     *
     * @param mixed $body The request.
     * @return array [status, body]
     */
    public static function image($body): array {
        $v = self::check($body, [
            'siteId' => ['str', null, 1], 'apiKey' => ['str', null, 1], 'imagePrompt' => ['str', null, 10, 1000],
            'slideIndex' => ['num', 0, 0, 20], 'creditsToUse' => ['num', 2, 1], 'voiceLanguage' => ['str', 'en-AU'],
            'context' => ['str', '', 0, 200],
        ]);
        if ($v === null) {
            return [400, ['success' => false, 'error' => 'Invalid request parameters']];
        }
        $prompt = $v['imagePrompt'];
        $lang = $v['voiceLanguage'];
        $nationality = self::LANG_NAT_IMG[$lang] ?? '';
        $named = $nationality === '' ||
            str_contains(self::lower($prompt), explode(' ', self::lower($nationality))[0]);
        if ($nationality !== '' && !$named && $lang !== 'en-AU') {
            $prompt .= " The subject must visibly be {$nationality}" .
                ($v['context'] !== '' ? " in a {$v['context']} setting" : '') . '.';
        }
        try {
            $bytes = (self::$image)($prompt . ' ' . self::UNBRANDED_RULE);
            if ($bytes === '') {
                throw new \RuntimeException('Image provider returned no image');
            }
            $data = self::optimise($bytes);
        } catch (\Throwable $e) {
            return [500, ['success' => false, 'error' => 'Image generation failed. Your credits were not charged.']];
        }
        return [200, ['success' => true, 'imageData' => $data, 'slideIndex' => self::num($v['slideIndex']),
            'creditsUsed' => 0, 'creditsRemaining' => -1]];
    }

    /**
     * POST /api/moodle/content-creator/tts: one narration clip.
     *
     * @param mixed $body The request.
     * @return array [status, body]
     */
    public static function tts($body): array {
        $v = self::check($body, [
            'siteId' => ['str', null], 'apiKey' => ['str', null], 'text' => ['str', null, 1, 50000],
            'languageCode' => ['str', 'en-AU'], 'voiceId' => ['str', 'en-AU-Chirp3-HD-Kore'],
            'creditsToUse' => ['num', 5, 1], 'subtopicKey' => ['str', ''], 'sectionId' => ['str', ''],
        ]);
        if ($v === null) {
            return [400, ['success' => false, 'error' => 'Invalid request parameters']];
        }
        $ws = '[' . self::WS . ']';
        $text = preg_replace(['/-{3,}/u', '/\*{3,}/u', '/#{1,6}' . $ws . '*/u'], '', $v['text']);
        $text = self::jtrim(preg_replace('/' . $ws . '{2,}/u', ' ', $text));
        try {
            [$audio, $seconds, $type] = self::voiceover($text, $v['voiceId'], $v['languageCode']);
        } catch (\Throwable $e) {
            $code = $e->getCode();
            $message = $e->getMessage();
            $quota = $code === 429 || $code === 8 ||
                preg_match('/quota|rate.limit|resource.exhausted|too.many.requests/i', $message);
            $auth = $code === 403 || $code === 7 || $code === 16 || preg_match('/permission|forbidden|unauthenticated/i', $message);
            $error = $quota ? 'Voice generation temporarily unavailable due to rate limits. Please try again in a minute.'
                : ($auth ? 'Voice generation configuration error. Please contact your administrator.'
                : ($message !== '' ? $message : 'TTS generation failed'));
            return [$quota ? 429 : 500, ['success' => false, 'error' => $error,
                'errorType' => $quota ? 'quota' : ($auth ? 'auth' : 'unknown')]];
        }
        return [200, ['success' => true, 'audioContent' => base64_encode($audio), 'audioType' => $type,
            'durationSeconds' => self::num($seconds), 'credits' => -1]];
    }

    /**
     * The service's generateVoiceover(): one Ogg Opus clip, or MP3 pieces joined when the text is long.
     *
     * @param string $text
     * @param string $voiceid
     * @param string $language
     * @return array [audio bytes, seconds, mime type]
     */
    public static function voiceover(string $text, string $voiceid, string $language): array {
        $chunks = self::chunks($text, self::TTS_MAX_BYTES);
        $words = function () use ($text): int {
            return (int) max(2, ceil((count(preg_split('/[' . self::WS . ']+/u', $text)) / 150) * 60));
        };
        if (count($chunks) === 1) {
            $audio = self::synthesise($chunks[0], $voiceid, $language, 'ogg');
            try {
                $seconds = self::ogg_seconds($audio);
            } catch (\Throwable $e) {
                $seconds = $words();
            }
            return [$audio, $seconds, 'audio/ogg'];
        }
        $audio = '';
        foreach ($chunks as $chunk) {
            $audio .= self::synthesise($chunk, $voiceid, $language, 'mp3');
        }
        return [$audio, $words(), 'audio/mpeg'];
    }

    /**
     * One request to the voice, tried up to four times as the service does.
     *
     * @param string $text
     * @param string $voiceid
     * @param string $language
     * @param string $format ogg or mp3.
     * @return string
     */
    protected static function synthesise(string $text, string $voiceid, string $language, string $format): string {
        $wait = 1000;
        for ($attempt = 1;; $attempt++) {
            try {
                $audio = (self::$tts)($text, $voiceid, $language, $format);
                if ($audio === '') {
                    throw new \RuntimeException('No audio content in TTS response');
                }
                return $audio;
            } catch (\Throwable $e) {
                if ($attempt >= 4) {
                    throw $e;
                }
                $sleep = self::$sleep ?? function (int $ms): void {
                    usleep($ms * 1000);
                };
                $sleep(min(5000, $wait));
                $wait *= 2;
            }
        }
    }

    /**
     * The service's splitTextIntoChunks(): sentences packed into pieces of at most $max UTF-8 bytes.
     *
     * @param string $text
     * @param int $max
     * @return string[]
     */
    public static function chunks(string $text, int $max): array {
        if (strlen($text) <= $max) {
            return [$text];
        }
        $chunks = [];
        $current = '';
        foreach (preg_split('/(?<=[.!?])[' . self::WS . ']+/u', $text) as $sentence) {
            $test = $current . ($current !== '' ? ' ' : '') . $sentence;
            if (strlen($test) <= $max) {
                $current = $test;
                continue;
            }
            if ($current !== '') {
                $chunks[] = $current;
            }
            if (strlen($sentence) <= $max) {
                $current = $sentence;
                continue;
            }
            $remaining = $sentence;
            while (strlen($remaining) > $max) {
                $cut = (int) floor($max / 2);
                $sub = self::slice($remaining, 0, $cut);
                $space = strrpos($sub, ' ');
                if ($space !== false && self::len(substr($sub, 0, $space)) > self::len($sub) * 0.3) {
                    $cut = self::len(substr($sub, 0, $space));
                }
                $chunks[] = self::jtrim(self::slice($remaining, 0, $cut));
                $remaining = self::jtrim(self::slice($remaining, $cut));
            }
            $current = $remaining;
        }
        if (self::jtrim($current) !== '') {
            $chunks[] = self::jtrim($current);
        }
        return $chunks;
    }

    /**
     * The service's parseOggOpusDuration(): seconds from the last granule position.
     *
     * @param string $buffer Ogg Opus bytes.
     * @return float
     */
    public static function ogg_seconds(string $buffer): float {
        $offset = 0;
        $last = 0.0;
        $preskip = 0;
        $n = strlen($buffer);
        while ($offset + 27 <= $n) {
            if (substr($buffer, $offset, 4) !== 'OggS') {
                break;
            }
            $parts = unpack('Vlo/Vhi', $buffer, $offset + 6);
            $granule = $parts['hi'] * 4294967296.0 + $parts['lo'];
            $segments = ord($buffer[$offset + 26]);
            if ($offset + 27 + $segments > $n) {
                break;
            }
            $length = 0;
            for ($i = 0; $i < $segments; $i++) {
                $length += ord($buffer[$offset + 27 + $i]);
            }
            $start = $offset + 27 + $segments;
            if ($start + 8 <= $n && substr($buffer, $start, 8) === 'OpusHead' && $start + 12 <= $n) {
                $preskip = unpack('v', $buffer, $start + 10)[1];
            }
            if ($granule > 0) {
                $last = $granule;
            }
            $offset = $start + $length;
        }
        if ($last <= 0) {
            throw new \RuntimeException('Could not determine OGG duration');
        }
        return max(0.1, ($last - $preskip) / 48000);
    }

    /**
     * The service's optimizeImageBuffer(): at most 2400 pixels wide, JPEG quality 92, as a data URL.
     *
     * @param string $raw Image bytes.
     * @return string
     */
    public static function optimise(string $raw): string {
        $src = @imagecreatefromstring($raw);
        if ($src === false) {
            throw new \RuntimeException('Input buffer contains unsupported image format');
        }
        $w = imagesx($src);
        $h = imagesy($src);
        if ($w > 2400) {
            $nh = max(1, (int) round($h * 2400 / $w));
            $dst = imagecreatetruecolor(2400, $nh);
            imagecopyresampled($dst, $src, 0, 0, 0, 0, 2400, $nh, $w, $h);
            imagedestroy($src);
            $src = $dst;
        } else if (!imageistruecolor($src)) {
            imagepalettetotruecolor($src);
        }
        ob_start();
        imagejpeg($src, null, 92);
        $out = ob_get_clean();
        imagedestroy($src);
        return 'data:image/jpeg;base64,' . base64_encode($out);
    }

    /**
     * The service's hasCompleteConceptQuiz().
     *
     * @param mixed $value
     * @return bool
     */
    public static function complete_quiz($value): bool {
        if (!is_array($value) || count($value) !== 5) {
            return false;
        }
        $seen = [];
        foreach ($value as $q) {
            if (!is_object($q)) {
                return false;
            }
            $text = $q->question ?? null;
            $why = $q->explanation ?? null;
            $options = $q->options ?? null;
            $answer = $q->correctAnswer ?? null;
            if (!is_string($text) || self::jtrim($text) === '' || !is_string($why) || self::jtrim($why) === ''
                    || !is_array($options) || count($options) !== 4) {
                return false;
            }
            foreach ($options as $option) {
                if (!is_string($option) || self::jtrim($option) === '') {
                    return false;
                }
            }
            if (!(is_int($answer) || (is_float($answer) && is_finite($answer) && floor($answer) == $answer))
                    || $answer < 0 || $answer > 3) {
                return false;
            }
            $key = self::lower(self::jtrim($text));
            $distinct = array_unique(array_map(function ($o) {
                return self::lower(self::jtrim($o));
            }, $options));
            if (isset($seen[$key]) || count($distinct) !== 4) {
                return false;
            }
            $seen[$key] = true;
        }
        return true;
    }

    /**
     * The spelling or language rule for a voice language.
     *
     * @param string $lang
     * @param string $langname
     * @return string
     */
    protected static function spelling(string $lang, string $langname): string {
        if (!str_starts_with($lang, 'en-')) {
            return str_replace('{L}', $langname, self::LANGUAGE_RULE);
        }
        return $lang === 'en-AU' ? self::SPELL_AU : (str_starts_with($lang, 'en-US') ? self::SPELL_US : self::SPELL_GB);
    }

    /**
     * The service's zod request check: each field is [type str|num, default (null = required), min, max].
     * Lengths are counted as JavaScript counts them.
     *
     * @param mixed $body
     * @param array $fields
     * @return array|null The values, or null when the request is refused.
     */
    protected static function check($body, array $fields): ?array {
        if (!is_array($body) || (array_is_list($body) && $body)) {
            return null;
        }
        $out = [];
        foreach ($fields as $name => $rule) {
            [$type, $default] = $rule;
            $min = $rule[2] ?? null;
            $max = $rule[3] ?? null;
            if (!array_key_exists($name, $body)) {
                if ($default === null) {
                    return null;
                }
                $out[$name] = $default;
                continue;
            }
            $value = $body[$name];
            if ($type === 'str') {
                if (!is_string($value)) {
                    return null;
                }
                $size = self::len($value);
            } else {
                if (!is_int($value) && !is_float($value)) {
                    return null;
                }
                $size = $value;
            }
            if (($min !== null && $size < $min) || ($max !== null && $size > $max)) {
                return null;
            }
            $out[$name] = $value;
        }
        return $out;
    }

    // JavaScript semantics.

    /**
     * JavaScript truthiness.
     *
     * @param mixed $v
     * @return bool
     */
    protected static function truthy($v): bool {
        if (is_array($v) || is_object($v)) {
            return true;
        }
        return $v !== null && $v !== false && $v !== '' && $v !== 0 && $v !== 0.0;
    }

    /**
     * A number as JSON writes it: whole floats as integers.
     *
     * @param int|float $n
     * @return int|float
     */
    protected static function num($n) {
        return is_float($n) && is_finite($n) && floor($n) == $n && abs($n) < 1e15 ? (int) $n : $n;
    }

    /**
     * String(number).
     *
     * @param int|float $n
     * @return string
     */
    protected static function numstr($n): string {
        $n = self::num($n);
        return is_int($n) ? (string) $n : json_encode($n);
    }

    /**
     * String(value), as a template literal writes it.
     *
     * @param mixed $v
     * @return string
     */
    protected static function jsstr($v): string {
        if ($v === null) {
            return 'null';
        }
        if (is_bool($v)) {
            return $v ? 'true' : 'false';
        }
        if (is_int($v) || is_float($v)) {
            return self::numstr($v);
        }
        if (is_array($v)) {
            return implode(',', array_map(function ($x) {
                return $x === null ? '' : self::jsstr($x);
            }, $v));
        }
        if (is_object($v)) {
            return '[object Object]';
        }
        return (string) $v;
    }

    /**
     * String.prototype.toLowerCase().
     *
     * @param string $s
     * @return string
     */
    protected static function lower(string $s): string {
        return mb_strtolower($s, 'UTF-8');
    }

    /**
     * String.prototype.trim().
     *
     * @param string $s
     * @return string
     */
    public static function jtrim(string $s): string {
        return preg_replace('/^[' . self::WS . ']+|[' . self::WS . ']+$/u', '', $s);
    }

    /**
     * String length in UTF-16 code units, as JavaScript counts it.
     *
     * @param string $s
     * @return int
     */
    public static function len(string $s): int {
        return (int) (strlen(mb_convert_encoding($s, 'UTF-16LE', 'UTF-8')) / 2);
    }

    /**
     * String.prototype.slice() / substring() with a non-negative start, in UTF-16 code units.
     *
     * @param string $s
     * @param int $start
     * @param int|null $end
     * @return string
     */
    public static function slice(string $s, int $start, ?int $end = null): string {
        $u = mb_convert_encoding($s, 'UTF-16LE', 'UTF-8');
        $units = (int) (strlen($u) / 2);
        $end = $end === null ? $units : min($end, $units);
        if ($end <= $start) {
            return '';
        }
        // A surrogate pair cut in half becomes U+FFFD, as it does when JavaScript's string is sent on as UTF-8.
        $previous = mb_substitute_character();
        mb_substitute_character(0xFFFD);
        $out = mb_convert_encoding(substr($u, $start * 2, ($end - $start) * 2), 'UTF-8', 'UTF-16LE');
        mb_substitute_character($previous);
        return $out;
    }

    /**
     * JSON.stringify().
     *
     * @param mixed $v
     * @return string
     */
    protected static function json($v): string {
        return json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_LINE_TERMINATORS);
    }
}
