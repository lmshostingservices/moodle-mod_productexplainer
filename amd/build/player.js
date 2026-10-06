// AMD module for mod_productexplainer
// MUST remain in AMD define() format for Moodle 4.x compatibility.
/* jshint ignore:start */
define('mod_productexplainer/player', [], function() {
    'use strict';

    // ── Inline SVG icons ────────────────────────────────────────────────────────
    var ICONS = {
        sparkles: '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>',
        mic:      '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
        upload:   '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
        save:     '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
        chevL:    '<svg width="18" height="18" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
        chevR:    '<svg width="18" height="18" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
        image:    '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
        play:     '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="white"/></svg>',
        pause:    '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" fill="white"/><rect x="14" y="4" width="4" height="16" fill="white"/></svg>',
        box:      '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
        target:   '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        star:     '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        'circle-check': '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>',
        trophy:   '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>',
        user:     '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        users:    '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        briefcase:'<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
        tool:     '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
        settings: '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
        link:     '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
        edit:     '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
        x:        '<svg viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        headphones: '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
        lightbulb:  '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.1 1 2.9.8.8 1.4 1.9 1.4 3.1"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
        check:      '<svg viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        alert:      '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        zap:        '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        clipboard:  '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
        eye:        '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
        bookmark:   '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
        award:      '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>',
        download:   '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        video:      '<svg viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
        plus:       '<svg viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        lock:       '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    };

    function icon(name) {
        return ICONS[name] || '';
    }

    // ── State ───────────────────────────────────────────────────────────────────
    var cfg = {};
    var manifest = null;
    var currentSlide = 0;
    var pendingImageUploads = {}; // slideIndex -> File
    var addImagePendingFile = null; // file chosen in the Add Image Slide form
    var audioElements = {};
    var isPlayingAudio = false;
    var audioBlocked  = {};   // slideIndex -> true when the browser refused to autoplay it
    var audioFailed   = {};   // slideIndex -> true when the audio file could not be loaded
    var gestureUnlockBound = false;
    var lastVoiceoverError = '';
    var listenedSlides = {};
    var videoWatched = {};          // tracks which must-watch video slides have been fully viewed
    var ytMsgListenerBound = false; // ensure YouTube postMessage listener is attached only once
    var isBuilderPreviewMode = false;
    var totalSlides = 0;
    var certificateShown = false;
    var uploadedDocContent = '';
    var uploadedDocName = '';
    var selectedSlideCount = 6;
    var selectedQuizCount = 5;
    var selectedMode = '';              // 'product' | 'concept'
    var builderApp = null;              // reference to the app DOM element for sub-builders
    var conceptUploadedDocContent = '';
    var conceptUploadedDocName = '';
    var conceptSelectedLanguage = '';  // set on renderConceptBuilder, used for generate & voiceover
    var selectedVoiceStyle = '';       // chosen in voiceover panel; falls back to cfg.voiceStyle || 'Zephyr'

    // ── Quiz state ───────────────────────────────────────────────────────────
    var quizQuestions  = [];   // from manifest.quizQuestions
    var quizCurrentQ   = 0;    // position within quizOrder (NOT the question index)
    var quizScore      = 0;    // derived from quizResultMap — see recalcQuizScore()
    var quizSelected   = null;  // selected option index (0–3)
    var quizAnswered   = false;
    // FEAT-QUIZ-RETRY-WRONG: quizOrder holds the question indices presented in the
    // current run. A full run is [0..n-1]; a "retry incorrect" run holds only the
    // indices the student got wrong. quizResultMap remembers the outcome of every
    // question across runs (real question index -> true/false) so a retry of one
    // wrong question lifts the score for the whole quiz instead of restarting it.
    var quizOrder      = [];
    var quizResultMap  = {};
    var quizRetryMode  = false;
    var quizPassed     = false; // whether the last completed run met the pass mark
    var quizNextTimer  = null;  // pending 'unstick the Next button' safety timer
    var quizAttemptSaved = false; // slide-time data is only sent with the first save of a sitting
    var quizAudioCtx   = null;
    var quizCurrentAudio = null; // currently-playing Chirp HD quiz audio element
    var quizTtsGenId     = 0;   // incremented on each speakQuizText call; stale AJAX responses are discarded
    var prefetchQuizAudio = null;   // {text, audio, url} — feedback TTS pre-fetched while user decides
    var prefetchQuizGenId = 0;
    var prefetchQuizPending = false; // true while a prefetch AJAX call is still in-flight
    var prefetchAudioMap = {};      // multi-slot pre-warm cache: text → {audio, url}

    // ── Attempt tracking (rich analytics for teacher reporting) ───────────────
    var attemptStartTime  = 0;    // ms timestamp when player initialised
    var lastSlideIdx      = -1;   // previous slide index (for dwell-time calc)
    var slideEntryTime    = 0;    // ms timestamp when current slide became active
    var attemptSlideTimes = {};   // { idx: {idx, type, title, secs} }
    var attemptAnswers    = [];   // [{qidx, qtext, selectedidx, correctidx, iscorrect}]

    // Credit formula: Math.floor(count * 5/3) — verified: 6→10, 8→13, 10→16, 12→20.
    function slideCredits(count) {
        return Math.max(1, Math.floor(count * 5 / 3));
    }
    var VO_CREDITS_PER_SLIDE = 5;

    function genBtnLabel(count) {
        return icon('sparkles') + 'Generate ' + count + ' Training Slides <span class="pe-credit-badge">' + slideCredits(count) + ' credits</span>';
    }
    function voPanelDesc(count) {
        return 'Generate narration for all ' + count + ' slides &mdash; <strong>' + (count * VO_CREDITS_PER_SLIDE) + ' credits</strong> total';
    }

    // ── Init ────────────────────────────────────────────────────────────────────
    function init(config) {
        cfg = config;
        if (cfg.manifest) {
            try { manifest = JSON.parse(decodeURIComponent(cfg.manifest)); } catch (e) { manifest = null; }
        }

        var app = document.getElementById('pe-app');
        if (!app) return;

        // Hide the spinner placeholder.
        var loadingEl = document.getElementById('pe-loading');
        if (loadingEl) loadingEl.style.display = 'none';

        if (cfg.builderMode) {
            renderBuilder(app);
        } else {
            renderPlayer(app);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // BUILDER — dual-route dispatcher
    // ─────────────────────────────────────────────────────────────────────────────
    function renderBuilder(app) {
        builderApp = app;
        // If we already have a saved manifest, jump straight into its mode (edit mode).
        if (manifest && manifest.slides && manifest.slides.length) {
            selectedMode = manifest.mode || 'product';
            if (selectedMode === 'concept') {
                renderConceptBuilder(app);
            } else {
                renderProductBuilder(app);
            }
            return;
        }
        renderRouteSelection(app);
    }

    function renderRouteSelection(app) {
        builderApp = app;
        var html = '<div class="pe-builder pe-route-selection">';
        html += '<div class="pe-builder-header">';
        html += '<div class="pe-builder-icon">' + icon('sparkles') + '</div>';
        html += '<div><p class="pe-builder-title">AI Slide Flow</p>';
        html += '<p class="pe-builder-subtitle">Choose the type of training slides you want to create</p></div>';
        html += '</div>';

        html += '<div class="pe-route-cards">';

        // Route 1 — Product Explainer
        html += '<div class="pe-route-card" id="pe-route-product">';
        html += '<div class="pe-route-card-icon pe-route-card-icon--product">' + icon('box') + '</div>';
        html += '<p class="pe-route-card-title">Product Slides</p>';
        html += '<p class="pe-route-card-desc">Train staff on a specific product — features, benefits, how to recommend it, objection handling and more.</p>';
        html += '<ul class="pe-route-card-list">';
        html += '<li>' + icon('check') + '3–20 fully custom slides</li>';
        html += '<li>' + icon('check') + 'Upload product documents for AI context</li>';
        html += '<li>' + icon('check') + 'AI voiceover narration (optional)</li>';
        html += '<li>' + icon('check') + 'Knowledge quiz at the end</li>';
        html += '<li>' + icon('check') + 'Objection handling &amp; FAQs included</li>';
        html += '</ul>';
        html += '<button class="pe-btn pe-btn-primary pe-route-btn" id="pe-route-product-btn">' + icon('sparkles') + 'Create Product Slides</button>';
        html += '</div>';

        // Route 2 — Concept Explainer
        html += '<div class="pe-route-card" id="pe-route-concept">';
        html += '<div class="pe-route-card-icon pe-route-card-icon--concept">' + icon('lightbulb') + '</div>';
        html += '<p class="pe-route-card-title">Concept Slides</p>';
        html += '<p class="pe-route-card-desc">Teach a workplace concept, process or skill — structured across 7 pedagogically-designed slides with AI-generated imagery.</p>';
        html += '<ul class="pe-route-card-list">';
        html += '<li>' + icon('check') + '7 pedagogically-structured slides</li>';
        html += '<li>' + icon('check') + 'AI-generated images (Imagen 4)</li>';
        html += '<li>' + icon('check') + 'AI voiceover narration (optional)</li>';
        html += '<li>' + icon('check') + 'Knowledge quiz at the end</li>';
        html += '<li>' + icon('check') + 'Scenario, examples &amp; best practice</li>';
        html += '</ul>';
        html += '<button class="pe-btn pe-btn-concept pe-route-btn" id="pe-route-concept-btn">' + icon('lightbulb') + 'Create Concept Slides</button>';
        html += '</div>';

        html += '</div>'; // pe-route-cards
        html += '</div>'; // pe-builder
        app.innerHTML = html;

        var productBtn = document.getElementById('pe-route-product-btn');
        if (productBtn) productBtn.addEventListener('click', function() {
            selectedMode = 'product';
            renderProductBuilder(builderApp);
        });

        var conceptBtn = document.getElementById('pe-route-concept-btn');
        if (conceptBtn) conceptBtn.addEventListener('click', function() {
            selectedMode = 'concept';
            renderConceptBuilder(builderApp);
        });
    }

    function renderProductBuilder(app) {
        builderApp = app;
        selectedMode = 'product';
        conceptSelectedLanguage = cfg.voiceLanguage || 'en-AU'; // shared var; product route must initialise it
        var isEditMode = !!(manifest && manifest.slides && manifest.slides.length);
        var html = '<div class="pe-builder">';

        // Back button (not shown in edit mode)
        if (!isEditMode) {
            html += '<button class="pe-back-btn" id="pe-back-to-route">' + icon('chevL') + 'Change type</button>';
        }

        // Header
        html += '<div class="pe-builder-header">';
        html += '<div class="pe-builder-icon">' + icon('box') + '</div>';
        html += '<div><p class="pe-builder-title">Product Slides Builder</p>';
        html += '<p class="pe-builder-subtitle">Upload a product document to generate AI-powered training slides</p></div>';
        html += '</div>';

        // Product name
        html += '<div class="pe-form-group">';
        html += '<label class="pe-label" for="pe-product-name">Product Name<span class="pe-label-required">*</span></label>';
        html += '<input class="pe-input" id="pe-product-name" type="text" placeholder="e.g. Samsung Galaxy S25 Ultra" maxlength="120">';
        html += '</div>';

        // Language selector (same position as concept builder — after required fields, before optional content)
        html += '<div class="pe-form-group">';
        html += '<label class="pe-label" for="pe-product-language">Content &amp; Voice Language</label>';
        html += '<select class="pe-input" id="pe-product-language" style="cursor:pointer;">';
        VOICE_LANGUAGE_OPTIONS.forEach(function(opt) {
            var sel = (opt[0] === conceptSelectedLanguage) ? ' selected' : '';
            html += '<option value="' + opt[0] + '"' + sel + '>' + opt[1] + '</option>';
        });
        html += '</select>';
        html += '</div>';

        // Slide count
        html += '<div class="pe-form-group pe-slide-count-group">';
        html += '<label class="pe-label" for="pe-slide-count">Number of Slides</label>';
        html += '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">';
        html += '<input type="number" class="pe-input" id="pe-slide-count" min="3" max="20" value="6" style="width:80px;text-align:center;">';
        html += '<span id="pe-slide-credits-hint" style="font-size:0.85rem;color:#374151;">' + slideCredits(6) + ' credits to generate</span>';
        html += '<span style="font-size:0.8rem;color:#9ca3af;">Voiceover: +' + VO_CREDITS_PER_SLIDE + ' credits per slide</span>';
        html += '</div>';
        html += '</div>';

        html += '<div class="pe-form-group">';
        html += '<label class="pe-label" for="pe-quiz-count">Number of Quiz Questions</label>';
        html += '<div style="display:flex;align-items:center;gap:12px;">';
        html += '<input type="number" class="pe-input" id="pe-quiz-count" min="1" max="10" value="5" style="width:80px;text-align:center;">';
        html += '<span style="font-size:0.85rem;color:#6b7280;">1 – 10 questions</span>';
        html += '</div>';
        html += '</div>';

        // PDF upload
        html += '<div class="pe-form-group">';
        html += '<label class="pe-label">Product Document <span style="font-weight:400;color:#9ca3af;">(Optional — PDF, DOCX or TXT)</span></label>';
        html += '<div class="pe-upload-area" id="pe-doc-dropzone">';
        html += '<svg class="pe-upload-icon" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" fill="none"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>';
        html += '<p class="pe-upload-text">Click to upload or drag and drop</p>';
        html += '<p class="pe-upload-hint">PDF, DOCX or TXT &mdash; max 30 MB</p>';
        html += '<p class="pe-upload-filename" id="pe-doc-filename" style="display:none"></p>';
        html += '<input type="file" id="pe-doc-file-input" accept=".pdf,.docx,.doc,.txt" style="position:absolute;inset:0;opacity:0;cursor:pointer;">';
        html += '</div>';
        html += '</div>';

        // Divider
        html += '<div class="pe-divider"><div class="pe-divider-line"></div><span>or paste product info</span><div class="pe-divider-line"></div></div>';

        html += '<div class="pe-form-group">';
        html += '<label class="pe-label">Your Content <span style="font-weight:400;color:#9ca3af;">(Optional)</span></label>';
        html += '<p style="font-size:0.82rem;color:#6b7280;margin:0 0 8px 0;line-height:1.5;">';
        html += '<strong>100&ndash;1,200 words</strong> works best. Paste a ChatGPT product summary, spec sheet, brochure copy, ';
        html += 'or any product notes &mdash; the AI reads this as its <em>primary source</em> and builds slides directly from your content ';
        html += 'rather than guessing. Longer content is trimmed to the first ~1,200 words.';
        html += '</p>';
        html += '<textarea class="pe-textarea" id="pe-paste-content" rows="6" placeholder="e.g. Ask ChatGPT: \'Write a 400-word product overview for [product name] covering what it is, how it works, key features, benefits, target customer, and 3 common use cases.\' Then paste the result here. The more detail you provide, the more accurate and specific the slides will be."></textarea>';
        html += '</div>';

        // Generate button
        html += '<div class="pe-actions-row">';
        html += '<button class="pe-btn pe-btn-primary" id="pe-generate-btn">' + genBtnLabel(6) + '</button>';
        html += '</div>';
        html += '<div id="pe-generate-status"></div>';

        // Slide preview
        html += '<div id="pe-builder-slides" style="display:none">';
        html += '<div class="pe-builder-slides-section">';
        html += '<p class="pe-builder-slides-title">Preview &amp; Customise</p>';
        html += '<div id="pe-builder-player-area"></div>';
        html += '<p style="font-size:0.8rem;color:#6b7280;margin-top:10px;text-align:center;">Click the image area on each slide to upload your own photo or graphic.</p>';
        html += buildAddSlidePanel();
        html += '<div id="pe-narration-editor" style="display:none"></div>';
        html += '<div id="pe-quiz-editor" style="display:none"></div>';
        if (cfg.enableVoiceover) {
            html += '<div class="pe-voiceover-panel" id="pe-vo-panel">';
            html += '<div class="pe-voiceover-panel-icon">' + icon('headphones') + '</div>';
            html += '<div class="pe-voiceover-panel-text">';
            html += '<p class="pe-voiceover-panel-title">AI Voiceover Narration</p>';
            html += '<p class="pe-voiceover-panel-desc" id="pe-vo-panel-desc">' + voPanelDesc(6) + '</p>';
            html += '</div>';
            var curStyle = selectedVoiceStyle || cfg.voiceStyle || 'Zephyr';
            html += '<div style="margin:0 0 10px 0;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">';
            html += '<label style="font-size:0.82rem;font-weight:600;color:#374151;white-space:nowrap;">Voice:</label>';
            html += '<select class="pe-input" id="pe-vo-voice-style" style="flex:1;min-width:200px;cursor:pointer;">';
            VOICE_STYLE_OPTIONS.forEach(function(opt) {
                var sel = (opt[0] === curStyle) ? ' selected' : '';
                html += '<option value="' + opt[0] + '"' + sel + '>' + opt[1] + '</option>';
            });
            html += '</select>';
            html += '</div>';
            html += '<button class="pe-btn pe-btn-secondary pe-btn-sm" id="pe-vo-btn">' + icon('headphones') + 'Generate All Voiceovers</button>';
            html += '</div>';
            html += '<div id="pe-vo-status" class="pe-voiceover-progress" style="display:none"></div>';
        }
        html += '<div class="pe-save-bar">';
        html += '<button class="pe-btn pe-btn-secondary" id="pe-discard-btn">Cancel</button>';
        html += '<button class="pe-btn pe-btn-success" id="pe-save-btn">' + icon('save') + 'Save &amp; Publish Slides</button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        html += '</div>';
        app.innerHTML = html;

        var backBtn = document.getElementById('pe-back-to-route');
        if (backBtn) backBtn.addEventListener('click', function() { renderRouteSelection(builderApp); });

        bindBuilderEvents();

        if (manifest && manifest.slides && manifest.slides.length) {
            showBuilderSlides();
        }
    }

    // Voice style options for Chirp3-HD voices
    var VOICE_STYLE_OPTIONS = [
        ['Kore',   'Kore \u2014 Female, Clear & Professional'],
        ['Aoede',  'Aoede \u2014 Female, Warm & Friendly'],
        ['Leda',   'Leda \u2014 Female, Soft & Nurturing'],
        ['Zephyr', 'Zephyr \u2014 Neutral, Energetic'],
        ['Puck',   'Puck \u2014 Male, Friendly & Casual'],
        ['Charon', 'Charon \u2014 Male, Deep & Authoritative'],
        ['Fenrir', 'Fenrir \u2014 Male, Warm & Mature'],
        ['Orus',   'Orus \u2014 Male, Clear & Professional']
    ];

    // Language options shared between concept builder and voiceover generation.
    var VOICE_LANGUAGE_OPTIONS = [
        ['ar-XA','Arabic'],['bn-IN','Bengali (India)'],['bg-BG','Bulgarian'],
        ['yue-HK','Cantonese (Hong Kong)'],['ca-ES','Catalan (Spain)'],['hr-HR','Croatian'],
        ['cs-CZ','Czech'],['da-DK','Danish'],['nl-BE','Dutch (Belgium)'],['nl-NL','Dutch (Netherlands)'],
        ['en-AU','English (Australian)'],['en-GB','English (British)'],['en-IN','English (Indian)'],['en-US','English (American)'],
        ['et-EE','Estonian'],['fil-PH','Filipino (Philippines)'],['fi-FI','Finnish'],
        ['fr-CA','French (Canadian)'],['fr-FR','French (France)'],['de-DE','German'],['el-GR','Greek'],
        ['gu-IN','Gujarati (India)'],['he-IL','Hebrew'],['hi-IN','Hindi (India)'],['hu-HU','Hungarian'],
        ['is-IS','Icelandic'],['id-ID','Indonesian'],['it-IT','Italian'],['ja-JP','Japanese'],
        ['kn-IN','Kannada (India)'],['ko-KR','Korean'],['lv-LV','Latvian'],['lt-LT','Lithuanian'],
        ['ms-MY','Malay (Malaysia)'],['ml-IN','Malayalam (India)'],['cmn-CN','Mandarin Chinese (China)'],
        ['cmn-TW','Mandarin Chinese (Taiwan)'],['mr-IN','Marathi (India)'],['nb-NO','Norwegian'],
        ['pl-PL','Polish'],['pt-BR','Portuguese (Brazil)'],['pt-PT','Portuguese (Portugal)'],
        ['pa-IN','Punjabi (India)'],['ro-RO','Romanian'],['ru-RU','Russian'],['sr-RS','Serbian'],
        ['sk-SK','Slovak'],['sl-SI','Slovenian'],['es-ES','Spanish (Spain)'],['es-US','Spanish (US)'],
        ['sw-KE','Swahili'],['sv-SE','Swedish'],['ta-IN','Tamil (India)'],['te-IN','Telugu (India)'],
        ['th-TH','Thai'],['tr-TR','Turkish'],['uk-UA','Ukrainian'],['ur-IN','Urdu'],['vi-VN','Vietnamese']
    ];

    // ── Concept Explainer slide-label translations ───────────────────────────────
    var CX_LABEL_MAP = {
        'th-TH': { slide:'สไลด์', intro:'บทนำ', scenario:'สถานการณ์', keyconcept:'แนวคิดหลัก', example:'ตัวอย่างจริง', mistake:'ข้อผิดพลาดทั่วไป', practice:'แนวปฏิบัติที่ดี', summary:'บทสรุป', instead:'ทำสิ่งนี้แทน:', protip:'เคล็ดลับ:' },
        'de-DE': { slide:'Folie', intro:'Einführung', scenario:'Szenario', keyconcept:'Schlüsselkonzept', example:'Echtes Beispiel', mistake:'Häufiger Fehler', practice:'Beste Praxis', summary:'Zusammenfassung', instead:'Besser so:', protip:'Profi-Tipp:' },
        'fr-FR': { slide:'Diapositive', intro:'Introduction', scenario:'Scénario', keyconcept:'Concept clé', example:'Exemple réel', mistake:'Erreur courante', practice:'Bonne pratique', summary:'Résumé', instead:'Faites plutôt :', protip:'Conseil pro :' },
        'fr-CA': { slide:'Diapositive', intro:'Introduction', scenario:'Scénario', keyconcept:'Concept clé', example:'Exemple réel', mistake:'Erreur courante', practice:'Bonne pratique', summary:'Résumé', instead:'Faites plutôt :', protip:'Conseil pro :' },
        'es-ES': { slide:'Diapositiva', intro:'Introducción', scenario:'Escenario', keyconcept:'Concepto clave', example:'Ejemplo real', mistake:'Error común', practice:'Buena práctica', summary:'Resumen', instead:'Haz esto en cambio:', protip:'Consejo profesional:' },
        'es-US': { slide:'Diapositiva', intro:'Introducción', scenario:'Escenario', keyconcept:'Concepto clave', example:'Ejemplo real', mistake:'Error común', practice:'Buena práctica', summary:'Resumen', instead:'Haz esto en cambio:', protip:'Consejo profesional:' },
        'ja-JP': { slide:'スライド', intro:'はじめに', scenario:'シナリオ', keyconcept:'キーコンセプト', example:'実例', mistake:'よくある間違い', practice:'ベストプラクティス', summary:'まとめ', instead:'こうしましょう:', protip:'プロのヒント:' },
        'ko-KR': { slide:'슬라이드', intro:'소개', scenario:'시나리오', keyconcept:'핵심 개념', example:'실제 사례', mistake:'흔한 실수', practice:'모범 사례', summary:'요약', instead:'이렇게 하세요:', protip:'전문가 팁:' },
        'cmn-CN': { slide:'幻灯片', intro:'简介', scenario:'情景', keyconcept:'核心概念', example:'实际案例', mistake:'常见误区', practice:'最佳实践', summary:'总结', instead:'正确做法:', protip:'专业提示:' },
        'cmn-TW': { slide:'投影片', intro:'簡介', scenario:'情境', keyconcept:'核心概念', example:'實際案例', mistake:'常見錯誤', practice:'最佳實踐', summary:'總結', instead:'正確做法:', protip:'專業提示:' },
        'yue-HK': { slide:'投影片', intro:'簡介', scenario:'情境', keyconcept:'核心概念', example:'實際案例', mistake:'常見錯誤', practice:'最佳實踐', summary:'總結', instead:'正確做法:', protip:'專業提示:' },
        'id-ID': { slide:'Slide', intro:'Pendahuluan', scenario:'Skenario', keyconcept:'Konsep Utama', example:'Contoh Nyata', mistake:'Kesalahan Umum', practice:'Praktik Terbaik', summary:'Ringkasan', instead:'Lakukan ini:', protip:'Tips pro:' },
        'ms-MY': { slide:'Slaid', intro:'Pengenalan', scenario:'Senario', keyconcept:'Konsep Utama', example:'Contoh Sebenar', mistake:'Kesilapan Biasa', practice:'Amalan Terbaik', summary:'Ringkasan', instead:'Buat ini pula:', protip:'Petua pro:' },
        'vi-VN': { slide:'Trang', intro:'Giới thiệu', scenario:'Tình huống', keyconcept:'Khái niệm chính', example:'Ví dụ thực tế', mistake:'Lỗi thường gặp', practice:'Thực hành tốt nhất', summary:'Tóm tắt', instead:'Hãy làm thế này:', protip:'Mẹo chuyên nghiệp:' },
        'pt-BR': { slide:'Slide', intro:'Introdução', scenario:'Cenário', keyconcept:'Conceito-chave', example:'Exemplo real', mistake:'Erro comum', practice:'Boa prática', summary:'Resumo', instead:'Faça isso:', protip:'Dica profissional:' },
        'pt-PT': { slide:'Diapositivo', intro:'Introdução', scenario:'Cenário', keyconcept:'Conceito-chave', example:'Exemplo real', mistake:'Erro comum', practice:'Boa prática', summary:'Resumo', instead:'Faça isto:', protip:'Dica profissional:' },
        'it-IT': { slide:'Diapositiva', intro:'Introduzione', scenario:'Scenario', keyconcept:'Concetto chiave', example:'Esempio reale', mistake:'Errore comune', practice:'Buona pratica', summary:'Riepilogo', instead:'Fai invece così:', protip:'Consiglio pro:' },
        'ru-RU': { slide:'Слайд', intro:'Введение', scenario:'Сценарий', keyconcept:'Ключевая концепция', example:'Реальный пример', mistake:'Типичная ошибка', practice:'Лучшие практики', summary:'Резюме', instead:'Сделайте так:', protip:'Совет профессионала:' },
        'uk-UA': { slide:'Слайд', intro:'Вступ', scenario:'Сценарій', keyconcept:'Ключова концепція', example:'Реальний приклад', mistake:'Типова помилка', practice:'Найкращі практики', summary:'Резюме', instead:'Зробіть так:', protip:'Порада профессіонала:' },
        'hi-IN': { slide:'स्लाइड', intro:'परिचय', scenario:'परिदृश्य', keyconcept:'मुख्य अवधारणा', example:'वास्तविक उदाहरण', mistake:'सामान्य गलती', practice:'सर्वोत्तम अभ्यास', summary:'सारांश', instead:'इसके बजाय करें:', protip:'प्रो टिप:' },
        'ar-XA': { slide:'شريحة', intro:'مقدمة', scenario:'سيناريو', keyconcept:'المفهوم الرئيسي', example:'مثال واقعي', mistake:'خطأ شائع', practice:'أفضل الممارسات', summary:'ملخص', instead:'افعل هذا:', protip:'نصيحة:' },
        'nl-NL': { slide:'Dia', intro:'Inleiding', scenario:'Scenario', keyconcept:'Sleutelbegrip', example:'Echt voorbeeld', mistake:'Veelgemaakte fout', practice:'Beste aanpak', summary:'Samenvatting', instead:'Doe dit:', protip:'Pro tip:' },
        'nl-BE': { slide:'Dia', intro:'Inleiding', scenario:'Scenario', keyconcept:'Sleutelbegrip', example:'Echt voorbeeld', mistake:'Veelgemaakte fout', practice:'Beste aanpak', summary:'Samenvatting', instead:'Doe dit:', protip:'Pro tip:' },
        'pl-PL': { slide:'Slajd', intro:'Wprowadzenie', scenario:'Scenariusz', keyconcept:'Kluczowa koncepcja', example:'Rzeczywisty przykład', mistake:'Częsty błąd', practice:'Najlepsza praktyka', summary:'Podsumowanie', instead:'Zrób to zamiast:', protip:'Pro tip:' },
        'tr-TR': { slide:'Slayt', intro:'Giriş', scenario:'Senaryo', keyconcept:'Temel Kavram', example:'Gerçek Örnek', mistake:'Yaygın Hata', practice:'En İyi Uygulama', summary:'Özet', instead:'Bunun yerine:', protip:'Pro ipucu:' },
        'sv-SE': { slide:'Bild', intro:'Introduktion', scenario:'Scenario', keyconcept:'Nyckelkoncept', example:'Verkligt exempel', mistake:'Vanligt misstag', practice:'Bästa praxis', summary:'Sammanfattning', instead:'Gör så här:', protip:'Proffs-tips:' },
        'da-DK': { slide:'Slide', intro:'Introduktion', scenario:'Scenarie', keyconcept:'Nøglebegreb', example:'Virkeligt eksempel', mistake:'Typisk fejl', practice:'Bedste praksis', summary:'Resumé', instead:'Gør dette i stedet:', protip:'Pro tip:' },
        'nb-NO': { slide:'Lysbilde', intro:'Introduksjon', scenario:'Scenario', keyconcept:'Nøkkelbegrep', example:'Virkelig eksempel', mistake:'Vanlig feil', practice:'Beste praksis', summary:'Oppsummering', instead:'Gjør dette i stedet:', protip:'Pro tips:' },
        'fi-FI': { slide:'Dia', intro:'Johdanto', scenario:'Skenaario', keyconcept:'Avainkäsite', example:'Todellinen esimerkki', mistake:'Yleinen virhe', practice:'Paras käytäntö', summary:'Yhteenveto', instead:'Tee tämä sen sijaan:', protip:'Profsivinkki:' },
        'el-GR': { slide:'Διαφάνεια', intro:'Εισαγωγή', scenario:'Σενάριο', keyconcept:'Βασική Έννοια', example:'Πραγματικό Παράδειγμα', mistake:'Συνηθισμένο Λάθος', practice:'Καλύτερη Πρακτική', summary:'Περίληψη', instead:'Κάντε αυτό:', protip:'Επαγγελματική Συμβουλή:' },
        'cs-CZ': { slide:'Snímek', intro:'Úvod', scenario:'Scénář', keyconcept:'Klíčový koncept', example:'Skutečný příklad', mistake:'Běžná chyba', practice:'Nejlepší praxe', summary:'Shrnutí', instead:'Udělejte to místo toho:', protip:'Tip pro:' },
        'hu-HU': { slide:'Dia', intro:'Bevezetés', scenario:'Forgatókönyv', keyconcept:'Kulcsfogalom', example:'Valódi példa', mistake:'Gyakori hiba', practice:'Legjobb gyakorlat', summary:'Összefoglalás', instead:'Tegye ezt helyette:', protip:'Profi tipp:' },
        'ro-RO': { slide:'Diapozitiv', intro:'Introducere', scenario:'Scenariu', keyconcept:'Concept cheie', example:'Exemplu real', mistake:'Greșeală frecventă', practice:'Bună practică', summary:'Rezumat', instead:'Faceți asta:', protip:'Sfat pro:' },
        'fil-PH': { slide:'Slide', intro:'Panimula', scenario:'Senaryo', keyconcept:'Pangunahing Konsepto', example:'Tunay na Halimbawa', mistake:'Karaniwang Pagkakamali', practice:'Pinakamainam na Gawi', summary:'Buod', instead:'Gawin ito:', protip:'Pro tip:' },
        'sw-KE': { slide:'Slaidi', intro:'Utangulizi', scenario:'Hali', keyconcept:'Dhana Kuu', example:'Mfano Halisi', mistake:'Kosa la Kawaida', practice:'Mazoea Bora', summary:'Muhtasari', instead:'Fanya hivi:', protip:'Ushauri wa mtaalamu:' },
        'he-IL': { slide:'שקופית', intro:'מבוא', scenario:'תרחיש', keyconcept:'מושג מפתח', example:'דוגמה מהחיים', mistake:'טעות נפוצה', practice:'שיטות עבודה מומלצות', summary:'סיכום', instead:'עשה זאת במקום:', protip:'טיפ מקצועי:' },
        'bn-IN': { slide:'স্লাইড', intro:'ভূমিকা', scenario:'পরিস্থিতি', keyconcept:'মূল ধারণা', example:'বাস্তব উদাহরণ', mistake:'সাধারণ ভুল', practice:'সেরা অনুশীলন', summary:'সারাংশ', instead:'পরিবর্তে এটি করুন:', protip:'প্রো টিপ:' },
        'ta-IN': { slide:'ஸ்லைடு', intro:'அறிமுகம்', scenario:'சூழ்நிலை', keyconcept:'முக்கிய கருத்து', example:'உண்மையான உதாரணம்', mistake:'பொதுவான தவறு', practice:'சிறந்த நடைமுறை', summary:'சுருக்கம்', instead:'இதை செய்யுங்கள்:', protip:'நிபுணர் குறிப்பு:' },
    };

    function cxLabel(key) {
        var lang = (cfg && cfg.voiceLanguage) || 'en-AU';
        var map = CX_LABEL_MAP[lang] || {};
        var defaults = { slide:'Slide', intro:'Introduction', scenario:'Scenario', keyconcept:'Key Concept', example:'Real Example', mistake:'Common Mistake', practice:'Best Practice', summary:'Summary', instead:'Instead:', protip:'Pro tip:' };
        return map[key] !== undefined ? map[key] : (defaults[key] || key);
    }

    function renderConceptBuilder(app) {
        builderApp = app;
        selectedMode = 'concept';
        conceptSelectedLanguage = cfg.voiceLanguage || 'en-AU';
        var isEditMode = !!(manifest && manifest.slides && manifest.slides.length);
        var html = '<div class="pe-builder pe-concept-builder">';

        // Back button (not shown in edit mode)
        if (!isEditMode) {
            html += '<button class="pe-back-btn" id="pe-back-to-route">' + icon('chevL') + 'Change type</button>';
        }

        // Header
        html += '<div class="pe-builder-header">';
        html += '<div class="pe-builder-icon pe-builder-icon--concept">' + icon('lightbulb') + '</div>';
        html += '<div><p class="pe-builder-title">Concept Slides Builder</p>';
        html += '<p class="pe-builder-subtitle">AI creates 7 structured slides: introduction, scenario, key concept, real example, common mistake, best practice and summary.</p></div>';
        html += '</div>';

        // Concept name
        html += '<div class="pe-form-group">';
        html += '<label class="pe-label" for="pe-concept-name">Concept Name<span class="pe-label-required">*</span></label>';
        html += '<input class="pe-input" id="pe-concept-name" type="text" placeholder="e.g. Active Listening, WHS Risk Assessment, Manual Handling" maxlength="120">';
        html += '</div>';

        // Context
        html += '<div class="pe-form-group">';
        html += '<label class="pe-label" for="pe-concept-context">Workplace Context<span class="pe-label-required">*</span></label>';
        html += '<input class="pe-input" id="pe-concept-context" type="text" placeholder="e.g. Aged care facility, Construction site, Retail store" maxlength="200">';
        html += '</div>';

        // Target learner
        html += '<div class="pe-form-group">';
        html += '<label class="pe-label" for="pe-concept-role">Target Learner<span class="pe-label-required">*</span></label>';
        html += '<input class="pe-input" id="pe-concept-role" type="text" placeholder="e.g. New nurses, Site supervisors, Sales team" maxlength="120">';
        html += '</div>';

        // Language selector (drives both content generation and voiceover)
        html += '<div class="pe-form-group">';
        html += '<label class="pe-label" for="pe-concept-language">Content &amp; Voice Language</label>';
        html += '<select class="pe-input" id="pe-concept-language" style="cursor:pointer;">';
        VOICE_LANGUAGE_OPTIONS.forEach(function(opt) {
            var sel = (opt[0] === conceptSelectedLanguage) ? ' selected' : '';
            html += '<option value="' + opt[0] + '"' + sel + '>' + opt[1] + '</option>';
        });
        html += '</select>';
        html += '</div>';

        // Learning objective (optional)
        html += '<div class="pe-form-group">';
        html += '<label class="pe-label" for="pe-concept-objective">Learning Objective <span style="font-weight:400;color:#9ca3af;">(Optional)</span></label>';
        html += '<input class="pe-input" id="pe-concept-objective" type="text" placeholder="e.g. Understand and apply the concept in daily work situations" maxlength="250">';
        html += '</div>';

        // Own content (optional)
        html += '<div class="pe-form-group">';
        html += '<label class="pe-label">Own Content <span style="font-weight:400;color:#9ca3af;">(Optional — PDF, DOCX or TXT)</span></label>';
        html += '<div class="pe-upload-area" id="pe-concept-doc-dropzone">';
        html += '<svg class="pe-upload-icon" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" fill="none"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>';
        html += '<p class="pe-upload-text">Click to upload or drag and drop</p>';
        html += '<p class="pe-upload-hint">PDF, DOCX or TXT &mdash; max 30 MB</p>';
        html += '<p class="pe-upload-filename" id="pe-concept-filename" style="display:none"></p>';
        html += '<input type="file" id="pe-concept-file-input" accept=".pdf,.docx,.doc,.txt" style="position:absolute;inset:0;opacity:0;cursor:pointer;">';
        html += '</div>';
        html += '</div>';

        html += '<div class="pe-divider"><div class="pe-divider-line"></div><span>or paste your own content</span><div class="pe-divider-line"></div></div>';

        html += '<div class="pe-form-group">';
        html += '<label class="pe-label">Your Reference Content <span style="font-weight:400;color:#9ca3af;">(Optional)</span></label>';
        html += '<p style="font-size:0.82rem;color:#6b7280;margin:0 0 8px 0;line-height:1.5;">';
        html += '<strong>100&ndash;1,200 words</strong> works best. Paste a ChatGPT explanation of the concept, a workplace policy or SOP, ';
        html += 'training notes, or a case study &mdash; the AI uses this as its <em>primary source</em> and adapts your exact content into ';
        html += 'the 7-slide structure. Longer content is trimmed to the first ~1,200 words.';
        html += '</p>';
        html += '<textarea class="pe-textarea" id="pe-concept-paste" rows="6" placeholder="e.g. Ask ChatGPT: \'Write a 500-word explanation of [concept name] for [learner role] in [industry], covering what it is, why it matters at work, a real example of it going wrong, a real example of best practice, and the 3 most important things to remember.\' Then paste the result here."></textarea>';
        html += '</div>';

        html += '<div class="pe-form-group">';
        html += '<label class="pe-label" for="pe-concept-quiz-count">Number of Quiz Questions</label>';
        html += '<div style="display:flex;align-items:center;gap:12px;">';
        html += '<input type="number" class="pe-input" id="pe-concept-quiz-count" min="1" max="10" value="5" style="width:80px;text-align:center;">';
        html += '<span style="font-size:0.85rem;color:#6b7280;">1 – 10 questions</span>';
        html += '</div>';
        html += '</div>';

        // Credits note
        html += '<div class="pe-concept-credits-note">';
        html += icon('zap') + '<span>7 slides &mdash; <strong>10 credits</strong> to generate + <strong>2 credits</strong> per AI image (7 images = 14 credits)</span>';
        html += '</div>';

        // Generate button
        html += '<div class="pe-actions-row">';
        html += '<button class="pe-btn pe-btn-concept" id="pe-concept-generate-btn">' + icon('sparkles') + 'Generate Concept Explainer <span class="pe-credit-badge">10 credits + images</span></button>';
        html += '</div>';
        html += '<div id="pe-concept-generate-status"></div>';
        html += '<div id="pe-concept-image-progress" style="display:none;margin-top:8px;"></div>';

        // Slide preview
        html += '<div id="pe-builder-slides" style="display:none">';
        html += '<div class="pe-builder-slides-section">';
        html += '<p class="pe-builder-slides-title">Preview &amp; Customise</p>';
        html += '<div id="pe-builder-player-area"></div>';
        html += '<p style="font-size:0.8rem;color:#6b7280;margin-top:10px;text-align:center;">AI images are generated automatically. Click the image area to replace with your own.</p>';
        html += buildAddSlidePanel();
        html += '<div id="pe-narration-editor" style="display:none"></div>';
        html += '<div id="pe-quiz-editor" style="display:none"></div>';
        if (cfg.enableVoiceover) {
            html += '<div class="pe-voiceover-panel" id="pe-vo-panel">';
            html += '<div class="pe-voiceover-panel-icon">' + icon('headphones') + '</div>';
            html += '<div class="pe-voiceover-panel-text">';
            html += '<p class="pe-voiceover-panel-title">AI Voiceover Narration</p>';
            html += '<p class="pe-voiceover-panel-desc" id="pe-vo-panel-desc">' + voPanelDesc(7) + '</p>';
            html += '</div>';
            var curStyleC = selectedVoiceStyle || cfg.voiceStyle || 'Zephyr';
            html += '<div style="margin:0 0 10px 0;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">';
            html += '<label style="font-size:0.82rem;font-weight:600;color:#374151;white-space:nowrap;">Voice:</label>';
            html += '<select class="pe-input" id="pe-vo-voice-style" style="flex:1;min-width:200px;cursor:pointer;">';
            VOICE_STYLE_OPTIONS.forEach(function(opt) {
                var sel = (opt[0] === curStyleC) ? ' selected' : '';
                html += '<option value="' + opt[0] + '"' + sel + '>' + opt[1] + '</option>';
            });
            html += '</select>';
            html += '</div>';
            html += '<button class="pe-btn pe-btn-secondary pe-btn-sm" id="pe-vo-btn">' + icon('headphones') + 'Generate All Voiceovers</button>';
            html += '</div>';
            html += '<div id="pe-vo-status" class="pe-voiceover-progress" style="display:none"></div>';
        }
        html += '<div class="pe-save-bar">';
        html += '<button class="pe-btn pe-btn-secondary" id="pe-discard-btn">Cancel</button>';
        html += '<button class="pe-btn pe-btn-success" id="pe-save-btn">' + icon('save') + 'Save &amp; Publish Slides</button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        html += '</div>';
        app.innerHTML = html;

        var backBtn = document.getElementById('pe-back-to-route');
        if (backBtn) backBtn.addEventListener('click', function() { renderRouteSelection(builderApp); });

        bindConceptBuilderEvents();

        if (manifest && manifest.slides && manifest.slides.length && manifest.mode === 'concept') {
            showBuilderSlides();
        }
    }

    function bindBuilderEvents() {
        // File input change
        var fileInput = document.getElementById('pe-doc-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    var f = this.files[0];
                    uploadedDocName = f.name;
                    var nameEl = document.getElementById('pe-doc-filename');
                    if (nameEl) { nameEl.textContent = f.name; nameEl.style.display = 'block'; }
                    extractDocumentFile(f);
                }
            });
        }

        // Language selector — keep conceptSelectedLanguage in sync (shared with voiceover generator)
        var langSelProd = document.getElementById('pe-product-language');
        if (langSelProd) {
            langSelProd.addEventListener('change', function() {
                conceptSelectedLanguage = this.value;
            });
        }

        // Slide count input — validate range and update live credit hint
        var countInput = document.getElementById('pe-slide-count');
        if (countInput) {
            countInput.addEventListener('input', function() {
                var val = parseInt(this.value, 10);
                if (isNaN(val) || val < 3) val = 3;
                if (val > 20) val = 20;
                selectedSlideCount = val;
                var btn = document.getElementById('pe-generate-btn');
                if (btn && !btn.disabled) btn.innerHTML = genBtnLabel(selectedSlideCount);
                var voDesc = document.getElementById('pe-vo-panel-desc');
                if (voDesc) voDesc.innerHTML = voPanelDesc(selectedSlideCount);
                var hint = document.getElementById('pe-slide-credits-hint');
                if (hint) hint.textContent = slideCredits(selectedSlideCount) + ' credits to generate';
            });
        }

        // Quiz count input for product builder
        var quizCountInput = document.getElementById('pe-quiz-count');
        if (quizCountInput) {
            quizCountInput.addEventListener('input', function() {
                var val = parseInt(this.value, 10);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 10) val = 10;
                selectedQuizCount = val;
            });
        }

        // Quiz count input for concept builder
        var conceptQuizCountInput = document.getElementById('pe-concept-quiz-count');
        if (conceptQuizCountInput) {
            conceptQuizCountInput.addEventListener('input', function() {
                var val = parseInt(this.value, 10);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 10) val = 10;
                selectedQuizCount = val;
            });
        }

        // Generate button
        var genBtn = document.getElementById('pe-generate-btn');
        if (genBtn) genBtn.addEventListener('click', handleGenerate);

        // Voice style selector in voiceover panel
        var voStyleSel = document.getElementById('pe-vo-voice-style');
        if (voStyleSel) {
            voStyleSel.addEventListener('change', function() {
                selectedVoiceStyle = this.value;
            });
        }

        // Voiceover button
        var voBtn = document.getElementById('pe-vo-btn');
        if (voBtn) voBtn.addEventListener('click', handleGenerateAllVoiceovers);

        // Save button
        var saveBtn = document.getElementById('pe-save-btn');
        if (saveBtn) saveBtn.addEventListener('click', handleSave);

        // Discard button
        var discardBtn = document.getElementById('pe-discard-btn');
        if (discardBtn) {
            discardBtn.addEventListener('click', function() {
                window.location.href = window.location.pathname + '?id=' + cfg.cmid;
            });
        }

        bindAddSlidePanel();
    }

    function bindConceptBuilderEvents() {
        var fileInput = document.getElementById('pe-concept-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    var f = this.files[0];
                    conceptUploadedDocName = f.name;
                    var nameEl = document.getElementById('pe-concept-filename');
                    if (nameEl) { nameEl.textContent = f.name; nameEl.style.display = 'block'; }
                    extractConceptDocumentFile(f);
                }
            });
        }

        var langSel = document.getElementById('pe-concept-language');
        if (langSel) {
            langSel.addEventListener('change', function() {
                conceptSelectedLanguage = this.value;
            });
        }

        // Voice style selector in voiceover panel
        var voStyleSelC = document.getElementById('pe-vo-voice-style');
        if (voStyleSelC) {
            voStyleSelC.addEventListener('change', function() {
                selectedVoiceStyle = this.value;
            });
        }

        var genBtn = document.getElementById('pe-concept-generate-btn');
        if (genBtn) genBtn.addEventListener('click', handleGenerateConcept);

        var voBtn = document.getElementById('pe-vo-btn');
        if (voBtn) voBtn.addEventListener('click', handleGenerateAllVoiceovers);

        var saveBtn = document.getElementById('pe-save-btn');
        if (saveBtn) saveBtn.addEventListener('click', handleSave);

        var discardBtn = document.getElementById('pe-discard-btn');
        if (discardBtn) {
            discardBtn.addEventListener('click', function() {
                window.location.href = window.location.pathname + '?id=' + cfg.cmid;
            });
        }

        bindAddSlidePanel();
    }

    function extractDocumentFile(file) {
        var status = document.getElementById('pe-generate-status');
        if (status) { status.innerHTML = '<div class="pe-status-msg pe-status-info">Extracting document text...</div>'; }

        var reader = new FileReader();
        reader.onload = function(e) {
            var b64 = e.target.result.split(',')[1];
            var mimeType = file.type || 'application/octet-stream';
            ajaxPost(cfg.ajaxUrl, {
                action: 'extract_document',
                sesskey: cfg.sesskey,
                cmid: cfg.cmid
            }, JSON.stringify({ fileContent: b64, filename: file.name, mimeType: mimeType }), function(data) {
                if (data && data.success && data.text) {
                    uploadedDocContent = data.text;
                    if (status) {
                        status.innerHTML = '<div class="pe-status-msg pe-status-success">Document extracted successfully. Now click "Generate Slides".</div>';
                    }
                } else {
                    uploadedDocContent = '';
                    if (status) {
                        status.innerHTML = '<div class="pe-status-msg pe-status-error">Could not extract document: ' + escHtml(data && data.error ? data.error : 'Unknown error') + '</div>';
                    }
                }
            }, function(err) {
                if (status) status.innerHTML = '<div class="pe-status-msg pe-status-error">Upload failed: ' + escHtml(err) + '</div>';
            });
        };
        reader.readAsDataURL(file);
    }

    function extractConceptDocumentFile(file) {
        var status = document.getElementById('pe-concept-generate-status');
        if (status) { status.innerHTML = '<div class="pe-status-msg pe-status-info">Extracting document text...</div>'; }

        var reader = new FileReader();
        reader.onload = function(e) {
            var b64 = e.target.result.split(',')[1];
            var mimeType = file.type || 'application/octet-stream';
            ajaxPost(cfg.ajaxUrl, {
                action: 'extract_document',
                sesskey: cfg.sesskey,
                cmid: cfg.cmid
            }, JSON.stringify({ fileContent: b64, filename: file.name, mimeType: mimeType }), function(data) {
                if (data && data.success && data.text) {
                    conceptUploadedDocContent = data.text;
                    if (status) {
                        status.innerHTML = '<div class="pe-status-msg pe-status-success">Document extracted. Now click "Generate Concept Explainer".</div>';
                    }
                } else {
                    conceptUploadedDocContent = '';
                    if (status) {
                        status.innerHTML = '<div class="pe-status-msg pe-status-error">Could not extract document: ' + escHtml(data && data.error ? data.error : 'Unknown error') + '</div>';
                    }
                }
            }, function(err) {
                if (status) status.innerHTML = '<div class="pe-status-msg pe-status-error">Upload failed: ' + escHtml(err) + '</div>';
            });
        };
        reader.readAsDataURL(file);
    }

    function handleGenerate() {
        var productName = (document.getElementById('pe-product-name') || {}).value || '';
        productName = productName.trim();
        if (!productName) {
            showStatus('pe-generate-status', 'Product name is required.', 'error');
            return;
        }

        var pasteContent = (document.getElementById('pe-paste-content') || {}).value || '';
        var docContent = uploadedDocContent || pasteContent.trim();

        var btn = document.getElementById('pe-generate-btn');
        if (btn) { btn.disabled = true; btn.innerHTML = spinner() + 'Generating slides...'; }
        showStatus('pe-generate-status', 'Generating ' + selectedSlideCount + ' product training slides (this may take up to 30 seconds)...', 'info');

        ajaxPost(cfg.ajaxUrl, {
            action: 'generate_slides',
            sesskey: cfg.sesskey,
            cmid: cfg.cmid
        }, JSON.stringify({ productName: productName, documentContent: docContent, slideCount: selectedSlideCount, quizCount: selectedQuizCount, voiceLanguage: conceptSelectedLanguage }), function(data) {
            if (btn) { btn.disabled = false; btn.innerHTML = genBtnLabel(selectedSlideCount); }
            if (data && data.success && data.manifest) {
                manifest = data.manifest;
                manifest.mode = 'product';
                var qWarn = reconcileQuizCount(manifest, selectedQuizCount);
                var voDesc = document.getElementById('pe-vo-panel-desc');
                if (voDesc) voDesc.innerHTML = voPanelDesc(selectedSlideCount);
                showStatus('pe-generate-status', 'Slides generated! Generating AI images...' + qWarn, 'success');
                showBuilderSlides();
                generateConceptImages();
            } else {
                showStatus('pe-generate-status', 'Generation failed: ' + escHtml(data && data.error ? data.error : 'Unknown error'), 'error');
            }
        }, function(err) {
            if (btn) { btn.disabled = false; btn.innerHTML = genBtnLabel(selectedSlideCount); }
            showStatus('pe-generate-status', 'Request failed: ' + escHtml(err), 'error');
        });
    }

    function handleGenerateConcept() {
        var conceptName = ((document.getElementById('pe-concept-name') || {}).value || '').trim();
        var conceptContext = ((document.getElementById('pe-concept-context') || {}).value || '').trim();
        var learnerRole = ((document.getElementById('pe-concept-role') || {}).value || '').trim();
        var objective = ((document.getElementById('pe-concept-objective') || {}).value || '').trim();

        if (!conceptName || !conceptContext || !learnerRole) {
            showStatus('pe-concept-generate-status', 'Please fill in Concept Name, Workplace Context and Target Learner.', 'error');
            return;
        }

        var pasteContent = ((document.getElementById('pe-concept-paste') || {}).value || '').trim();
        var ownContent = conceptUploadedDocContent || pasteContent;

        var btn = document.getElementById('pe-concept-generate-btn');
        if (btn) { btn.disabled = true; btn.innerHTML = spinner() + 'Generating concept slides...'; }
        showStatus('pe-concept-generate-status', 'Generating 7 concept slides (this may take up to 30 seconds)...', 'info');

        ajaxPost(cfg.ajaxUrl, {
            action: 'generate_concept',
            sesskey: cfg.sesskey,
            cmid: cfg.cmid
        }, JSON.stringify({
            conceptName: conceptName,
            context: conceptContext,
            learnerRole: learnerRole,
            learningObjective: objective,
            ownContent: ownContent,
            voiceLanguage: conceptSelectedLanguage,
            quizCount: selectedQuizCount
        }), function(data) {
            if (btn) { btn.disabled = false; btn.innerHTML = icon('sparkles') + 'Generate Concept Explainer <span class="pe-credit-badge">10 credits + images</span>'; }
            if (data && data.success && data.manifest) {
                manifest = data.manifest;
                manifest.mode = 'concept';
                var qWarn = reconcileQuizCount(manifest, selectedQuizCount);
                showStatus('pe-concept-generate-status', 'Slides generated! Generating AI images for each slide...' + qWarn, 'success');
                showBuilderSlides();
                setTimeout(generateConceptImages, 400);
            } else {
                showStatus('pe-concept-generate-status', 'Generation failed: ' + escHtml(data && data.error ? data.error : 'Unknown error'), 'error');
            }
        }, function(err) {
            if (btn) { btn.disabled = false; btn.innerHTML = icon('sparkles') + 'Generate Concept Explainer <span class="pe-credit-badge">10 credits + images</span>'; }
            showStatus('pe-concept-generate-status', 'Request failed: ' + escHtml(err), 'error');
        });
    }

    // Build the inner HTML for an image column that has a successfully loaded image.
    function buildImageColInner(slideIdx, imageUrl) {
        return '<img src="' + escHtml(imageUrl) + '" alt="Slide image" style="max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;">'
            + buildRegenOverlay(slideIdx);
    }

    // Build the overlay bar shown at the bottom of the image column in builder mode.
    function buildRegenOverlay(slideIdx) {
        var slide = manifest && manifest.slides && manifest.slides[slideIdx];
        var html = '<div class="pe-slide-img-overlay">'
            + '<button class="pe-slide-img-upload-btn">' + icon('upload') + ' Upload image<input type="file" class="pe-img-file-input" data-slide="' + slideIdx + '" accept="image/*"></button>';
        if (slide && slide.imagePrompt) {
            html += '<button class="pe-slide-img-regen-btn" data-slide="' + slideIdx + '" data-action="regen-image">' + icon('sparkles') + ' New image <span class="pe-img-credit-pill">2 credits</span></button>';
        }
        html += '<button class="pe-slide-img-toggle-btn pe-slide-img-toggle-btn--remove" data-slide="' + slideIdx + '" data-action="remove-image">' + icon('x') + ' Remove</button>'
            + '</div>';
        return html;
    }

    function youtubeEmbedUrl(url) {
        if (!url) return '';
        var m;
        if ((m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/))) return 'https://www.youtube.com/embed/' + m[1] + '?rel=0';
        if ((m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/))) return 'https://www.youtube.com/embed/' + m[1] + '?rel=0';
        if ((m = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/))) return 'https://www.youtube.com/embed/' + m[1] + '?rel=0';
        if ((m = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/))) return 'https://www.youtube.com/embed/' + m[1] + '?rel=0';
        return ''; // not a recognised YouTube URL
    }

    function generateConceptImages() {
        if (!manifest || !manifest.slides || !manifest.slides.length) return;
        var slides = manifest.slides;
        var total = slides.length;
        var idx = 0;

        var progressEl = document.getElementById('pe-concept-image-progress');
        if (progressEl) {
            progressEl.style.display = 'block';
            progressEl.innerHTML = '<div class="pe-status-msg pe-status-info">' + spinner() + 'Generating AI images... 0 of ' + total + '</div>';
        }

        function doNext() {
            if (idx >= total) {
                if (progressEl) {
                    progressEl.innerHTML = '<div class="pe-status-msg pe-status-success">All ' + total + ' AI images generated!</div>';
                    setTimeout(function() { if (progressEl) progressEl.style.display = 'none'; }, 4000);
                }
                return;
            }
            var slide = slides[idx];
            var imagePrompt = slide.imagePrompt || '';
            if (!imagePrompt || slide.imageUrl) {
                idx++;
                doNext();
                return;
            }

            if (progressEl) {
                progressEl.innerHTML = '<div class="pe-status-msg pe-status-info">' + spinner() + 'Generating AI image ' + (idx + 1) + ' of ' + total + '...</div>';
            }

            var currentIdx = idx;
            ajaxPost(cfg.ajaxUrl, {
                action: 'generate_concept_image',
                sesskey: cfg.sesskey,
                cmid: cfg.cmid
            }, JSON.stringify({ slideIndex: currentIdx, imagePrompt: imagePrompt }), function(data) {
                if (data && data.success && data.imageUrl) {
                    slides[currentIdx].imageUrl = data.imageUrl;
                    var imgContainer = document.getElementById('pe-slide-img-' + currentIdx);
                    if (imgContainer) {
                        imgContainer.className = 'pe-slide-image-col';
                        imgContainer.innerHTML = buildImageColInner(currentIdx, data.imageUrl);
                    }
                }
                idx++;
                doNext();
            }, function() {
                idx++;
                doNext();
            });
        }
        doNext();
    }

    function renderNarrationEditorHTML() {
        if (!manifest || !manifest.slides) return '';
        var slides = manifest.slides;
        var chevDown = '<svg viewBox="0 0 24 24" width="16" height="16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" fill="none"><polyline points="6 9 12 15 18 9"/></svg>';
        var html = '<div class="pe-narration-editor">';
        html += '<div class="pe-narration-header" id="pe-narration-header">';
        html += '<div class="pe-narration-header-left">';
        html += '<span class="pe-narration-header-icon">' + icon('edit') + '</span>';
        html += '<div>';
        html += '<p class="pe-narration-title">Narration Scripts</p>';
        html += '<p class="pe-narration-desc">Review and edit the spoken narration for each slide <strong>before</strong> generating voiceover &mdash; editing after costs extra credits.</p>';
        html += '</div>';
        html += '</div>';
        html += '<button class="pe-narration-toggle-btn" id="pe-narration-toggle-btn" type="button">' + chevDown + '<span>Expand</span></button>';
        html += '</div>';
        html += '<div class="pe-narration-body" id="pe-narration-body" style="display:none">';
        for (var i = 0; i < slides.length; i++) {
            var slide = slides[i];
            var text = buildVoiceoverText(slide);
            html += '<div class="pe-narration-slide-item">';
            html += '<p class="pe-narration-slide-label">Slide ' + (i + 1) + ' &bull; ' + escHtml(slide.title || '') + '</p>';
            html += '<textarea class="pe-narration-ta" data-narration-idx="' + i + '" rows="4">' + escHtml(text) + '</textarea>';
            html += '</div>';
        }
        html += '</div>';
        html += '</div>';
        return html;
    }

    function bindNarrationEditorEvents() {
        var toggleBtn = document.getElementById('pe-narration-toggle-btn');
        var body = document.getElementById('pe-narration-body');
        var chevUp = '<svg viewBox="0 0 24 24" width="16" height="16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" fill="none"><polyline points="18 15 12 9 6 15"/></svg>';
        var chevDown = '<svg viewBox="0 0 24 24" width="16" height="16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" fill="none"><polyline points="6 9 12 15 18 9"/></svg>';
        if (toggleBtn && body) {
            toggleBtn.addEventListener('click', function() {
                var isOpen = body.style.display !== 'none';
                body.style.display = isOpen ? 'none' : 'block';
                toggleBtn.innerHTML = isOpen ? chevDown + '<span>Expand</span>' : chevUp + '<span>Collapse</span>';
            });
        }
        // Bind textarea changes → update manifest voiceoverText in real time
        var narrationEl = document.getElementById('pe-narration-editor');
        if (!narrationEl) return;
        var textareas = narrationEl.querySelectorAll('.pe-narration-ta');
        for (var i = 0; i < textareas.length; i++) {
            (function(ta) {
                ta.addEventListener('input', function() {
                    var idx = parseInt(ta.getAttribute('data-narration-idx'), 10);
                    if (!isNaN(idx) && manifest && manifest.slides && manifest.slides[idx]) {
                        manifest.slides[idx].voiceoverText = ta.value;
                    }
                });
            })(textareas[i]);
        }
    }

    // ── Quiz editor (builder view) ────────────────────────────────────────────

    function renderQuizEditorHTML() {
        if (!manifest || !manifest.quizQuestions || !manifest.quizQuestions.length) return '';
        var qs = manifest.quizQuestions;
        var letters = ['A', 'B', 'C', 'D'];
        var chevDown = '<svg viewBox="0 0 24 24" width="16" height="16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" fill="none"><polyline points="6 9 12 15 18 9"/></svg>';
        var html = '<div class="pe-narration-editor">';
        html += '<div class="pe-narration-header" id="pe-quiz-editor-header">';
        html += '<div class="pe-narration-header-left">';
        html += '<span class="pe-narration-header-icon">' + icon('clipboard') + '</span>';
        html += '<div>';
        html += '<p class="pe-narration-title">Quiz Questions</p>';
        html += '<p class="pe-narration-desc">Edit questions, answer options, correct answer (radio button), and feedback text. Changes are included when you Save &amp; Publish.</p>';
        html += '</div>';
        html += '</div>';
        html += '<button class="pe-narration-toggle-btn" id="pe-quiz-editor-toggle" type="button">' + chevDown + '<span>Expand</span></button>';
        html += '</div>';
        html += '<div class="pe-narration-body" id="pe-quiz-editor-body" style="display:none">';
        for (var qi = 0; qi < qs.length; qi++) {
            var q = qs[qi];
            html += '<div class="pe-quiz-edit-item">';
            html += '<p class="pe-narration-slide-label">Question ' + (qi + 1) + '</p>';
            html += '<textarea class="pe-narration-ta pe-quiz-edit-qtext" data-qi="' + qi + '" rows="2" placeholder="Question text">' + escHtml(q.question || '') + '</textarea>';
            html += '<div class="pe-quiz-edit-options">';
            for (var oi = 0; oi < 4; oi++) {
                var isCorrect = (q.correctAnswer === oi);
                var optVal = (q.options && q.options[oi]) ? q.options[oi] : '';
                html += '<div class="pe-quiz-edit-opt-row">';
                html += '<label class="pe-quiz-edit-correct-wrap" title="Mark as correct answer">';
                html += '<input type="radio" name="pe-qcorrect-' + qi + '" class="pe-quiz-edit-correct" data-qi="' + qi + '" data-oi="' + oi + '"' + (isCorrect ? ' checked' : '') + '>';
                html += '</label>';
                html += '<span class="pe-quiz-edit-letter' + (isCorrect ? ' pe-quiz-edit-letter-correct' : '') + '">' + letters[oi] + '</span>';
                html += '<input type="text" class="pe-quiz-edit-optinput" data-qi="' + qi + '" data-oi="' + oi + '" value="' + escHtml(optVal) + '" placeholder="Option ' + letters[oi] + '">';
                html += '</div>';
            }
            html += '</div>';
            html += '<label class="pe-narration-slide-label" style="margin-top:8px;display:block;">Feedback (read aloud after answering)</label>';
            html += '<textarea class="pe-narration-ta pe-quiz-edit-feedback" data-qi="' + qi + '" rows="2" placeholder="Explain why the correct answer is right">' + escHtml(q.explanation || '') + '</textarea>';
            html += '</div>';
        }
        html += '</div>';
        html += '</div>';
        return html;
    }

    function bindQuizEditorEvents() {
        var toggleBtn = document.getElementById('pe-quiz-editor-toggle');
        var body      = document.getElementById('pe-quiz-editor-body');
        var chevUp   = '<svg viewBox="0 0 24 24" width="16" height="16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" fill="none"><polyline points="18 15 12 9 6 15"/></svg>';
        var chevDown = '<svg viewBox="0 0 24 24" width="16" height="16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" fill="none"><polyline points="6 9 12 15 18 9"/></svg>';
        if (toggleBtn && body) {
            toggleBtn.addEventListener('click', function() {
                var isOpen = body.style.display !== 'none';
                body.style.display = isOpen ? 'none' : 'block';
                toggleBtn.innerHTML = isOpen ? chevDown + '<span>Expand</span>' : chevUp + '<span>Collapse</span>';
            });
        }
        var quizEl = document.getElementById('pe-quiz-editor');
        if (!quizEl) return;

        // Question text
        var qTexts = quizEl.querySelectorAll('.pe-quiz-edit-qtext');
        for (var t = 0; t < qTexts.length; t++) {
            (function(el) {
                el.addEventListener('input', function() {
                    var qi = parseInt(el.getAttribute('data-qi'), 10);
                    if (!isNaN(qi) && manifest && manifest.quizQuestions && manifest.quizQuestions[qi]) {
                        manifest.quizQuestions[qi].question = el.value;
                    }
                });
            })(qTexts[t]);
        }

        // Option text inputs
        var optInputs = quizEl.querySelectorAll('.pe-quiz-edit-optinput');
        for (var oi = 0; oi < optInputs.length; oi++) {
            (function(el) {
                el.addEventListener('input', function() {
                    var qi = parseInt(el.getAttribute('data-qi'), 10);
                    var idx = parseInt(el.getAttribute('data-oi'), 10);
                    if (!isNaN(qi) && !isNaN(idx) && manifest && manifest.quizQuestions && manifest.quizQuestions[qi]) {
                        if (!manifest.quizQuestions[qi].options) manifest.quizQuestions[qi].options = ['', '', '', ''];
                        manifest.quizQuestions[qi].options[idx] = el.value;
                    }
                });
            })(optInputs[oi]);
        }

        // Correct answer radios — also update letter highlight
        var radios = quizEl.querySelectorAll('.pe-quiz-edit-correct');
        for (var ri = 0; ri < radios.length; ri++) {
            (function(el) {
                el.addEventListener('change', function() {
                    if (!el.checked) return;
                    var qi = parseInt(el.getAttribute('data-qi'), 10);
                    var idx = parseInt(el.getAttribute('data-oi'), 10);
                    if (!isNaN(qi) && !isNaN(idx) && manifest && manifest.quizQuestions && manifest.quizQuestions[qi]) {
                        manifest.quizQuestions[qi].correctAnswer = idx;
                    }
                    // Update letter highlight for this question's rows
                    var rows = quizEl.querySelectorAll('[data-qi="' + qi + '"].pe-quiz-edit-letter, [data-qi="' + qi + '"]');
                    var letters = quizEl.querySelectorAll('.pe-quiz-edit-opt-row [data-qi="' + qi + '"]');
                    // Re-highlight letters
                    var allLetters = quizEl.querySelectorAll('.pe-quiz-edit-letter');
                    for (var li = 0; li < allLetters.length; li++) {
                        var letter = allLetters[li];
                        var lqi = letter.getAttribute('data-qi');
                        var loi = letter.getAttribute('data-oi');
                        if (lqi === String(qi)) {
                            if (parseInt(loi, 10) === idx) {
                                letter.classList.add('pe-quiz-edit-letter-correct');
                            } else {
                                letter.classList.remove('pe-quiz-edit-letter-correct');
                            }
                        }
                    }
                });
            })(radios[ri]);
        }

        // Feedback / explanation textareas
        var feedbacks = quizEl.querySelectorAll('.pe-quiz-edit-feedback');
        for (var fi = 0; fi < feedbacks.length; fi++) {
            (function(el) {
                el.addEventListener('input', function() {
                    var qi = parseInt(el.getAttribute('data-qi'), 10);
                    if (!isNaN(qi) && manifest && manifest.quizQuestions && manifest.quizQuestions[qi]) {
                        manifest.quizQuestions[qi].explanation = el.value;
                    }
                });
            })(feedbacks[fi]);
        }
    }

    // ── Custom slide renderers ────────────────────────────────────────────────

    function renderVideoSlide(slide, idx, isBuilderPreview) {
        var active = (idx === currentSlide) ? ' pe-active' : '';
        var html = '<div class="pe-slide' + active + '" id="pe-slide-' + idx + '">';
        html += '<div class="pe-slide-inner pe-custom-slide-inner pe-video-slide-inner">';
        // v1.0.71 FIX-HEADING-CONSISTENCY: Show "Slide X • Title" same as all other slide types
        html += '<p class="pe-slide-title">' + cxLabel('slide') + ' ' + (idx + 1)
            + (slide.title ? ' &bull; ' + escHtml(slide.title) : '') + '</p>';
        var embedUrl = youtubeEmbedUrl(slide.videoUrl || '');
        var isMustWatch = !isBuilderPreview && !!slide.mustWatchVideo;
        if (isMustWatch && embedUrl) {
            // enablejsapi=1 — allows postMessage events; controls=0 — hides seek bar so students can't skip to end
            embedUrl += (embedUrl.indexOf('?') >= 0 ? '&' : '?') + 'enablejsapi=1&controls=0';
        }
        if (embedUrl) {
            var iframeId = isMustWatch ? (' id="pe-video-iframe-' + idx + '"') : '';
            html += '<div class="pe-video-ratio-box"><iframe class="pe-video-iframe"' + iframeId + ' src="' + escHtml(embedUrl) + '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div>';
            if (isMustWatch) {
                html += '<div class="pe-must-watch-banner" id="pe-must-watch-banner-' + idx + '">';
                html += icon('lock') + '<span>Watch the full video to continue</span>';
                html += '</div>';
            }
        } else {
            html += '<p class="pe-custom-slide-error">' + icon('alert') + ' No valid YouTube URL set.</p>';
        }
        html += '</div></div>';
        return html;
    }

    function renderImageSlide(slide, idx, isBuilderPreview) {
        var active = (idx === currentSlide) ? ' pe-active' : '';
        var html = '<div class="pe-slide' + active + '" id="pe-slide-' + idx + '">';
        html += '<div class="pe-slide-inner pe-custom-slide-inner pe-image-slide-inner">';
        // v1.0.71 FIX-HEADING-CONSISTENCY: Show "Slide X • Title" same as all other slide types
        html += '<p class="pe-slide-title">' + cxLabel('slide') + ' ' + (idx + 1)
            + (slide.title ? ' &bull; ' + escHtml(slide.title) : '') + '</p>';
        if (slide.imageUrl) {
            html += '<div class="pe-image-slide-img-wrap"><img src="' + escHtml(slide.imageUrl) + '" alt="' + escHtml(slide.title || 'Slide image') + '"></div>';
        } else {
            html += '<div class="pe-image-slide-img-wrap pe-image-slide-empty">' + icon('image') + '<span>' + (isBuilderPreview ? 'Upload an image below' : 'No image') + '</span></div>';
        }
        if (isBuilderPreview) {
            // v1.0.71 FIX-IMAGE-BTN-ORDER: Remove Image → Upload Image → Remove Slide
            html += '<div class="pe-custom-slide-actions">';
            if (slide.imageUrl) {
                html += '<button class="pe-custom-slide-delete-btn pe-custom-remove-img-btn" data-slide="' + idx + '" data-action="remove-custom-image">' + icon('x') + ' Remove Image</button>';
            }
            html += '<label class="pe-slide-img-upload-btn pe-custom-upload-label" style="cursor:pointer;position:relative;overflow:hidden;">'
                + icon('upload') + ' Upload Image'
                + '<input type="file" class="pe-img-file-input" data-slide="' + idx + '" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;font-size:100px;">'
                + '</label>';
            html += '<button class="pe-custom-slide-delete-btn" data-slide="' + idx + '" data-action="delete-custom-slide">' + icon('x') + ' Remove Slide</button>';
            html += '</div>';
        }
        html += '</div></div>';
        return html;
    }

    // Builds the "Add a slide" panel HTML (shared by both builders).
    function buildAddSlidePanel() {
        var h = '<div class="pe-add-slide-panel" id="pe-add-slide-panel">';
        h += '<div class="pe-add-slide-header">';
        h += '<span class="pe-add-slide-label">' + icon('plus') + 'Add a slide</span>';
        h += '<button class="pe-add-slide-type-btn" id="pe-show-add-video" type="button">' + icon('video') + 'Video Slide</button>';
        h += '<button class="pe-add-slide-type-btn" id="pe-show-add-image" type="button">' + icon('image') + 'Image Slide</button>';
        h += '</div>';
        // Video form
        h += '<div class="pe-add-slide-form" id="pe-add-video-form" style="display:none">';
        h += '<div class="pe-add-slide-form-fields">';
        h += '<input class="pe-input" id="pe-add-video-url" type="url" placeholder="YouTube URL (e.g. https://youtube.com/watch?v=…)">';
        h += '<input class="pe-input" id="pe-add-video-title" type="text" placeholder="Optional slide title">';
        h += '<label class="pe-add-video-mustwatch-label">';
        h += '<input type="checkbox" id="pe-add-video-mustwatch"> ';
        h += icon('lock') + ' Must watch whole video before advancing';
        h += '</label>';
        h += '</div>';
        h += '<div class="pe-add-slide-form-btns">';
        h += '<button class="pe-btn pe-btn-primary pe-btn-sm" id="pe-add-video-confirm" type="button">Add Video Slide</button>';
        h += '<button class="pe-btn pe-btn-secondary pe-btn-sm" id="pe-add-video-cancel" type="button">Cancel</button>';
        h += '</div></div>';
        // Image form
        h += '<div class="pe-add-slide-form" id="pe-add-image-form" style="display:none">';
        h += '<div class="pe-add-slide-form-fields">';
        h += '<input class="pe-input" id="pe-add-image-title" type="text" placeholder="Optional slide title">';
        h += '<label class="pe-slide-img-upload-btn" style="cursor:pointer;position:relative;overflow:hidden;">'
            + icon('upload') + ' Choose image'
            + '<input id="pe-add-image-file" type="file" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;font-size:100px;">'
            + '</label>';
        h += '<span class="pe-add-image-filename" id="pe-add-image-filename"></span>';
        h += '</div>';
        h += '<div class="pe-add-slide-form-btns">';
        h += '<button class="pe-btn pe-btn-primary pe-btn-sm" id="pe-add-image-confirm" type="button">Add Image Slide</button>';
        h += '<button class="pe-btn pe-btn-secondary pe-btn-sm" id="pe-add-image-cancel" type="button">Cancel</button>';
        h += '</div></div>';
        h += '</div>';
        return h;
    }

    // Binds all events for the add-slide panel — call once after DOM is built.
    function bindAddSlidePanel() {
        var panel = document.getElementById('pe-add-slide-panel');
        if (!panel) return;

        function hideAllForms() {
            var vf = document.getElementById('pe-add-video-form');
            var imf = document.getElementById('pe-add-image-form');
            if (vf) vf.style.display = 'none';
            if (imf) imf.style.display = 'none';
        }

        var showVideo = document.getElementById('pe-show-add-video');
        var showImage = document.getElementById('pe-show-add-image');
        if (showVideo) {
            showVideo.addEventListener('click', function() {
                var vf = document.getElementById('pe-add-video-form');
                var imf = document.getElementById('pe-add-image-form');
                var isOpen = vf && vf.style.display !== 'none';
                hideAllForms();
                if (!isOpen && vf) vf.style.display = 'block';
            });
        }
        if (showImage) {
            showImage.addEventListener('click', function() {
                var vf = document.getElementById('pe-add-video-form');
                var imf = document.getElementById('pe-add-image-form');
                var isOpen = imf && imf.style.display !== 'none';
                hideAllForms();
                if (!isOpen && imf) imf.style.display = 'block';
            });
        }

        var cancelVideo = document.getElementById('pe-add-video-cancel');
        if (cancelVideo) cancelVideo.addEventListener('click', hideAllForms);

        var cancelImage = document.getElementById('pe-add-image-cancel');
        if (cancelImage) cancelImage.addEventListener('click', function() {
            hideAllForms();
            addImagePendingFile = null;
            var fn = document.getElementById('pe-add-image-filename');
            if (fn) fn.textContent = '';
        });

        // File picker for image slide
        var addImageFileInput = document.getElementById('pe-add-image-file');
        if (addImageFileInput) {
            addImageFileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    addImagePendingFile = this.files[0];
                    var fn = document.getElementById('pe-add-image-filename');
                    if (fn) fn.textContent = this.files[0].name;
                }
            });
        }

        // Confirm: add video slide
        var confirmVideo = document.getElementById('pe-add-video-confirm');
        if (confirmVideo) {
            confirmVideo.addEventListener('click', function() {
                var urlEl = document.getElementById('pe-add-video-url');
                var titleEl = document.getElementById('pe-add-video-title');
                var url = urlEl ? urlEl.value.trim() : '';
                if (!url) {
                    if (urlEl) { urlEl.focus(); urlEl.style.outline = '2px solid #ef4444'; }
                    return;
                }
                if (urlEl) urlEl.style.outline = '';
                var embedUrl = youtubeEmbedUrl(url);
                if (!embedUrl) {
                    if (urlEl) { urlEl.focus(); urlEl.style.outline = '2px solid #ef4444'; }
                    alert('Please enter a valid YouTube URL.');
                    return;
                }
                var title = titleEl ? titleEl.value.trim() : '';
                var mustWatchEl = document.getElementById('pe-add-video-mustwatch');
                var mustWatchVal = mustWatchEl ? mustWatchEl.checked : false;
                var insertAtV = currentSlide + 1;
                var shiftedV = {};
                Object.keys(pendingImageUploads).forEach(function(k) {
                    var ki = parseInt(k, 10);
                    shiftedV[ki >= insertAtV ? ki + 1 : ki] = pendingImageUploads[ki];
                });
                pendingImageUploads = shiftedV;
                manifest.slides.splice(insertAtV, 0, { type: 'pe-video-slide', title: title, videoUrl: url, isCustom: true, mustWatchVideo: mustWatchVal });
                currentSlide = insertAtV;
                if (urlEl) urlEl.value = '';
                if (titleEl) titleEl.value = '';
                hideAllForms();
                showBuilderSlides();
            });
        }

        // Confirm: add image slide
        var confirmImage = document.getElementById('pe-add-image-confirm');
        if (confirmImage) {
            confirmImage.addEventListener('click', function() {
                var titleEl = document.getElementById('pe-add-image-title');
                var title = titleEl ? titleEl.value.trim() : '';
                var insertAtI = currentSlide + 1;
                var shiftedI = {};
                Object.keys(pendingImageUploads).forEach(function(k) {
                    var ki = parseInt(k, 10);
                    shiftedI[ki >= insertAtI ? ki + 1 : ki] = pendingImageUploads[ki];
                });
                pendingImageUploads = shiftedI;
                manifest.slides.splice(insertAtI, 0, { type: 'pe-image-slide', title: title, imageUrl: null, isCustom: true });
                var capturedFile = addImagePendingFile;
                addImagePendingFile = null;
                currentSlide = insertAtI;
                if (titleEl) titleEl.value = '';
                var fn = document.getElementById('pe-add-image-filename');
                if (fn) fn.textContent = '';
                hideAllForms();
                showBuilderSlides();
                // Auto-apply pre-selected image immediately — shows blob preview without re-upload
                if (capturedFile) {
                    handleSlideImageUpload(insertAtI, capturedFile);
                }
            });
        }
    }

    function updateVideoBuilderBar() {
        var bar = document.getElementById('pe-video-builder-bar');
        if (!bar) return;
        if (!manifest || !manifest.slides) { bar.style.display = 'none'; return; }
        var slide = manifest.slides[currentSlide];
        if (!slide || slide.type !== 'pe-video-slide') { bar.style.display = 'none'; return; }
        var idx = currentSlide;
        var mwBadge = slide.mustWatchVideo
            ? '<span class="pe-vbb-mustwatch">' + icon('lock') + ' Must watch</span>'
            : '';
        var html = '<div class="pe-vbb-left">' + icon('video') + '<span class="pe-vbb-title">' + escHtml(slide.title || 'Video slide') + '</span>' + mwBadge + '</div>';
        html += '<div class="pe-vbb-right">';
        html += '<button class="pe-vbb-delete-btn" data-slide="' + idx + '" data-action="delete-custom-slide">' + icon('x') + ' Remove</button>';
        html += '</div>';
        // Inline edit panel — always visible when on a video slide in builder mode
        html += '<div class="pe-edit-video-panel" id="pe-edit-video-panel-' + idx + '">';
        html += '<p class="pe-edit-video-panel-heading">' + icon('edit') + ' Edit video slide</p>';
        html += '<div class="pe-edit-video-fields">';
        html += '<label class="pe-edit-video-field-label">YouTube URL</label>';
        html += '<input class="pe-input" id="pe-edit-video-url-' + idx + '" type="url" placeholder="YouTube URL (e.g. https://youtu.be/…)" value="' + escHtml(slide.videoUrl || '') + '">';
        html += '<label class="pe-edit-video-field-label">Slide title (optional)</label>';
        html += '<input class="pe-input" id="pe-edit-video-title-' + idx + '" type="text" placeholder="Slide title (optional)" value="' + escHtml(slide.title || '') + '">';
        html += '<label class="pe-edit-video-mustwatch-label"><input type="checkbox" class="pe-edit-video-mustwatch-cb" id="pe-edit-video-mustwatch-' + idx + '"' + (slide.mustWatchVideo ? ' checked' : '') + '> ';
        html += icon('lock') + ' Must watch whole video before advancing</label>';
        html += '</div>';
        html += '<div class="pe-edit-video-btns">';
        html += '<button class="pe-btn pe-btn-secondary pe-btn-sm" data-slide="' + idx + '" data-action="cancel-edit-video">Cancel</button>';
        html += '<button class="pe-btn pe-btn-primary pe-btn-sm" data-slide="' + idx + '" data-action="save-edit-video">' + icon('check') + ' Save Changes</button>';
        html += '</div>';
        html += '</div>';
        bar.innerHTML = html;
        bar.style.display = 'flex';
    }

    function showBuilderSlides() {
        var slidesSection = document.getElementById('pe-builder-slides');
        if (slidesSection) slidesSection.style.display = 'block';
        var playerArea = document.getElementById('pe-builder-player-area');
        if (playerArea && manifest) {
            renderPlayerHTML(playerArea, true);
            updateVideoBuilderBar();
        }
        // Populate narration editor (only when voiceover is enabled)
        var narrationEl = document.getElementById('pe-narration-editor');
        if (narrationEl && manifest && cfg.enableVoiceover) {
            narrationEl.style.display = 'block';
            narrationEl.innerHTML = renderNarrationEditorHTML();
            bindNarrationEditorEvents();
        }
        // Populate quiz editor (always shown when quiz questions exist)
        var quizEditorEl = document.getElementById('pe-quiz-editor');
        if (quizEditorEl && manifest && manifest.quizQuestions && manifest.quizQuestions.length) {
            quizEditorEl.style.display = 'block';
            quizEditorEl.innerHTML = renderQuizEditorHTML();
            bindQuizEditorEvents();
        }
    }

    function handleGenerateAllVoiceovers() {
        if (!manifest || !manifest.slides) return;
        var btn = document.getElementById('pe-vo-btn');
        var statusEl = document.getElementById('pe-vo-status');
        var slides = manifest.slides;
        if (btn) { btn.disabled = true; }
        if (statusEl) { statusEl.style.display = 'block'; statusEl.textContent = 'Generating voiceovers (1 of ' + slides.length + ')...'; }

        var idx = 0;
        var failCount = 0;
        var failedSlides = [];
        var retried = {};   // slideIndex -> true once this slide has already been retried
        // Use language selected in the concept builder form (if set), falling back to
        // the page-load cfg value (from the Moodle activity's saved settings).
        var voiceLang = conceptSelectedLanguage || cfg.voiceLanguage || 'en-AU';
        manifest.voiceStyle = selectedVoiceStyle || cfg.voiceStyle || 'Zephyr';

        function doNext() {
            if (idx >= slides.length) {
                if (btn) btn.disabled = false;
                if (failCount > 0) {
                    if (statusEl) {
                        statusEl.textContent = (slides.length - failCount) + ' of ' + slides.length
                            + ' voiceovers generated. Failed on slide'
                            + (failedSlides.length === 1 ? ' ' : 's ') + failedSlides.join(', ')
                            + '. Press Generate All Voiceovers again to retry.'
                            + (lastVoiceoverError ? ' (' + lastVoiceoverError + ')' : '');
                    }
                } else {
                    if (statusEl) statusEl.textContent = 'All ' + slides.length + ' voiceovers generated!';
                }
                return;
            }
            // FIX-NARRATION-RETRY: give a failed slide one automatic second attempt, and
            // if it still fails, name the slide instead of leaving the teacher to discover
            // a silent slide later.
            function voiceoverFailed(reason) {
                if (!retried[idx]) {
                    retried[idx] = true;
                    if (statusEl) {
                        statusEl.textContent = 'Slide ' + (idx + 1) + ' narration failed - retrying...';
                    }
                    setTimeout(doNext, 1200);
                    return;
                }
                failCount++;
                failedSlides.push(idx + 1);
                if (reason) lastVoiceoverError = reason;
                idx++;
                doNext();
            }

            var slide = slides[idx];
            var voText = buildVoiceoverText(slide);
            if (statusEl) statusEl.textContent = 'Generating voiceover ' + (idx + 1) + ' of ' + slides.length + '...';

            ajaxPost(cfg.ajaxUrl, {
                action: 'generate_voiceover',
                sesskey: cfg.sesskey,
                cmid: cfg.cmid
            }, JSON.stringify({
                slideIndex: idx,
                text: voText,
                language: voiceLang,
                voice: selectedVoiceStyle || cfg.voiceStyle || 'Zephyr'
            }), function(data) {
                if (data && data.success && data.audioUrl) {
                    slides[idx].voiceoverUrl = data.audioUrl;
                    idx++;
                    doNext();
                    return;
                }
                voiceoverFailed(data && data.error ? data.error : '');
            }, function(err) {
                voiceoverFailed(err || '');
            });
        }
        doNext();
    }

    function handleSave() {
        var saveStatusId = (selectedMode === 'concept') ? 'pe-concept-generate-status' : 'pe-generate-status';
        if (!manifest || !manifest.slides) {
            showStatus(saveStatusId, 'Nothing to save — generate slides first.', 'error');
            return;
        }
        var saveBtn = document.getElementById('pe-save-btn');
        if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = spinner() + 'Saving...'; }

        // Process pending image uploads first, then save.
        processImageUploads(function() {
            manifest.locked = true;
            ajaxPost(cfg.ajaxUrl, {
                action: 'save_manifest',
                sesskey: cfg.sesskey,
                cmid: cfg.cmid
            }, JSON.stringify({ manifest: manifest }), function(data) {
                if (data && data.success) {
                    // Reload page in player mode.
                    window.location.href = window.location.pathname + '?id=' + cfg.cmid;
                } else {
                    if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = icon('save') + 'Save &amp; Publish Slides'; }
                    showStatus(saveStatusId, 'Save failed: ' + escHtml(data && data.error ? data.error : 'Unknown'), 'error');
                }
            }, function(err) {
                if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = icon('save') + 'Save &amp; Publish Slides'; }
                showStatus(saveStatusId, 'Save failed: ' + escHtml(err), 'error');
            });
        });
    }

    function processImageUploads(callback) {
        var keys = Object.keys(pendingImageUploads);
        var idx = 0;

        function doNext() {
            if (idx >= keys.length) { callback(); return; }
            var slideIndex = parseInt(keys[idx], 10);
            var file = pendingImageUploads[slideIndex];

            var formData = new FormData();
            formData.append('action', 'upload_image');
            formData.append('sesskey', cfg.sesskey);
            formData.append('cmid', cfg.cmid);
            formData.append('slide_index', slideIndex);
            formData.append('imagefile', file);

            var xhr = new XMLHttpRequest();
            xhr.open('POST', cfg.ajaxUrl, true);
            xhr.onload = function() {
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data && data.success && data.imageUrl && manifest.slides[slideIndex]) {
                        manifest.slides[slideIndex].imageUrl = data.imageUrl;
                    }
                } catch(e) {}
                delete pendingImageUploads[slideIndex];
                idx++;
                doNext();
            };
            xhr.onerror = function() { idx++; doNext(); };
            xhr.send(formData);
        }
        doNext();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // PLAYER (shared between builder preview and standalone player)
    // ─────────────────────────────────────────────────────────────────────────────
    function renderPlayer(app) {
        if (!manifest || !manifest.slides || !manifest.slides.length) {
            app.innerHTML = '<div class="pe-builder" style="text-align:center;padding:48px 24px;">'
                + '<p style="color:#9ca3af;font-size:0.95rem;">No slides have been generated yet.</p>'
                + (cfg.canManage ? '<p style="margin-top:8px;"><a href="' + window.location.pathname + '?id=' + cfg.cmid + '&edit=1" class="btn btn-primary btn-sm">Create slides</a></p>' : '')
                + '</div>';
            return;
        }
        renderPlayerHTML(app, false);
    }

    function renderPlayerHTML(container, isBuilderPreview) {
        var slides = manifest.slides;
        currentSlide = 0;
        listenedSlides = {};
        videoWatched = {};
        isBuilderPreviewMode = isBuilderPreview;
        totalSlides = slides.length;
        // Reset attempt tracking for this render session
        attemptStartTime  = Date.now();
        slideEntryTime    = Date.now();
        lastSlideIdx      = -1;
        attemptSlideTimes = {};
        attemptAnswers    = [];
        // Initialise quiz questions for this render (player mode only)
        quizQuestions = (!isBuilderPreview && manifest && manifest.quizQuestions && Array.isArray(manifest.quizQuestions))
            ? manifest.quizQuestions : [];
        var accentColor = cfg.accentColor || '#3b82f6';
        var transitionClass = 'pe-transition-' + (cfg.slideTransition || 'slide');
        var html = '<div class="pe-player ' + transitionClass + '" id="pe-player-root" style="--pe-accent:' + escHtml(accentColor) + '">';
        html += '<div class="pe-player-inner">';

        // Slide viewport (fills full width — nav buttons overlay on top)
        html += '<div class="pe-slide-viewport" id="pe-slide-viewport">';
        for (var i = 0; i < slides.length; i++) {
            html += renderSlide(slides[i], i, isBuilderPreview);
        }
        html += '</div>';

        // Nav buttons — absolutely positioned over slide edges
        html += '<button class="pe-nav-btn pe-nav-btn--prev" id="pe-prev-btn" disabled>' + icon('chevL') + '</button>';
        html += '<button class="pe-nav-btn pe-nav-btn--next" id="pe-next-btn"' + (slides.length <= 1 ? ' disabled' : '') + '>' + icon('chevR') + '</button>';

        // Fullscreen button — top-right corner
        html += '<button class="pe-fullscreen-btn" id="pe-fullscreen-btn" title="Fullscreen">';
        html += '<svg class="pe-fs-expand" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
        html += '<svg class="pe-fs-compress pe-fs-hidden" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>';
        html += '</button>';

        html += '</div>'; // pe-player-inner

        // Video builder toolbar — rendered outside the slide viewport so it is never clipped by overflow:hidden
        if (isBuilderPreview) {
            html += '<div class="pe-video-builder-bar" id="pe-video-builder-bar" style="display:none"></div>';
        }

        // Footer: progress bar + dots (left) + instruction (center) + audio btn + counter (right)
        var hasAnyVoiceover = !isBuilderPreview && cfg.enableVoiceover && slides.some(function(s) { return s && s.voiceoverUrl; });
        html += '<div class="pe-player-footer">';
        html += '<div class="pe-progress-track"><div class="pe-progress-fill" id="pe-progress-fill" style="width:' + Math.round((1 / slides.length) * 100) + '%"></div></div>';
        html += '<div class="pe-footer-bar">';
        html += '<div class="pe-dots" id="pe-dots">';
        for (var j = 0; j < slides.length; j++) {
            html += '<button class="pe-dot' + (j === 0 ? ' pe-dot-active' : '') + '" data-index="' + j + '"></button>';
        }
        html += '</div>';
        // Centered instruction text (headphones icon + message)
        html += '<div class="pe-audio-instruction" id="pe-audio-instruction">';
        if (hasAnyVoiceover) {
            html += icon('headphones') + '<span id="pe-audio-instruction-text">Listen to narration</span>';
        }
        html += '</div>';
        // Quiz CTA — shown on last slide when quiz questions are available
        if (!isBuilderPreview && quizQuestions.length > 0) {
            html += '<button class="pe-quiz-cta-btn" id="pe-quiz-cta-btn" style="display:none">'
                + icon('zap') + 'Check Your Understanding</button>';
        }
        // Certificate button — shown on last slide when no quiz and cert enabled
        if (!isBuilderPreview && cfg.enableCertificate && quizQuestions.length === 0) {
            html += '<button class="pe-cert-footer-btn" id="pe-cert-footer-btn" style="display:none">'
                + icon('award') + 'Your Certificate</button>';
        }
        // Right side: audio btn + counter
        html += '<div class="pe-footer-right">';
        if (hasAnyVoiceover) {
            html += '<button class="pe-audio-btn" id="pe-audio-btn" title="Play narration">' + icon('play') + '</button>';
        }
        html += '<span class="pe-page-counter" id="pe-counter">1 / ' + slides.length + '</span>';
        html += '</div>';
        html += '</div>';
        html += '</div>'; // pe-player-footer

        // Quiz overlay — absolutely covers the player; hidden until showQuiz() fires
        if (!isBuilderPreview && quizQuestions.length > 0) {
            html += '<div class="pe-quiz-overlay" id="pe-quiz-overlay"></div>';
        }

        html += '</div>'; // pe-player

        container.innerHTML = html;

        showSlide(currentSlide, slides.length, false);
        bindPlayerEvents(slides, isBuilderPreview);

        // Attach YouTube IFrame API postMessage listener (once per AMD module load)
        // to detect when a must-watch video has fully played so the Next button unlocks.
        if (!ytMsgListenerBound) {
            ytMsgListenerBound = true;
            window.addEventListener('message', function(e) {
                // Accept both standard and privacy-enhanced YouTube embed origins
                if (e.origin !== 'https://www.youtube.com' && e.origin !== 'https://www.youtube-nocookie.com') return;
                try {
                    var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
                    if (!data || data.event !== 'infoDelivery') return;
                    // Use loose == so both numeric 0 and string "0" are caught
                    if (!data.info || data.info.playerState != 0) return; // 0 = ended
                    var mslides = manifest && manifest.slides;
                    if (!mslides) return;
                    for (var si = 0; si < mslides.length; si++) {
                        if (!mslides[si] || mslides[si].type !== 'pe-video-slide' || !mslides[si].mustWatchVideo) continue;
                        var vtframe = document.getElementById('pe-video-iframe-' + si);
                        if (vtframe && vtframe.contentWindow === e.source) {
                            videoWatched[si] = true;
                            if (si === currentSlide) {
                                var nxBtn = document.getElementById('pe-next-btn');
                                if (nxBtn) nxBtn.disabled = false;
                                refreshMustWatchBanner(si);
                            }
                            break;
                        }
                    }
                } catch (_eyt) {}
            });
        }
    }

    // Returns true if the user is allowed to advance past slide idx.
    // Updates the "Watch full video to continue" banner for a must-watch video slide.
    function refreshMustWatchBanner(idx) {
        if (isBuilderPreviewMode) return;
        var mslides = manifest && manifest.slides;
        if (!mslides) return;
        var slide = mslides[idx];
        if (!slide || slide.type !== 'pe-video-slide' || !slide.mustWatchVideo) return;
        var banner = document.getElementById('pe-must-watch-banner-' + idx);
        if (banner) banner.style.display = videoWatched[idx] ? 'none' : 'flex';
    }

    function canAdvanceFromSlide(idx, slides) {
        if (isBuilderPreviewMode) return true;
        var slide = slides && slides[idx];
        // Must-watch video gate (independent of voiceover setting)
        if (slide && slide.mustWatchVideo && slide.type === 'pe-video-slide' && !videoWatched[idx]) return false;
        if (!cfg.requireVoiceover) return true;
        if (!slide || !slide.voiceoverUrl) return true; // no voiceover = freely advance
        return !!listenedSlides[idx];
    }

    // Updates the global footer audio button and instruction text for the given slide.
    function updateGlobalAudioBtn(idx) {
        var slide = manifest && manifest.slides && manifest.slides[idx];
        var hasVoiceover = !isBuilderPreviewMode && cfg.enableVoiceover && slide && slide.voiceoverUrl;

        var audioBtnEl = document.getElementById('pe-audio-btn');
        var instructionEl = document.getElementById('pe-audio-instruction');
        var instructionTextEl = document.getElementById('pe-audio-instruction-text');

        if (!hasVoiceover) {
            if (audioBtnEl) audioBtnEl.style.display = 'none';
            if (instructionEl) instructionEl.style.visibility = 'hidden';
            return;
        }

        if (audioBtnEl) audioBtnEl.style.display = '';
        if (instructionEl) {
            instructionEl.style.visibility = '';
            // Determine instruction message
            if (audioFailed[idx]) {
                instructionEl.className = 'pe-audio-instruction pe-audio-instruction--locked';
                if (instructionTextEl) instructionTextEl.textContent = 'Narration unavailable';
            } else if (audioBlocked[idx] && !listenedSlides[idx]) {
                // The browser refused to start it on its own; say so rather than leaving
                // the student looking at a silent slide.
                instructionEl.className = 'pe-audio-instruction pe-audio-instruction--locked';
                if (instructionTextEl) instructionTextEl.textContent = 'Press play to start narration';
            } else if (cfg.requireVoiceover && !listenedSlides[idx]) {
                instructionEl.className = 'pe-audio-instruction pe-audio-instruction--locked';
                if (instructionTextEl) instructionTextEl.textContent = 'Listen to continue';
            } else {
                instructionEl.className = 'pe-audio-instruction';
                if (instructionTextEl) instructionTextEl.textContent = 'Listen to narration';
            }
        }

        // Sync play/pause icon
        var audio = audioElements[idx];
        if (audioBtnEl) {
            audioBtnEl.innerHTML = (audio && !audio.paused) ? icon('pause') : icon('play');
        }
    }

    // Alias — showSlide() calls updateAudioHint; maps to the global audio button updater.
    function updateAudioHint(idx) {
        updateGlobalAudioBtn(idx);
    }

    function bindPlayerEvents(slides, isBuilderPreview) {
        var prevBtn = document.getElementById('pe-prev-btn');
        var nextBtn = document.getElementById('pe-next-btn');

        if (prevBtn) prevBtn.addEventListener('click', function() {
            if (currentSlide > 0) { currentSlide--; showSlide(currentSlide, slides.length, !isBuilderPreview); }
        });

        if (nextBtn) nextBtn.addEventListener('click', function() {
            if (currentSlide === slides.length - 1 && !isBuilderPreview && quizQuestions.length > 0) {
                showQuiz(false);
                return;
            }
            if (currentSlide < slides.length - 1) {
                if (!canAdvanceFromSlide(currentSlide, slides)) return;
                currentSlide++;
                showSlide(currentSlide, slides.length, !isBuilderPreview);
            }
        });

        // Dot navigation
        var dots = document.getElementById('pe-dots');
        if (dots) {
            dots.addEventListener('click', function(e) {
                var btn = e.target.closest ? e.target.closest('[data-index]') : null;
                if (!btn) {
                    // IE fallback
                    var t = e.target;
                    while (t && t !== dots) {
                        if (t.hasAttribute && t.hasAttribute('data-index')) { btn = t; break; }
                        t = t.parentNode;
                    }
                }
                if (btn) {
                    var idx = parseInt(btn.getAttribute('data-index'), 10);
                    if (!isNaN(idx)) {
                        if (idx > currentSlide && !canAdvanceFromSlide(currentSlide, slides)) return;
                        currentSlide = idx;
                        showSlide(currentSlide, slides.length, !isBuilderPreview);
                    }
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            var tag = document.activeElement ? document.activeElement.tagName : '';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (document.activeElement && document.activeElement.isContentEditable) return;
            // FIX-QUIZ-KEYNAV: slide navigation must not run while the quiz overlay is
            // open. It used to re-enter showQuiz(), which restarts the quiz from question
            // one — wiping the student's answers mid-quiz, and (since the retry feature)
            // wiping the results of the whole preceding run as well.
            if (isQuizOpen()) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                if (currentSlide === slides.length - 1 && !isBuilderPreviewMode && quizQuestions.length > 0) {
                    showQuiz(false);
                    return;
                }
                if (currentSlide < slides.length - 1) {
                    if (!canAdvanceFromSlide(currentSlide, slides)) return;
                    currentSlide++;
                    showSlide(currentSlide, slides.length, !isBuilderPreview);
                }
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                if (currentSlide > 0) { currentSlide--; showSlide(currentSlide, slides.length, !isBuilderPreview); }
            } else if (e.key === 'Escape' || e.key === 'f' || e.key === 'F') {
                if (e.key !== 'Escape') {
                    var player = document.querySelector('.pe-player');
                    if (!player) return;
                    var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
                    if (!isFs) {
                        if (player.requestFullscreen) { player.requestFullscreen(); }
                        else if (player.webkitRequestFullscreen) { player.webkitRequestFullscreen(); }
                    }
                }
            }
        });

        // Touch swipe navigation (mobile)
        (function() {
            var viewport = document.querySelector('.pe-slide-viewport');
            if (!viewport) return;
            var startX = 0;
            var startY = 0;
            var moved = false;
            viewport.addEventListener('touchstart', function(e) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                moved = false;
            }, { passive: true });
            viewport.addEventListener('touchmove', function(e) {
                moved = true;
            }, { passive: true });
            viewport.addEventListener('touchend', function(e) {
                if (!moved) return;
                // FIX-QUIZ-KEYNAV: same guard as the keyboard handler — a swipe behind the
                // quiz overlay must not restart the quiz.
                if (isQuizOpen()) return;
                var dx = e.changedTouches[0].clientX - startX;
                var dy = e.changedTouches[0].clientY - startY;
                if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
                if (dx < 0) {
                    // swipe left → next
                    if (currentSlide === slides.length - 1 && !isBuilderPreviewMode && quizQuestions.length > 0) { showQuiz(false); return; }
                    if (currentSlide < slides.length - 1) {
                        if (!canAdvanceFromSlide(currentSlide, slides)) return;
                        currentSlide++;
                        showSlide(currentSlide, slides.length, !isBuilderPreview);
                    }
                } else {
                    // swipe right → prev
                    if (currentSlide > 0) { currentSlide--; showSlide(currentSlide, slides.length, !isBuilderPreview); }
                }
            }, { passive: true });
        }());

        // Fullscreen toggle button
        var fsBtn = document.getElementById('pe-fullscreen-btn');
        if (fsBtn) {
            fsBtn.addEventListener('click', function() {
                var player = document.querySelector('.pe-player');
                if (!player) return;
                var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
                if (!isFs) {
                    if (player.requestFullscreen) { player.requestFullscreen(); }
                    else if (player.webkitRequestFullscreen) { player.webkitRequestFullscreen(); }
                } else {
                    if (document.exitFullscreen) { document.exitFullscreen(); }
                    else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
                }
            });
            ['fullscreenchange', 'webkitfullscreenchange'].forEach(function(evt) {
                document.addEventListener(evt, function() {
                    var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
                    var expand = document.querySelector('.pe-fs-expand');
                    var compress = document.querySelector('.pe-fs-compress');
                    if (expand) { if (isFs) { expand.classList.add('pe-fs-hidden'); } else { expand.classList.remove('pe-fs-hidden'); } }
                    if (compress) { if (isFs) { compress.classList.remove('pe-fs-hidden'); } else { compress.classList.add('pe-fs-hidden'); } }
                    // Scale slide content uniformly: zoom the 960x540 baseline to fill the screen
                    var player = document.querySelector('.pe-player');
                    if (player) {
                        if (isFs) {
                            var footer = player.querySelector('.pe-footer-bar');
                            var footerH = footer ? footer.offsetHeight : 48;
                            var availW = window.innerWidth;
                            var availH = window.innerHeight - footerH;
                            var scale = Math.min(availW / 960, availH / 540);
                            scale = Math.round(scale * 1000) / 1000;
                            player.style.setProperty('--pe-fs-zoom', scale);
                        } else {
                            player.style.removeProperty('--pe-fs-zoom');
                        }
                    }
                });
            });
        }

        // Quiz CTA button
        var quizCtaBind = document.getElementById('pe-quiz-cta-btn');
        if (quizCtaBind) quizCtaBind.addEventListener('click', function() { showQuiz(false); });

        // Certificate footer button (no-quiz path)
        var certFooterBind = document.getElementById('pe-cert-footer-btn');
        if (certFooterBind) certFooterBind.addEventListener('click', showCertificate);

        // Image upload buttons + remove/add toggle in builder mode
        if (isBuilderPreview) {
            var viewport = document.getElementById('pe-slide-viewport');
            // Listen on the player root so clicks in the video builder bar (outside viewport) are also caught
            var playerRoot = document.getElementById('pe-player-root') || viewport;
            if (viewport) {
                viewport.addEventListener('change', function(e) {
                    if (e.target && e.target.type === 'file' && e.target.classList.contains('pe-img-file-input')) {
                        var slideIdx = parseInt(e.target.getAttribute('data-slide'), 10);
                        if (!isNaN(slideIdx) && e.target.files && e.target.files[0]) {
                            handleSlideImageUpload(slideIdx, e.target.files[0]);
                        }
                    }
                });
            }
            if (playerRoot) {
                playerRoot.addEventListener('click', function(e) {
                    // Resolve clicked action — walk up the DOM to find a data-action element
                    var actionEl = e.target;
                    var actionBtn = null;
                    while (actionEl && actionEl !== playerRoot) {
                        if (actionEl.getAttribute && actionEl.getAttribute('data-action')) { actionBtn = actionEl; break; }
                        actionEl = actionEl.parentElement;
                    }
                    var resolvedAction = actionBtn ? actionBtn.getAttribute('data-action') : null;

                    // Delete custom slide (pe-video-slide / pe-image-slide)
                    if (resolvedAction === 'delete-custom-slide') {
                        var delIdx = parseInt(actionBtn.getAttribute('data-slide'), 10);
                        if (!isNaN(delIdx) && manifest && manifest.slides) {
                            manifest.slides.splice(delIdx, 1);
                            var newPending = {};
                            Object.keys(pendingImageUploads).forEach(function(k) {
                                var ki = parseInt(k, 10);
                                if (ki < delIdx) newPending[ki] = pendingImageUploads[ki];
                                else if (ki > delIdx) newPending[ki - 1] = pendingImageUploads[ki];
                            });
                            pendingImageUploads = newPending;
                            showBuilderSlides();
                        }
                        return;
                    }

                    // Cancel edit video slide — re-hides the panel if user dismisses it
                    if (resolvedAction === 'cancel-edit-video') {
                        var cancelIdx = parseInt(actionBtn.getAttribute('data-slide'), 10);
                        var cancelPanel = document.getElementById('pe-edit-video-panel-' + cancelIdx);
                        if (cancelPanel) cancelPanel.style.display = 'none';
                        return;
                    }

                    // Save edited video slide
                    if (resolvedAction === 'save-edit-video') {
                        var saveIdx = parseInt(actionBtn.getAttribute('data-slide'), 10);
                        var urlInEl   = document.getElementById('pe-edit-video-url-'      + saveIdx);
                        var titleInEl = document.getElementById('pe-edit-video-title-'    + saveIdx);
                        var mwInEl    = document.getElementById('pe-edit-video-mustwatch-' + saveIdx);
                        var newUrl    = urlInEl   ? urlInEl.value.trim()   : '';
                        var newTitle  = titleInEl ? titleInEl.value.trim() : '';
                        var newMw     = mwInEl    ? mwInEl.checked         : false;
                        var newEmbed  = youtubeEmbedUrl(newUrl);
                        if (!newEmbed) {
                            if (urlInEl) { urlInEl.focus(); urlInEl.style.outline = '2px solid #ef4444'; }
                            return;
                        }
                        if (urlInEl) urlInEl.style.outline = '';
                        if (!isNaN(saveIdx) && manifest && manifest.slides && manifest.slides[saveIdx]) {
                            manifest.slides[saveIdx].videoUrl      = newUrl;
                            manifest.slides[saveIdx].title         = newTitle || manifest.slides[saveIdx].title;
                            manifest.slides[saveIdx].mustWatchVideo = newMw;
                            showBuilderSlides();
                        }
                        return;
                    }

                    var btn = e.target && e.target.classList && e.target.classList.contains('pe-slide-img-toggle-btn') ? e.target
                            : (e.target && e.target.parentElement && e.target.parentElement.classList && e.target.parentElement.classList.contains('pe-slide-img-toggle-btn') ? e.target.parentElement : null);
                    if (!btn) return;
                    e.preventDefault();
                    var slideIdx = parseInt(btn.getAttribute('data-slide'), 10);
                    var action = btn.getAttribute('data-action');
                    if (isNaN(slideIdx) || !manifest || !manifest.slides || !manifest.slides[slideIdx]) return;

                    // Regenerate image for this slide (costs 2 credits)
                    if (action === 'regen-image') {
                        var regenPrompt = manifest.slides[slideIdx].imagePrompt;
                        if (!regenPrompt) return;
                        var imgCont = document.getElementById('pe-slide-img-' + slideIdx);
                        if (!imgCont) return;
                        btn.disabled = true;
                        btn.innerHTML = spinner() + ' Generating…';
                        imgCont.innerHTML = '<div class="pe-slide-no-image pe-slide-regen-loading">' + spinner() + '<span>Generating new image…</span></div>';
                        ajaxPost(cfg.ajaxUrl, {
                            action: 'generate_concept_image',
                            sesskey: cfg.sesskey,
                            cmid: cfg.cmid
                        }, JSON.stringify({ slideIndex: slideIdx, imagePrompt: regenPrompt }), function(data) {
                            if (data && data.success && data.imageUrl) {
                                manifest.slides[slideIdx].imageUrl = data.imageUrl;
                                imgCont.innerHTML = buildImageColInner(slideIdx, data.imageUrl);
                                imgCont.className = 'pe-slide-image-col';
                            } else {
                                imgCont.innerHTML = '<div class="pe-slide-no-image">' + icon('image') + '<span style="color:#ef4444;font-size:0.75rem;">' + escHtml((data && data.error) ? data.error : 'Generation failed') + '</span></div>'
                                    + buildRegenOverlay(slideIdx);
                            }
                        }, function(err) {
                            imgCont.innerHTML = '<div class="pe-slide-no-image">' + icon('image') + '<span style="color:#ef4444;font-size:0.75rem;">Failed: ' + escHtml(err) + '</span></div>'
                                + buildRegenOverlay(slideIdx);
                        });
                        return; // skip immediate re-render below
                    }

                    if (action === 'remove-custom-image') {
                        // v1.0.71: Clear uploaded image from custom image slide (keeps the slide itself)
                        manifest.slides[slideIdx].imageUrl = null;
                        showBuilderSlides();
                        return;
                    } else if (action === 'remove-image') {
                        manifest.slides[slideIdx].noImage = true;
                        manifest.slides[slideIdx].imageUrl = null;
                    } else if (action === 'add-image') {
                        manifest.slides[slideIdx].noImage = false;
                    }
                    var oldEl = document.getElementById('pe-slide-' + slideIdx);
                    if (oldEl) {
                        var tmp = document.createElement('div');
                        tmp.innerHTML = renderSlide(manifest.slides[slideIdx], slideIdx, true);
                        oldEl.parentNode.replaceChild(tmp.firstChild, oldEl);
                    }
                });
            }
        }

        // Global footer audio button (player mode)
        if (!isBuilderPreview && cfg.enableVoiceover) {
            var audioBtn = document.getElementById('pe-audio-btn');
            if (audioBtn) {
                audioBtn.addEventListener('click', function() {
                    var slide = slides[currentSlide];
                    if (slide && slide.voiceoverUrl) {
                        toggleAudio(currentSlide, slide);
                    }
                });
            }
        }
    }

    function showSlide(idx, total, autoPlayAudio) {
        // Record dwell time on the previous slide before switching
        if (!isBuilderPreviewMode && slideEntryTime > 0 && lastSlideIdx >= 0) {
            var secsSoFar = Math.round((Date.now() - slideEntryTime) / 1000);
            var prevSlide = manifest && manifest.slides && manifest.slides[lastSlideIdx];
            attemptSlideTimes[lastSlideIdx] = {
                idx:   lastSlideIdx,
                type:  prevSlide ? (prevSlide.type || prevSlide.slideType || '') : '',
                title: prevSlide ? (prevSlide.title || prevSlide.productName || prevSlide.conceptName || ('Slide ' + (lastSlideIdx + 1))) : ('Slide ' + (lastSlideIdx + 1)),
                secs:  secsSoFar
            };
        }
        lastSlideIdx   = idx;
        slideEntryTime = Date.now();
        var slides = document.querySelectorAll('.pe-slide');
        for (var i = 0; i < slides.length; i++) {
            slides[i].classList.remove('pe-active');
        }
        var target = document.getElementById('pe-slide-' + idx);
        if (target) target.classList.add('pe-active');

        var prevBtn = document.getElementById('pe-prev-btn');
        var nextBtn = document.getElementById('pe-next-btn');
        if (prevBtn) prevBtn.disabled = (idx === 0);
        var isLastSlide = (idx === total - 1);
        var hasQuiz = !isBuilderPreviewMode && quizQuestions.length > 0;
        var nextDisabled = (isLastSlide && !hasQuiz);
        if (!isLastSlide && !isBuilderPreviewMode) {
            var slideData = manifest && manifest.slides && manifest.slides[idx];
            // Must-watch video gate
            if (slideData && slideData.mustWatchVideo && !videoWatched[idx]) {
                nextDisabled = true;
            }
            // Voiceover gate
            if (!nextDisabled && cfg.requireVoiceover && slideData && slideData.voiceoverUrl && !listenedSlides[idx]) {
                nextDisabled = true;
            }
        }
        if (nextBtn) {
            nextBtn.style.display = (isLastSlide && !hasQuiz) ? 'none' : '';
            nextBtn.disabled = nextDisabled;
        }
        refreshMustWatchBanner(idx);
        updateAudioHint(idx);

        // Subscribe to YouTube postMessage events so the player delivers infoDelivery state changes.
        // YouTube will not proactively send playerState events unless the page sends a "listening"
        // subscription message first.  Do this every time we land on a must-watch slide that
        // hasn't been completed yet, both immediately and on the iframe's load event.
        if (!isBuilderPreviewMode) {
            (function() {
                var mswSlide = manifest && manifest.slides && manifest.slides[idx];
                if (!mswSlide || !mswSlide.mustWatchVideo || mswSlide.type !== 'pe-video-slide' || videoWatched[idx]) return;
                var ytf = document.getElementById('pe-video-iframe-' + idx);
                if (!ytf) return;
                function ytSubscribe() {
                    try { ytf.contentWindow.postMessage('{"event":"listening","id":"1"}', 'https://www.youtube.com'); } catch (_) {}
                    try { ytf.contentWindow.postMessage('{"event":"listening","id":"1"}', 'https://www.youtube-nocookie.com'); } catch (_) {}
                }
                ytSubscribe();
                ytf.addEventListener('load', ytSubscribe);
            })();
        }

        var counter = document.getElementById('pe-counter');
        if (counter) counter.textContent = (idx + 1) + ' / ' + total;

        var fill = document.getElementById('pe-progress-fill');
        if (fill) fill.style.width = Math.round(((idx + 1) / total) * 100) + '%';

        var dots = document.querySelectorAll('.pe-dot');
        for (var j = 0; j < dots.length; j++) {
            dots[j].classList.toggle('pe-dot-active', j === idx);
        }

        // Stop any playing audio when navigating slides
        if (isPlayingAudio) {
            Object.keys(audioElements).forEach(function(k) {
                if (audioElements[k]) {
                    audioElements[k].pause();
                    audioElements[k].currentTime = 0;
                }
            });
            isPlayingAudio = false;
        }

        // Update global audio button state for this slide
        updateGlobalAudioBtn(idx);

        // Auto-play voiceover for this slide (browser autoplay policy may silently block on page load)
        if (!isBuilderPreviewMode && cfg.enableVoiceover) {
            var autoSlide = manifest && manifest.slides && manifest.slides[idx];
            if (autoSlide && autoSlide.voiceoverUrl) {
                setTimeout(function() {
                    if (currentSlide === idx) {
                        toggleAudio(idx, autoSlide);
                    }
                }, 100);
            }
        }

        // Show quiz CTA on last slide when quiz questions are available
        var quizCtaEl = document.getElementById('pe-quiz-cta-btn');
        var audioInstEl = document.getElementById('pe-audio-instruction');
        if (quizCtaEl) {
            var onLastSlide = (idx === total - 1) && !isBuilderPreviewMode && quizQuestions.length > 0;
            quizCtaEl.style.display = onLastSlide ? '' : 'none';
            if (audioInstEl) audioInstEl.style.visibility = onLastSlide ? 'hidden' : '';
        }
        // Show certificate button on last slide (no-quiz path)
        var certFooterBtnEl = document.getElementById('pe-cert-footer-btn');
        if (certFooterBtnEl) {
            var onLastForCert = (idx === total - 1) && !isBuilderPreviewMode;
            certFooterBtnEl.style.display = onLastForCert ? '' : 'none';
            if (onLastForCert && audioInstEl) audioInstEl.style.visibility = 'hidden';
        }

        // Update video builder toolbar when navigating in builder mode
        if (isBuilderPreviewMode) {
            updateVideoBuilderBar();
        }
    }

    function handleSlideImageUpload(slideIndex, file) {
        var allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.indexOf(file.type) === -1) {
            alert('Please upload a JPG, PNG, GIF or WebP image.');
            return;
        }
        pendingImageUploads[slideIndex] = file;

        // Show preview immediately using blob URL.
        var imgContainer = document.getElementById('pe-slide-img-' + slideIndex);
        if (imgContainer) {
            var blobUrl = URL.createObjectURL(file);
            imgContainer.innerHTML = '<img src="' + blobUrl + '" alt="Slide image" style="width:100%;height:100%;object-fit:cover;">'
                + '<div class="pe-slide-img-overlay"><button class="pe-slide-img-upload-btn">Change image<input type="file" class="pe-img-file-input" data-slide="' + slideIndex + '" accept="image/*"></button></div>';
        } else {
            // Fallback for pe-image-slide type (no pe-slide-img-* container).
            var slideEl = document.getElementById('pe-slide-' + slideIndex);
            if (slideEl) {
                var imgWrap = slideEl.querySelector('.pe-image-slide-img-wrap');
                if (imgWrap) {
                    var blobUrl2 = URL.createObjectURL(file);
                    imgWrap.className = 'pe-image-slide-img-wrap';
                    imgWrap.innerHTML = '<img src="' + blobUrl2 + '" alt="Slide image">';
                }
            }
        }

        // Update manifest in memory.
        if (manifest && manifest.slides && manifest.slides[slideIndex]) {
            manifest.slides[slideIndex]._pendingImageFile = true;
        }
    }

    /**
     * Unlock the "listen before advancing" gate for a slide.
     *
     * @param {number} slideIndex Slide the gate belongs to.
     */
    function unlockVoiceoverGate(slideIndex) {
        if (listenedSlides[slideIndex]) return;
        listenedSlides[slideIndex] = true;
        if (!isBuilderPreviewMode && cfg.requireVoiceover && slideIndex === currentSlide) {
            var nextBtnEl = document.getElementById('pe-next-btn');
            if (nextBtnEl && currentSlide < totalSlides - 1) nextBtnEl.disabled = false;
        }
    }

    /**
     * Fetch (creating on first use) the Audio element for a slide.
     *
     * Playback state is driven by the element's own play/pause events rather than being
     * assumed after calling play(), because play() is asynchronous and the browser can
     * refuse it.
     *
     * @param  {number} slideIndex Slide index.
     * @param  {object} slide      The slide from the manifest.
     * @return {object} The Audio element.
     */
    function getSlideAudio(slideIndex, slide) {
        if (audioElements[slideIndex]) return audioElements[slideIndex];

        var audio = new Audio(slide.voiceoverUrl);
        audioElements[slideIndex] = audio;

        audio.addEventListener('play', function() {
            isPlayingAudio = true;
            audioBlocked[slideIndex] = false;
            updateGlobalAudioBtn(slideIndex);
        });
        audio.addEventListener('pause', function() {
            isPlayingAudio = false;
            updateGlobalAudioBtn(slideIndex);
        });
        audio.addEventListener('error', function() {
            // The narration file is missing or unplayable. Record it so the footer can
            // say so, and release the gate — a broken file must never strand a student
            // on a slide they cannot advance past.
            audioFailed[slideIndex] = true;
            isPlayingAudio = false;
            unlockVoiceoverGate(slideIndex);
            updateGlobalAudioBtn(slideIndex);
        });
        audio.addEventListener('ended', function() {
            isPlayingAudio = false;
            unlockVoiceoverGate(slideIndex);
            updateGlobalAudioBtn(slideIndex);
        });

        return audio;
    }

    function toggleAudio(slideIndex, slide) {
        if (!slide || !slide.voiceoverUrl) return;

        // Stop any currently playing audio from OTHER slides.
        Object.keys(audioElements).forEach(function(k) {
            var i = parseInt(k, 10);
            if (i !== slideIndex && audioElements[k]) {
                audioElements[k].pause();
                audioElements[k].currentTime = 0;
            }
        });

        var audio = getSlideAudio(slideIndex, slide);

        if (audio.paused) {
            // FIX-SLIDE1-AUTOPLAY: play() returns a promise, and browsers reject it when
            // no user gesture has happened yet — which is always the case for the first
            // slide on page load. The previous code swallowed that rejection with an
            // empty catch and set isPlayingAudio = true regardless, so slide 1 sat
            // silent while the footer button showed a pause icon, and (because the gate
            // only opens on 'ended') "require voiceover" left Next disabled for good.
            var playing = audio.play();
            if (playing && typeof playing.catch === 'function') {
                playing.catch(function(err) {
                    isPlayingAudio = false;
                    // AbortError just means a newer play/pause superseded this one.
                    if (!err || err.name !== 'AbortError') {
                        audioBlocked[slideIndex] = true;
                        armGestureUnlock();
                    }
                    updateGlobalAudioBtn(slideIndex);
                });
            }
        } else {
            audio.pause();
        }
        updateGlobalAudioBtn(slideIndex);
    }

    /**
     * After autoplay has been refused, start the current slide's narration on the first
     * interaction anywhere in the player. That gesture satisfies the browser's autoplay
     * policy, so the student gets their narration without having to hunt for the play
     * button. Pressing the play button itself is left to toggleAudio.
     */
    function armGestureUnlock() {
        if (gestureUnlockBound) return;
        gestureUnlockBound = true;

        var handler = function(e) {
            document.removeEventListener('pointerdown', handler, true);
            document.removeEventListener('keydown', handler, true);
            gestureUnlockBound = false;

            var t = e && e.target;
            if (t && typeof t.closest === 'function' && t.closest('#pe-audio-btn')) {
                return; // The student pressed play; toggleAudio handles that click.
            }
            if (!audioBlocked[currentSlide]) return;
            var slide = manifest && manifest.slides && manifest.slides[currentSlide];
            if (!slide || !slide.voiceoverUrl) return;
            var audio = audioElements[currentSlide];
            if (!audio || !audio.paused || audio.currentTime > 0) return;

            var retry = audio.play();
            if (retry && typeof retry.catch === 'function') {
                retry.catch(function() {});
            }
        };

        document.addEventListener('pointerdown', handler, true);
        document.addEventListener('keydown', handler, true);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // SLIDE RENDERING
    // ─────────────────────────────────────────────────────────────────────────────
    function renderSlide(slide, idx, isBuilderPreview) {
        var typeMap = {
            'product-overview':      renderProductOverview,
            'what-how':              renderWhatHow,
            'key-benefits':          renderKeyBenefits,
            'who-for':               renderWhoFor,
            'how-recommend':         renderHowRecommend,
            'using-product':         renderUsingProduct,
            'faq':                   renderFaq,
            'handling-objections':   renderHandlingObjections,
            'care-maintenance':      renderCareMaintenance,
            'competitive-advantage': renderCompetitiveAdvantage,
            'seasonal-use':          renderSeasonalUse,
            'upsell-bundle':         renderUpsellBundle,
            'customer-story':        renderCustomerStory,
            'troubleshooting':       renderTroubleshooting,
            'staff-tips':            renderStaffTips,
            // Concept Explainer types
            'cx-introduction':       renderCxIntroduction,
            'cx-scenario':           renderCxScenario,
            'cx-key-concept':        renderCxKeyConcept,
            'cx-real-example':       renderCxRealExample,
            'cx-common-mistake':     renderCxCommonMistake,
            'cx-best-practice':      renderCxBestPractice,
            'cx-summary':            renderCxSummary,
            // Custom slides (added via Add Slide panel)
            'pe-video-slide':        renderVideoSlide,
            'pe-image-slide':        renderImageSlide,
        };
        var fn = typeMap[slide.type] || renderGenericSlide;
        return fn(slide, idx, isBuilderPreview);
    }

    function slideShell(slide, idx, cssClass, imageCol, contentCol) {
        var active = (idx === currentSlide) ? ' pe-active' : '';
        var isBuilder = (imageCol === 'builder');
        var noImageMode = !!slide.noImage;  // honour in both builder AND player modes
        var html = '<div class="pe-slide' + active + '" id="pe-slide-' + idx + '">';
        html += '<div class="pe-slide-inner ' + cssClass + (noImageMode ? ' pe-slide-inner--no-image' : '') + '">';

        // Image column
        if (noImageMode) {
            html += '<div class="pe-slide-image-col pe-slide-image-col--hidden" id="pe-slide-img-' + idx + '">';
            if (isBuilder) {
                // Only show "Add image" button in builder mode
                html += '<button class="pe-slide-img-toggle-btn" data-slide="' + idx + '" data-action="add-image">' + icon('image') + '<span>Add<br>image</span></button>';
            }
            html += '</div>';
        } else {
            html += '<div class="pe-slide-image-col" id="pe-slide-img-' + idx + '">';
            if (slide.imageUrl) {
                html += '<img src="' + escHtml(slide.imageUrl) + '" alt="' + escHtml(slide.title) + '">';
            } else {
                html += '<div class="pe-slide-no-image" style="background:rgba(0,0,0,0.3);">' + icon('image') + '<span>' + (isBuilder ? 'No image yet' : 'No image') + '</span></div>';
            }
            if (isBuilder) {
                html += buildRegenOverlay(idx);
            }
            html += '</div>';
        }

        // Content column
        html += '<div class="pe-slide-content-col">';
        html += '<p class="pe-slide-title">' + cxLabel('slide') + ' ' + (idx + 1) + ' &bull; ' + escHtml(slide.title) + '</p>';
        html += contentCol;
        html += '</div>';

        html += '</div>'; // slide-inner

        html += '</div>'; // pe-slide
        return html;
    }

    function renderProductOverview(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-prod-badge pe-prod-badge--overview">' + icon('box') + 'Product Overview</span>';
        if (c.badge) col += '<span class="pe-slide-badge">' + escHtml(c.badge) + '</span>';
        col += '<p class="pe-cx-concept-name">' + escHtml(c.productName || slide.productName || '') + '</p>';
        if (c.valueProp) col += '<p class="pe-cx-body-text">' + escHtml(c.valueProp) + '</p>';
        if (c.quickFacts && c.quickFacts.length) {
            col += '<div class="pe-quick-facts">';
            var iconMap = ['box', 'target', 'star', 'user'];
            for (var i = 0; i < c.quickFacts.length; i++) {
                var qf = c.quickFacts[i];
                col += '<div class="pe-quick-fact">';
                col += '<div class="pe-quick-fact-icon">' + icon(qf.icon || iconMap[i] || 'star') + '</div>';
                col += '<div class="pe-quick-fact-content"><p class="pe-quick-fact-label">' + escHtml(qf.label || '') + '</p><p class="pe-quick-fact-value">' + escHtml(qf.value || '') + '</p></div>';
                col += '</div>';
            }
            col += '</div>';
        }
        return slideShell(slide, idx, 'pe-slide-overview', isBuilderPreview ? 'builder' : '', col);
    }

    function renderWhatHow(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-prod-badge pe-prod-badge--whathow">' + icon('lightbulb') + 'What &amp; How</span>';
        if (c.whatIsIt) {
            col += '<div class="pe-cx-callout pe-cx-callout--definition">' + icon('lightbulb');
            col += '<div><p class="pe-cx-component-name">What Is It?</p><p class="pe-cx-component-desc">' + escHtml(c.whatIsIt) + '</p></div></div>';
        }
        if (c.howItWorks) {
            col += '<div class="pe-cx-callout pe-cx-callout--stat">' + icon('settings');
            col += '<div><p class="pe-cx-component-name">How Does It Work?</p><p class="pe-cx-component-desc">' + escHtml(c.howItWorks) + '</p></div></div>';
        }
        if (c.customerExplanation) {
            col += '<div class="pe-cx-callout pe-cx-callout--role">' + icon('user');
            col += '<p><strong>Explain to a customer:</strong> ' + escHtml(c.customerExplanation) + '</p></div>';
        }
        return slideShell(slide, idx, 'pe-slide-whathow', isBuilderPreview ? 'builder' : '', col);
    }

    function renderKeyBenefits(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-prod-badge pe-prod-badge--benefits">' + icon('star') + 'Key Benefits</span>';
        if (c.benefits && c.benefits.length) {
            col += '<ul class="pe-cx-list pe-cx-list--check">';
            for (var i = 0; i < c.benefits.length; i++) {
                var b = c.benefits[i];
                col += '<li>' + icon('circle-check') + '<span><strong>' + escHtml(b.title || '') + '</strong>';
                if (b.description) col += ' \u2014 ' + escHtml(b.description);
                col += '</span></li>';
            }
            col += '</ul>';
        }
        if (c.talkingPoint) {
            col += '<div class="pe-cx-callout pe-cx-callout--stat">' + icon('zap') + '<p><strong>Key talking point:</strong> ' + escHtml(c.talkingPoint) + '</p></div>';
        }
        return slideShell(slide, idx, 'pe-slide-benefits', isBuilderPreview ? 'builder' : '', col);
    }

    function renderWhoFor(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-prod-badge pe-prod-badge--whofor">' + icon('users') + 'Who It\u2019s For</span>';
        if (c.personas && c.personas.length) {
            col += '<div class="pe-cx-components">';
            var personaIcons = ['user', 'users', 'briefcase', 'target'];
            for (var i = 0; i < c.personas.length; i++) {
                var p = c.personas[i];
                col += '<div class="pe-cx-component">';
                col += '<div class="pe-cx-component-icon">' + icon(p.icon || personaIcons[i % personaIcons.length]) + '</div>';
                col += '<div><p class="pe-cx-component-name">' + escHtml(p.type || '') + '</p><p class="pe-cx-component-desc">' + escHtml(p.description || '') + '</p></div>';
                col += '</div>';
            }
            col += '</div>';
        }
        if (c.bestFit) {
            col += '<div class="pe-cx-callout pe-cx-callout--definition">' + icon('check') + '<p><strong>Best fit:</strong> ' + escHtml(c.bestFit) + '</p></div>';
        }
        return slideShell(slide, idx, 'pe-slide-whofor', isBuilderPreview ? 'builder' : '', col);
    }

    function renderHowRecommend(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-prod-badge pe-prod-badge--recommend">' + icon('target') + 'How to Recommend</span>';

        // Discover needs
        var dn = c.discoverNeeds || {};
        col += '<div class="pe-cx-callout pe-cx-callout--challenge">' + icon('alert');
        col += '<div><p class="pe-cx-component-name">' + escHtml(dn.title || 'Discover Needs') + '</p>';
        var dnPoints = dn.points || [];
        if (dnPoints.length) {
            col += '<ul class="pe-recommend-points">';
            for (var i = 0; i < dnPoints.length; i++) col += '<li>' + escHtml(dnPoints[i]) + '</li>';
            col += '</ul>';
        }
        col += '</div></div>';

        // Match benefits
        var mb = c.matchBenefits || {};
        col += '<div class="pe-cx-callout pe-cx-callout--fix">' + icon('check');
        col += '<div><p class="pe-cx-component-name">' + escHtml(mb.title || 'Match Benefits') + '</p>';
        var mbPoints = mb.points || [];
        if (mbPoints.length) {
            col += '<ul class="pe-recommend-points">';
            for (var j = 0; j < mbPoints.length; j++) col += '<li>' + escHtml(mbPoints[j]) + '</li>';
            col += '</ul>';
        }
        col += '</div></div>';

        // Conversation example
        if (c.conversationExample) {
            var ce = c.conversationExample;
            col += '<div class="pe-cx-callout pe-cx-callout--role">' + icon('user');
            col += '<div><p class="pe-cx-component-name">Example Conversation</p>';
            if (ce.customer) col += '<p class="pe-cx-component-desc"><strong>Customer:</strong> ' + escHtml(ce.customer) + '</p>';
            if (ce.staff) col += '<p class="pe-cx-component-desc"><strong>You:</strong> ' + escHtml(ce.staff) + '</p>';
            col += '</div></div>';
        }

        return slideShell(slide, idx, 'pe-slide-recommend', isBuilderPreview ? 'builder' : '', col);
    }

    function renderUsingProduct(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-prod-badge pe-prod-badge--using">' + icon('settings') + 'Using It</span>';

        if (c.gettingStarted && c.gettingStarted.length) {
            col += '<div class="pe-cx-steps">';
            for (var i = 0; i < c.gettingStarted.length; i++) {
                var s = c.gettingStarted[i];
                col += '<div class="pe-cx-step">';
                col += '<div class="pe-cx-step-num">' + (i + 1) + '</div>';
                col += '<div><p class="pe-cx-component-name">' + escHtml(s.step || '') + '</p><p class="pe-cx-component-desc">' + escHtml(s.description || '') + '</p></div>';
                col += '</div>';
            }
            col += '</div>';
        }

        if (c.relatedProducts && c.relatedProducts.length) {
            col += '<p style="font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;margin:10px 0 6px;">Pair With</p>';
            col += '<div class="pe-related-row">';
            for (var j = 0; j < c.relatedProducts.length; j++) {
                col += '<span class="pe-related-chip">' + escHtml(c.relatedProducts[j].name || '') + '</span>';
            }
            col += '</div>';
        }

        if (c.staffTip) {
            col += '<div class="pe-cx-callout pe-cx-callout--protip">' + icon('zap') + '<p><strong>Staff tip:</strong> ' + escHtml(c.staffTip) + '</p></div>';
        }

        return slideShell(slide, idx, 'pe-slide-using', isBuilderPreview ? 'builder' : '', col);
    }

    function renderFaq(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-prod-badge pe-prod-badge--faq">' + icon('clipboard') + 'FAQ</span>';
        if (c.faqs && c.faqs.length) {
            for (var i = 0; i < c.faqs.length; i++) {
                var f = c.faqs[i];
                col += '<p class="pe-cx-component-name" style="margin:10px 0 2px;">' + icon('bookmark') + ' ' + escHtml(f.question || '') + '</p>';
                if (f.answer) col += '<p class="pe-cx-narrative">' + escHtml(f.answer) + '</p>';
            }
        }
        return slideShell(slide, idx, 'pe-slide-faq', isBuilderPreview ? 'builder' : '', col);
    }

    function renderHandlingObjections(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-prod-badge pe-prod-badge--objections">' + icon('alert') + 'Objections</span>';
        if (c.objections && c.objections.length) {
            col += '<ul class="pe-cx-list pe-cx-list--cross">';
            for (var i = 0; i < c.objections.length; i++) {
                var o = c.objections[i];
                col += '<li>' + icon('x') + '<span><strong>' + escHtml(o.objection || '') + '</strong>';
                if (o.response) col += '<br><span style="font-style:italic;opacity:0.85;">' + escHtml(o.response) + '</span>';
                col += '</span></li>';
            }
            col += '</ul>';
        }
        if (c.closingLine) {
            col += '<div class="pe-cx-callout pe-cx-callout--fix">' + icon('check') + '<p><strong>Closing line:</strong> ' + escHtml(c.closingLine) + '</p></div>';
        }
        return slideShell(slide, idx, 'pe-slide-objections', isBuilderPreview ? 'builder' : '', col);
    }

    function renderCareMaintenance(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-prod-badge pe-prod-badge--care">' + icon('tool') + 'Care &amp; Maintenance</span>';
        if (c.careSteps && c.careSteps.length) {
            col += '<div class="pe-cx-steps">';
            for (var i = 0; i < c.careSteps.length; i++) {
                var s = c.careSteps[i];
                col += '<div class="pe-cx-step">';
                col += '<div class="pe-cx-step-num">' + (i + 1) + '</div>';
                col += '<div><p class="pe-cx-component-name">' + escHtml(s.action || '') + '</p><p class="pe-cx-component-desc">' + escHtml(s.detail || '') + '</p></div>';
                col += '</div>';
            }
            col += '</div>';
        }
        if (c.lifespan) {
            col += '<div class="pe-cx-callout pe-cx-callout--definition">' + icon('tool') + '<p><strong>Product life:</strong> ' + escHtml(c.lifespan) + '</p></div>';
        }
        if (c.staffReminder) {
            col += '<div class="pe-cx-callout pe-cx-callout--protip">' + icon('zap') + '<p><strong>Staff reminder:</strong> ' + escHtml(c.staffReminder) + '</p></div>';
        }
        return slideShell(slide, idx, 'pe-slide-care', isBuilderPreview ? 'builder' : '', col);
    }

    function renderCompetitiveAdvantage(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-prod-badge pe-prod-badge--competitive">' + icon('target') + 'vs Competition</span>';
        if (c.vsAlternatives && c.vsAlternatives.length) {
            col += '<ul class="pe-cx-list pe-cx-list--check">';
            for (var i = 0; i < c.vsAlternatives.length; i++) {
                var v = c.vsAlternatives[i];
                col += '<li>' + icon('circle-check') + '<span>';
                if (v.competitor) col += '<strong>' + escHtml(v.competitor) + ':</strong> ';
                col += escHtml(v.ourAdvantage || '') + '</span></li>';
            }
            col += '</ul>';
        }
        if (c.uniqueSellingPoint) {
            col += '<div class="pe-cx-callout pe-cx-callout--stat">' + icon('star') + '<p><strong>Unique selling point:</strong> ' + escHtml(c.uniqueSellingPoint) + '</p></div>';
        }
        if (c.staffPitch) {
            col += '<div class="pe-cx-callout pe-cx-callout--role">' + icon('user') + '<p><strong>Staff pitch:</strong> ' + escHtml(c.staffPitch) + '</p></div>';
        }
        return slideShell(slide, idx, 'pe-slide-competitive', isBuilderPreview ? 'builder' : '', col);
    }

    function renderSeasonalUse(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-prod-badge pe-prod-badge--seasonal">' + icon('sparkles') + 'Seasonal Use</span>';
        if (c.scenarios && c.scenarios.length) {
            col += '<div class="pe-cx-components">';
            var scenIcons = ['star', 'target', 'box'];
            for (var i = 0; i < c.scenarios.length; i++) {
                var sc = c.scenarios[i];
                col += '<div class="pe-cx-component">';
                col += '<div class="pe-cx-component-icon">' + icon(scenIcons[i % scenIcons.length]) + '</div>';
                col += '<div><p class="pe-cx-component-name">' + escHtml(sc.situation || '') + '</p><p class="pe-cx-component-desc">' + escHtml(sc.pitch || '') + '</p></div>';
                col += '</div>';
            }
            col += '</div>';
        }
        if (c.peakPeriod) {
            col += '<div class="pe-cx-callout pe-cx-callout--stat">' + icon('zap') + '<p><strong>Peak selling period:</strong> ' + escHtml(c.peakPeriod) + '</p></div>';
        }
        if (c.displayTip) {
            col += '<div class="pe-cx-callout pe-cx-callout--protip">' + icon('sparkles') + '<p><strong>Display tip:</strong> ' + escHtml(c.displayTip) + '</p></div>';
        }
        return slideShell(slide, idx, 'pe-slide-seasonal', isBuilderPreview ? 'builder' : '', col);
    }

    function renderUpsellBundle(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-prod-badge pe-prod-badge--upsell">' + icon('sparkles') + 'Upsell</span>';
        if (c.upsells && c.upsells.length) {
            col += '<div class="pe-cx-components">';
            for (var i = 0; i < c.upsells.length; i++) {
                var u = c.upsells[i];
                col += '<div class="pe-cx-component">';
                col += '<div class="pe-cx-component-icon">' + icon('star') + '</div>';
                col += '<div><p class="pe-cx-component-name">' + escHtml(u.product || '') + '</p><p class="pe-cx-component-desc">' + escHtml(u.reason || '') + '</p></div>';
                col += '</div>';
            }
            col += '</div>';
        }
        if (c.bundleIdea) {
            col += '<div class="pe-cx-callout pe-cx-callout--definition">' + icon('box') + '<p><strong>Bundle idea:</strong> ' + escHtml(c.bundleIdea) + '</p></div>';
        }
        if (c.upsellScript) {
            col += '<div class="pe-cx-callout pe-cx-callout--role">' + icon('user') + '<p><strong>Upsell script:</strong> ' + escHtml(c.upsellScript) + '</p></div>';
        }
        return slideShell(slide, idx, 'pe-slide-upsell', isBuilderPreview ? 'builder' : '', col);
    }

    function renderCustomerStory(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-prod-badge pe-prod-badge--story">' + icon('user') + 'Customer Story</span>';
        if (c.scenario) col += '<p class="pe-cx-scenario-title">' + escHtml(c.scenario) + '</p>';
        if (c.challenge) col += '<p class="pe-cx-narrative">' + escHtml(c.challenge) + '</p>';
        if (c.solution) {
            col += '<div class="pe-cx-callout pe-cx-callout--fix">' + icon('check') + '<p><strong>Solution:</strong> ' + escHtml(c.solution) + '</p></div>';
        }
        if (c.outcome) {
            col += '<div class="pe-cx-callout pe-cx-callout--result">' + icon('trophy') + '<p>' + escHtml(c.outcome) + '</p></div>';
        }
        if (c.staffUse) {
            col += '<p class="pe-cx-reflection">' + icon('zap') + ' ' + escHtml(c.staffUse) + '</p>';
        }
        return slideShell(slide, idx, 'pe-slide-story', isBuilderPreview ? 'builder' : '', col);
    }

    function renderTroubleshooting(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-prod-badge pe-prod-badge--troubleshoot">' + icon('tool') + 'Troubleshooting</span>';
        if (c.issues && c.issues.length) {
            for (var i = 0; i < c.issues.length; i++) {
                var iss = c.issues[i];
                col += '<ul class="pe-cx-list pe-cx-list--cross" style="margin-bottom:2px;">';
                col += '<li>' + icon('x') + '<span><strong>' + escHtml(iss.problem || '') + '</strong></span></li>';
                col += '</ul>';
                if (iss.solution) {
                    col += '<ul class="pe-cx-list pe-cx-list--check" style="margin-top:0;margin-bottom:10px;">';
                    col += '<li>' + icon('circle-check') + '<span>' + escHtml(iss.solution) + '</span></li>';
                    col += '</ul>';
                }
            }
        }
        if (c.escalationTip) {
            col += '<div class="pe-cx-callout pe-cx-callout--protip">' + icon('zap') + '<p><strong>When to escalate:</strong> ' + escHtml(c.escalationTip) + '</p></div>';
        }
        return slideShell(slide, idx, 'pe-slide-troubleshoot', isBuilderPreview ? 'builder' : '', col);
    }

    function renderStaffTips(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-prod-badge pe-prod-badge--stafftips">' + icon('zap') + 'Staff Tips</span>';
        if (c.tips && c.tips.length) {
            col += '<div class="pe-cx-steps">';
            for (var i = 0; i < c.tips.length; i++) {
                var t = c.tips[i];
                col += '<div class="pe-cx-step">';
                col += '<div class="pe-cx-step-num">' + (i + 1) + '</div>';
                col += '<div><p class="pe-cx-component-desc">' + escHtml(t.tip || '') + '</p></div>';
                col += '</div>';
            }
            col += '</div>';
        }
        if (c.proTip) {
            col += '<div class="pe-cx-callout pe-cx-callout--protip">' + icon('zap') + '<p><strong>Pro tip:</strong> ' + escHtml(c.proTip) + '</p></div>';
        }
        return slideShell(slide, idx, 'pe-slide-stafftips', isBuilderPreview ? 'builder' : '', col);
    }

    function renderGenericSlide(slide, idx, isBuilderPreview) {
        var col = '<p style="line-height:1.6;opacity:0.9;">' + escHtml(JSON.stringify(slide.content || {})) + '</p>';
        return slideShell(slide, idx, 'pe-slide-overview', isBuilderPreview ? 'builder' : '', col);
    }

    // ── Concept Explainer Slide Renderers ────────────────────────────────────────

    function renderCxIntroduction(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-cx-badge pe-cx-badge--intro">' + icon('lightbulb') + cxLabel('intro') + '</span>';
        if (c.conceptName) col += '<p class="pe-cx-concept-name">' + escHtml(c.conceptName) + '</p>';
        if (c.tagline) col += '<p class="pe-cx-tagline">' + escHtml(c.tagline) + '</p>';
        if (c.whyItMatters) col += '<p class="pe-cx-body-text">' + escHtml(c.whyItMatters) + '</p>';
        if (c.statOrFact) {
            col += '<div class="pe-cx-callout pe-cx-callout--stat">' + icon('zap') + '<p>' + escHtml(c.statOrFact) + '</p></div>';
        }
        if (c.inYourRole) {
            col += '<div class="pe-cx-callout pe-cx-callout--role">' + icon('user') + '<p>' + escHtml(c.inYourRole) + '</p></div>';
        }
        return slideShell(slide, idx, 'pe-slide-cx pe-slide-cx-intro', isBuilderPreview ? 'builder' : '', col);
    }

    function renderCxScenario(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-cx-badge pe-cx-badge--scenario">' + icon('eye') + cxLabel('scenario') + '</span>';
        if (c.scenarioTitle) col += '<p class="pe-cx-scenario-title">' + escHtml(c.scenarioTitle) + '</p>';
        if (c.situation) col += '<p class="pe-cx-body-text">' + escHtml(c.situation) + '</p>';
        if (c.whatHappened) col += '<p class="pe-cx-narrative">' + escHtml(c.whatHappened) + '</p>';
        if (c.challenge) {
            col += '<div class="pe-cx-callout pe-cx-callout--challenge">' + icon('alert') + '<p>' + escHtml(c.challenge) + '</p></div>';
        }
        if (c.reflection) col += '<p class="pe-cx-reflection">' + icon('edit') + ' ' + escHtml(c.reflection) + '</p>';
        return slideShell(slide, idx, 'pe-slide-cx pe-slide-cx-scenario', isBuilderPreview ? 'builder' : '', col);
    }

    function renderCxKeyConcept(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-cx-badge pe-cx-badge--concept">' + icon('bookmark') + cxLabel('keyconcept') + '</span>';
        if (c.conceptName) col += '<p class="pe-cx-concept-name">' + escHtml(c.conceptName) + '</p>';
        if (c.definition) {
            col += '<div class="pe-cx-callout pe-cx-callout--definition">' + icon('lightbulb') + '<p>' + escHtml(c.definition) + '</p></div>';
        }
        if (c.components && c.components.length) {
            col += '<div class="pe-cx-components">';
            for (var i = 0; i < c.components.length; i++) {
                var comp = c.components[i];
                col += '<div class="pe-cx-component">';
                col += '<div class="pe-cx-component-icon">' + icon(comp.icon || 'star') + '</div>';
                col += '<div><p class="pe-cx-component-name">' + escHtml(comp.name || '') + '</p>';
                col += '<p class="pe-cx-component-desc">' + escHtml(comp.description || '') + '</p></div>';
                col += '</div>';
            }
            col += '</div>';
        }
        if (c.metaphor) col += '<p class="pe-cx-reflection">' + icon('zap') + ' ' + escHtml(c.metaphor) + '</p>';
        return slideShell(slide, idx, 'pe-slide-cx pe-slide-cx-keyconcept', isBuilderPreview ? 'builder' : '', col);
    }

    function renderCxRealExample(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-cx-badge pe-cx-badge--example">' + icon('sparkles') + cxLabel('example') + '</span>';
        if (c.contextSetting) col += '<p class="pe-cx-body-text">' + escHtml(c.contextSetting) + '</p>';
        if (c.whatTheyDid) col += '<p class="pe-cx-narrative">' + escHtml(c.whatTheyDid) + '</p>';
        if (c.behaviours && c.behaviours.length) {
            col += '<ul class="pe-cx-list pe-cx-list--check">';
            for (var i = 0; i < c.behaviours.length; i++) {
                col += '<li>' + icon('circle-check') + '<span>' + escHtml(c.behaviours[i]) + '</span></li>';
            }
            col += '</ul>';
        }
        if (c.result) {
            col += '<div class="pe-cx-callout pe-cx-callout--result">' + icon('trophy') + '<p>' + escHtml(c.result) + '</p></div>';
        }
        if (c.insight) col += '<p class="pe-cx-reflection">' + icon('edit') + ' ' + escHtml(c.insight) + '</p>';
        return slideShell(slide, idx, 'pe-slide-cx pe-slide-cx-example', isBuilderPreview ? 'builder' : '', col);
    }

    function renderCxCommonMistake(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-cx-badge pe-cx-badge--mistake">' + icon('alert') + cxLabel('mistake') + '</span>';
        if (c.mistakeLabel) col += '<p class="pe-cx-mistake-label">' + escHtml(c.mistakeLabel) + '</p>';
        if (c.whatItLooksLike) col += '<p class="pe-cx-body-text">' + escHtml(c.whatItLooksLike) + '</p>';
        if (c.whyItHappens) col += '<p class="pe-cx-narrative">' + escHtml(c.whyItHappens) + '</p>';
        if (c.impacts && c.impacts.length) {
            col += '<ul class="pe-cx-list pe-cx-list--cross">';
            for (var i = 0; i < c.impacts.length; i++) {
                col += '<li>' + icon('x') + '<span>' + escHtml(c.impacts[i]) + '</span></li>';
            }
            col += '</ul>';
        }
        if (c.doThisInstead) {
            col += '<div class="pe-cx-callout pe-cx-callout--fix">' + icon('check') + '<p><strong>' + cxLabel('instead') + '</strong> ' + escHtml(c.doThisInstead) + '</p></div>';
        }
        return slideShell(slide, idx, 'pe-slide-cx pe-slide-cx-mistake', isBuilderPreview ? 'builder' : '', col);
    }

    function renderCxBestPractice(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-cx-badge pe-cx-badge--practice">' + icon('clipboard') + cxLabel('practice') + '</span>';
        if (c.practiceTitle) col += '<p class="pe-cx-concept-name">' + escHtml(c.practiceTitle) + '</p>';
        if (c.steps && c.steps.length) {
            col += '<div class="pe-cx-steps">';
            for (var i = 0; i < c.steps.length; i++) {
                var s = c.steps[i];
                col += '<div class="pe-cx-step">';
                col += '<div class="pe-cx-step-num">' + (i + 1) + '</div>';
                col += '<div><p class="pe-cx-component-name">' + escHtml(s.step || '') + '</p>';
                col += '<p class="pe-cx-component-desc">' + escHtml(s.detail || '') + '</p></div>';
                col += '</div>';
            }
            col += '</div>';
        }
        if (c.proTip) {
            col += '<div class="pe-cx-callout pe-cx-callout--protip">' + icon('zap') + '<p><strong>' + cxLabel('protip') + '</strong> ' + escHtml(c.proTip) + '</p></div>';
        }
        return slideShell(slide, idx, 'pe-slide-cx pe-slide-cx-practice', isBuilderPreview ? 'builder' : '', col);
    }

    function renderCxSummary(slide, idx, isBuilderPreview) {
        var c = slide.content || {};
        var col = '';
        col += '<span class="pe-cx-badge pe-cx-badge--summary">' + icon('bookmark') + cxLabel('summary') + '</span>';
        if (c.conceptName) col += '<p class="pe-cx-concept-name">' + escHtml(c.conceptName) + '</p>';
        if (c.keyTakeaways && c.keyTakeaways.length) {
            col += '<div class="pe-cx-components">';
            for (var i = 0; i < c.keyTakeaways.length; i++) {
                var t = c.keyTakeaways[i];
                col += '<div class="pe-cx-component">';
                col += '<div class="pe-cx-component-icon">' + icon(t.icon || 'check') + '</div>';
                col += '<p class="pe-cx-component-desc">' + escHtml(t.point || '') + '</p>';
                col += '</div>';
            }
            col += '</div>';
        }
        if (c.reflectionQuestion) {
            col += '<div class="pe-cx-callout pe-cx-callout--reflect">' + icon('edit') + '<p>' + escHtml(c.reflectionQuestion) + '</p></div>';
        }
        if (c.commitmentPrompt) {
            col += '<div class="pe-cx-callout pe-cx-callout--commit">' + icon('clipboard') + '<p>' + escHtml(c.commitmentPrompt) + '</p></div>';
        }
        return slideShell(slide, idx, 'pe-slide-cx pe-slide-cx-summary', isBuilderPreview ? 'builder' : '', col);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────────
    function buildVoiceoverText(slide) {
        // Always use AI-generated voiceoverText when it exists and is non-empty.
        // Only skip it if it begins with a generic "Welcome to this training" style
        // opener — those were produced by older prompt versions and don't match the
        // slide content.  The word-count threshold has been removed: it caused
        // inconsistency by sending some slides through the AI path and others through
        // the content-fallback path, producing different reading styles slide-to-slide.
        // FIX-NARRATION-VERBATIM: always build narration from structural slide fields so
        // the TTS reads exactly what is displayed on screen, not an AI-generated summary.
        var c = slide.content || {};
        var parts = [];

        // Ensure each sentence ends with a period so the TTS engine pauses naturally.
        function add(text) {
            if (!text) return;
            text = String(text).trim();
            if (!text) return;
            if (!/[.!?]$/.test(text)) text += '.';
            parts.push(text);
        }

        // Slide title — read as the opening sentence
        add(slide.title);

        // Product overview fields
        if (c.productName)          add(c.productName);
        if (c.valueProp)            add(c.valueProp);
        if (c.quickFacts && c.quickFacts.length) {
            c.quickFacts.forEach(function(qf) {
                if (qf.label && qf.value) add(qf.label + ': ' + qf.value);
            });
        }

        // What / How slide
        if (c.whatIsIt)             add(c.whatIsIt);
        if (c.howItWorks)           add(c.howItWorks);
        if (c.customerExplanation)  add(c.customerExplanation);

        // Key benefits
        if (c.benefits && c.benefits.length) {
            c.benefits.forEach(function(b) {
                if (b.title) add(b.title + (b.description ? '. ' + b.description : ''));
            });
        }
        if (c.talkingPoint)         add(c.talkingPoint);

        // Who it's for
        if (c.personas && c.personas.length) {
            c.personas.forEach(function(p) {
                if (p.type) add(p.type + (p.description ? '. ' + p.description : ''));
            });
        }
        if (c.bestFit)              add(c.bestFit);

        // How to recommend — include section headings for natural structure
        if (c.discoverNeeds) {
            if (c.discoverNeeds.title) add(c.discoverNeeds.title);
            if (c.discoverNeeds.points) {
                c.discoverNeeds.points.forEach(function(pt) { add(pt); });
            }
        }
        if (c.matchBenefits) {
            if (c.matchBenefits.title) add(c.matchBenefits.title);
            if (c.matchBenefits.points) {
                c.matchBenefits.points.forEach(function(pt) { add(pt); });
            }
        }
        if (c.conversationExample) {
            var ce = c.conversationExample;
            if (ce.customer) add('Customer asks: ' + ce.customer);
            if (ce.staff)    add('You respond: ' + ce.staff);
        }

        // Using the product
        if (c.gettingStarted && c.gettingStarted.length) {
            c.gettingStarted.forEach(function(s) {
                if (s.step) add(s.step + (s.description ? '. ' + s.description : ''));
            });
        }
        if (c.relatedProducts && c.relatedProducts.length) {
            var names = c.relatedProducts.map(function(r) { return r.name || ''; }).filter(Boolean);
            if (names.length) add('Pair this with: ' + names.join(', '));
        }
        if (c.staffTip)             add(c.staffTip);

        // FAQ
        if (c.faqs && c.faqs.length) {
            c.faqs.forEach(function(f) {
                if (f.question) add(f.question);
                if (f.answer)   add(f.answer);
            });
        }

        // Handling objections
        if (c.objections && c.objections.length) {
            c.objections.forEach(function(o) {
                if (o.objection) add(o.objection);
                if (o.response)  add(o.response);
            });
        }
        if (c.closingLine)          add(c.closingLine);

        // Care & maintenance
        if (c.careSteps && c.careSteps.length) {
            c.careSteps.forEach(function(s) {
                if (s.action) add(s.action + (s.detail ? '. ' + s.detail : ''));
            });
        }
        if (c.lifespan)             add(c.lifespan);
        if (c.staffReminder)        add(c.staffReminder);

        // Competitive advantage
        if (c.vsAlternatives && c.vsAlternatives.length) {
            c.vsAlternatives.forEach(function(v) {
                if (v.ourAdvantage) add(v.ourAdvantage);
            });
        }
        if (c.uniqueSellingPoint)   add(c.uniqueSellingPoint);
        if (c.staffPitch)           add(c.staffPitch);

        // Seasonal use
        if (c.scenarios && c.scenarios.length) {
            c.scenarios.forEach(function(s) {
                if (s.situation) add(s.situation + (s.pitch ? '. ' + s.pitch : ''));
            });
        }
        if (c.peakPeriod)           add(c.peakPeriod);
        if (c.displayTip)           add(c.displayTip);

        // Upsell & bundle
        if (c.upsells && c.upsells.length) {
            c.upsells.forEach(function(u) {
                if (u.product) add(u.product + (u.reason ? '. ' + u.reason : ''));
            });
        }
        if (c.bundleIdea)           add(c.bundleIdea);
        if (c.upsellScript)         add(c.upsellScript);

        // Customer story
        if (c.scenario)             add(c.scenario);
        if (c.challenge)            add(c.challenge);
        if (c.solution)             add(c.solution);
        if (c.outcome)              add(c.outcome);
        if (c.staffUse)             add(c.staffUse);

        // Troubleshooting
        if (c.issues && c.issues.length) {
            c.issues.forEach(function(iss) {
                if (iss.problem)  add(iss.problem);
                if (iss.solution) add(iss.solution);
            });
        }
        if (c.escalationTip)        add(c.escalationTip);

        // Staff tips
        if (c.tips && c.tips.length) {
            c.tips.forEach(function(t) { if (t.tip) add(t.tip); });
        }
        if (c.proTip)               add(c.proTip);

        // ── Concept Explainer (cx-*) fields ─────────────────────────────────
        // cx-introduction
        if (c.tagline)              add(c.tagline);
        if (c.whyItMatters)         add(c.whyItMatters);
        if (c.statOrFact)           add(c.statOrFact);
        if (c.inYourRole)           add(c.inYourRole);

        // cx-scenario
        if (c.scenarioTitle)        add(c.scenarioTitle);
        if (c.situation)            add(c.situation);
        if (c.whatHappened)         add(c.whatHappened);
        if (c.challenge)            add(c.challenge);
        if (c.reflection)           add(c.reflection);

        // cx-key-concept
        if (c.definition)           add(c.definition);
        if (c.components && c.components.length) {
            c.components.forEach(function(comp) {
                if (comp.name) add(comp.name + (comp.description ? '. ' + comp.description : ''));
            });
        }
        if (c.metaphor)             add(c.metaphor);

        // cx-real-example
        if (c.contextSetting)       add(c.contextSetting);
        if (c.whatTheyDid)          add(c.whatTheyDid);
        if (c.behaviours && c.behaviours.length) {
            c.behaviours.forEach(function(b) { if (b) add(b); });
        }
        if (c.result)               add(c.result);
        if (c.insight)              add(c.insight);

        // cx-common-mistake
        if (c.mistakeLabel)         add(c.mistakeLabel);
        if (c.whatItLooksLike)      add(c.whatItLooksLike);
        if (c.whyItHappens)         add(c.whyItHappens);
        if (c.impacts && c.impacts.length) {
            c.impacts.forEach(function(imp) { if (imp) add(imp); });
        }
        if (c.doThisInstead)        add(c.doThisInstead);

        // cx-best-practice
        if (c.practiceTitle)        add(c.practiceTitle);
        if (c.steps && c.steps.length) {
            c.steps.forEach(function(s) {
                if (s.step) add(s.step + (s.detail ? '. ' + s.detail : ''));
            });
        }

        // cx-summary
        if (c.keyTakeaways && c.keyTakeaways.length) {
            c.keyTakeaways.forEach(function(t) { if (t && t.point) add(t.point); });
        }
        if (c.reflectionQuestion)   add(c.reflectionQuestion);
        if (c.commitmentPrompt)     add(c.commitmentPrompt);

        // Join with double-space so TTS engines that use whitespace heuristics
        // treat each sentence as a distinct utterance with a natural pause.
        return parts.join('  ');
    }

    function ajaxPost(url, queryParams, body, onSuccess, onError) {
        var qs = Object.keys(queryParams).map(function(k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(queryParams[k]);
        }).join('&');
        var fullUrl = url + (url.indexOf('?') === -1 ? '?' : '&') + qs;

        var xhr = new XMLHttpRequest();
        xhr.open('POST', fullUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    onSuccess(data);
                } catch(e) { onError('Invalid JSON response'); }
            } else {
                onError('HTTP ' + xhr.status);
            }
        };
        xhr.onerror = function() { onError('Network error'); };
        xhr.send(body || null);
    }

    function showStatus(containerId, msg, type) {
        var el = document.getElementById(containerId);
        if (!el) return;
        var cls = type === 'error' ? 'pe-status-error' : (type === 'success' ? 'pe-status-success' : 'pe-status-info');
        el.innerHTML = '<div class="pe-status-msg ' + cls + '">' + escHtml(msg) + '</div>';
    }

    function escHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function spinner() {
        return '<svg class="pe-spinner" style="width:16px;height:16px;display:inline-block;vertical-align:middle;margin-right:6px;border-width:2px;" viewBox="0 0 24 24"></svg>';
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // QUIZ — end-of-slides knowledge check
    // ─────────────────────────────────────────────────────────────────────────────

    function getQuizAudioCtx() {
        if (!quizAudioCtx) {
            quizAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return quizAudioCtx;
    }

    function playQuizCorrectSound() {
        try {
            var ctx = getQuizAudioCtx();
            var osc = ctx.createOscillator(); var gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1);
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
        } catch(e) {}
    }

    function playQuizIncorrectSound() {
        try {
            var ctx = getQuizAudioCtx();
            var osc = ctx.createOscillator(); var gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.setValueAtTime(165, ctx.currentTime + 0.1);
            osc.type = 'sawtooth';
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
        } catch(e) {}
    }

    function playQuizFanfare() {
        try {
            var ctx = getQuizAudioCtx();
            var notes = [523.25, 659.25, 783.99, 1046.50];
            var delay = 0;
            notes.forEach(function(freq) {
                var osc = ctx.createOscillator(); var gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
                osc.type = 'sine';
                gain.gain.setValueAtTime(0, ctx.currentTime + delay);
                gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.4);
                osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + 0.4);
                delay += 0.15;
            });
            setTimeout(function() {
                notes.forEach(function(freq) {
                    var osc = ctx.createOscillator(); var gain = ctx.createGain();
                    osc.connect(gain); gain.connect(ctx.destination);
                    osc.frequency.setValueAtTime(freq, ctx.currentTime);
                    osc.type = 'sine';
                    gain.gain.setValueAtTime(0.15, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
                    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.8);
                });
            }, 700);
        } catch(e) {}
    }

    function launchQuizConfetti(container) {
        var colors = ['#667eea','#764ba2','#10b981','#f59e0b','#ef4444','#06b6d4','#8b5cf6'];
        for (var i = 0; i < 130; i++) {
            var p = document.createElement('div');
            p.className = 'pe-confetti-piece';
            p.style.left = Math.random() * 100 + '%';
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            p.style.animationDelay = (Math.random() * 2.5) + 's';
            p.style.animationDuration = (Math.random() * 2 + 2) + 's';
            p.style.width  = (Math.random() > 0.5 ? 8 : 10) + 'px';
            p.style.height = (Math.random() > 0.5 ? 8 : 12) + 'px';
            if (Math.random() > 0.5) p.style.borderRadius = '50%';
            container.appendChild(p);
        }
        setTimeout(function() {
            var pieces = container.querySelectorAll('.pe-confetti-piece');
            for (var j = 0; j < pieces.length; j++) pieces[j].remove();
        }, 5500);
    }

    // Stop any in-flight Chirp quiz audio and cancel Web Speech fallback.
    // Incrementing quizTtsGenId here invalidates any AJAX call that is still
    // in-flight from the previous speakQuizText() call.  Without this, if the
    // user advances to the results screen before the explanation AJAX resolves,
    // that stale audio would play over the results screen.
    function stopQuizAudio() {
        quizTtsGenId++;
        if (quizCurrentAudio) {
            quizCurrentAudio.pause();
            quizCurrentAudio = null;
        }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    // Pre-generate feedback TTS in the background so it plays instantly on Check.
    // Called as soon as the student selects an answer option — before clicking Check.
    function prefetchFeedbackTts(text) {
        if (!cfg.ajaxUrl || !cfg.sesskey || !cfg.cmid || isBuilderPreviewMode || !text) return;
        prefetchQuizAudio = null;
        prefetchQuizPending = true;
        var myId = ++prefetchQuizGenId;
        ajaxPost(
            cfg.ajaxUrl,
            { action: 'generate_quiz_tts', sesskey: cfg.sesskey, cmid: cfg.cmid },
            JSON.stringify({ text: text, language: cfg.voiceLanguage || 'en-AU', voice: (manifest && manifest.voiceStyle) || cfg.voiceStyle || 'Zephyr' }),
            function(data) {
                if (myId !== prefetchQuizGenId) { prefetchQuizPending = false; return; }
                prefetchQuizPending = false;
                if (data && data.success && data.audioContent) {
                    try {
                        var binary = atob(data.audioContent);
                        var bytes = new Uint8Array(binary.length);
                        for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                        var blob = new Blob([bytes], { type: 'audio/ogg' });
                        var blobUrl = URL.createObjectURL(blob);
                        var audio = new Audio(blobUrl);
                        prefetchQuizAudio = { text: text, audio: audio, url: blobUrl };
                    } catch(e) {}
                }
            },
            function() { prefetchQuizPending = false; }
        );
    }

    // FIX-KC-DELAY-MAP: pre-warm BOTH possible feedback texts (correct + incorrect) at
    // question render time so audio is cached before the student clicks an option.
    // Uses a dedicated multi-slot object (prefetchAudioMap) so both can be stored
    // simultaneously without cancelling each other via prefetchQuizGenId.
    function warmupQuizFeedbacks(q) {
        if (!cfg.ajaxUrl || !cfg.sesskey || !cfg.cmid || isBuilderPreviewMode || !q) return;
        var letters = ['A','B','C','D'];
        var texts = [
            'Correct! ' + (q.explanation || ''),
            'The correct answer is ' + (letters[q.correctAnswer] || 'A') + '. ' + (q.explanation || '')
        ];
        texts.forEach(function(text) {
            var t = text.trim();
            if (!t || prefetchAudioMap[t]) return;
            var capturedText = t;
            ajaxPost(
                cfg.ajaxUrl,
                { action: 'generate_quiz_tts', sesskey: cfg.sesskey, cmid: cfg.cmid },
                JSON.stringify({ text: capturedText, language: cfg.voiceLanguage || 'en-AU', voice: (manifest && manifest.voiceStyle) || cfg.voiceStyle || 'Zephyr' }),
                function(data) {
                    if (data && data.success && data.audioContent) {
                        try {
                            var binary = atob(data.audioContent);
                            var bytes = new Uint8Array(binary.length);
                            for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                            var blob = new Blob([bytes], { type: 'audio/ogg' });
                            var blobUrl = URL.createObjectURL(blob);
                            prefetchAudioMap[capturedText] = { audio: new Audio(blobUrl), url: blobUrl };
                        } catch(e) {}
                    }
                },
                function() {}
            );
        });
    }

    // Web Speech API fallback (used when Chirp HD call fails or is unavailable).
    function speakQuizTextWebSpeech(text, onEnd) {
        if (!window.speechSynthesis || !text) { if (onEnd) onEnd(); return; }
        window.speechSynthesis.cancel();
        var utt = new window.SpeechSynthesisUtterance(text);
        utt.rate = 0.95;
        utt.pitch = 1.0;
        if (onEnd) utt.onend = onEnd;
        window.speechSynthesis.speak(utt);
    }

    // Inner helper: fire a fresh Chirp HD AJAX call and play the result.
    // genId must equal quizTtsGenId at callback time or the response is discarded.
    // All failure paths call onEnd so upstream state (e.g. disabled Next button) is
    // always resolved even when audio cannot be played.
    function doChirpHdAjax(text, genId, onEnd) {
        ajaxPost(
            cfg.ajaxUrl,
            { action: 'generate_quiz_tts', sesskey: cfg.sesskey, cmid: cfg.cmid },
            JSON.stringify({
                text:     text,
                language: cfg.voiceLanguage || 'en-AU',
                voice:    (manifest && manifest.voiceStyle) || cfg.voiceStyle || 'Zephyr'
            }),
            function(data) {
                if (genId !== quizTtsGenId) { return; }
                if (data && data.success && data.audioContent) {
                    try {
                        var binary = atob(data.audioContent);
                        var bytes  = new Uint8Array(binary.length);
                        for (var i = 0; i < binary.length; i++) {
                            bytes[i] = binary.charCodeAt(i);
                        }
                        var blob  = new Blob([bytes], { type: 'audio/ogg' });
                        var url   = URL.createObjectURL(blob);
                        var audio = new Audio(url);
                        quizCurrentAudio = audio;
                        audio.onended = function() {
                            quizCurrentAudio = null;
                            URL.revokeObjectURL(url);
                            if (onEnd) onEnd();
                        };
                        audio.onerror = function() {
                            quizCurrentAudio = null;
                            URL.revokeObjectURL(url);
                            if (onEnd) onEnd();
                        };
                        var playPromise = audio.play();
                        if (playPromise && playPromise.catch) {
                            playPromise.catch(function() {
                                quizCurrentAudio = null;
                                URL.revokeObjectURL(url);
                                if (onEnd) onEnd();
                            });
                        }
                    } catch (e) {
                        if (onEnd) onEnd();
                    }
                } else {
                    // API returned failure — skip narration silently.
                    // Do NOT fall back to Web Speech; switching from Chirp HD to the
                    // browser's built-in voice mid-quiz causes the male/female voice
                    // inconsistency reported by testers.
                    if (onEnd) onEnd();
                }
            },
            function() {
                if (genId !== quizTtsGenId) { return; }
                // Network error — skip narration silently (same reason as above).
                if (onEnd) onEnd();
            }
        );
    }

    // Primary TTS function — uses the Chirp3-HD voice configured in the
    // activity settings (cfg.voiceStyle + cfg.voiceLanguage).  Falls back to
    // the browser Web Speech API when AJAX is unavailable or the API call fails.
    // quizTtsGenId guards against stale AJAX responses from a previous question
    // arriving after the player has already advanced to the next question.
    function speakQuizText(text, onEnd) {
        if (!text) { if (onEnd) onEnd(); return; }

        // FIX-KC-DELAY-MAP: check multi-slot pre-warm map first — populated by
        // warmupQuizFeedbacks() at question render so audio is ready before Check is clicked.
        var _trimText = text.trim();
        if (prefetchAudioMap[_trimText] && prefetchAudioMap[_trimText].audio) {
            stopQuizAudio();
            ++quizTtsGenId;
            var wmEntry = prefetchAudioMap[_trimText];
            delete prefetchAudioMap[_trimText];
            quizCurrentAudio = wmEntry.audio;
            wmEntry.audio.onended = function() { quizCurrentAudio = null; URL.revokeObjectURL(wmEntry.url); if (onEnd) onEnd(); };
            wmEntry.audio.onerror = function() { quizCurrentAudio = null; URL.revokeObjectURL(wmEntry.url); if (onEnd) onEnd(); };
            var wmPlay = wmEntry.audio.play();
            if (wmPlay && wmPlay.catch) wmPlay.catch(function() { quizCurrentAudio = null; URL.revokeObjectURL(wmEntry.url); if (onEnd) onEnd(); });
            return;
        }

        stopQuizAudio();
        var myGenId = ++quizTtsGenId; // capture the generation ID for this call

        // Use pre-fetched audio if ready (eliminates delay after answer selection).
        if (prefetchQuizAudio && prefetchQuizAudio.text === text && prefetchQuizAudio.audio) {
            var cached = prefetchQuizAudio;
            prefetchQuizAudio = null;
            quizCurrentAudio = cached.audio;
            cached.audio.onended = function() {
                quizCurrentAudio = null;
                URL.revokeObjectURL(cached.url);
                if (onEnd) onEnd();
            };
            cached.audio.onerror = function() {
                quizCurrentAudio = null;
                URL.revokeObjectURL(cached.url);
                if (onEnd) onEnd();
            };
            var cachePromise = cached.audio.play();
            if (cachePromise && cachePromise.catch) {
                cachePromise.catch(function() {
                    quizCurrentAudio = null;
                    URL.revokeObjectURL(cached.url);
                    if (onEnd) onEnd();
                });
            }
            return;
        }

        // If a prefetch AJAX is still in-flight, wait up to 5 s for it to resolve.
        // We do NOT fall back to Web Speech here — doing so would switch voice mid-quiz
        // (Chirp HD for some items, browser voice for others) causing the male/female
        // voice inconsistency reported by testers.
        if (prefetchQuizPending) {
            var _pWait = 0;
            var _pMyGenId = myGenId;
            var _pText = text;
            var _pOnEnd = onEnd;
            var _pInterval = setInterval(function() {
                _pWait += 100;
                // Pre-fetch resolved with the audio we need — use it.
                if (prefetchQuizAudio && prefetchQuizAudio.text === _pText && prefetchQuizAudio.audio) {
                    clearInterval(_pInterval);
                    if (_pMyGenId !== quizTtsGenId) return;
                    var pc = prefetchQuizAudio;
                    prefetchQuizAudio = null;
                    quizCurrentAudio = pc.audio;
                    pc.audio.onended = function() { quizCurrentAudio = null; URL.revokeObjectURL(pc.url); if (_pOnEnd) _pOnEnd(); };
                    pc.audio.onerror = function() { quizCurrentAudio = null; URL.revokeObjectURL(pc.url); if (_pOnEnd) _pOnEnd(); };
                    var pp = pc.audio.play();
                    if (pp && pp.catch) pp.catch(function() { quizCurrentAudio = null; URL.revokeObjectURL(pc.url); if (_pOnEnd) _pOnEnd(); });
                    return;
                }
                // Pre-fetch finished but no audio for our text, OR timed out.
                if (!prefetchQuizPending || _pWait >= 5000) {
                    clearInterval(_pInterval);
                    if (_pMyGenId !== quizTtsGenId) return;
                    if (!prefetchQuizPending && cfg.ajaxUrl && cfg.sesskey && cfg.cmid && !isBuilderPreviewMode) {
                        // Prefetch completed with wrong/no audio — make a fresh Chirp HD call
                        // so the question IS narrated even when the prefetch raced ahead.
                        doChirpHdAjax(_pText, _pMyGenId, _pOnEnd);
                    } else {
                        // Timed out (5 s) OR no AJAX credentials — skip silently to avoid
                        // switching to Web Speech and breaking voice consistency.
                        if (_pOnEnd) _pOnEnd();
                    }
                }
            }, 100);
            return;
        }

        // No pending prefetch — use Chirp HD directly when credentials are available.
        if (cfg.ajaxUrl && cfg.sesskey && cfg.cmid && !isBuilderPreviewMode) {
            doChirpHdAjax(text, myGenId, onEnd);
            return;
        }

        // Builder preview or no AJAX — use Web Speech API.
        speakQuizTextWebSpeech(text, onEnd);
    }

    /**
     * FIX-QUIZCOUNT-DROPPED (client safety net).
     * Make the generated manifest honour the number of questions the teacher asked for.
     * If the generator returns more, trim the extras. If it returns fewer, we cannot
     * invent them — so say so plainly rather than silently showing the wrong number.
     *
     * @param  {object} m        The generated manifest.
     * @param  {number} wanted   Questions the teacher requested.
     * @return {string} HTML-safe suffix to append to the status message ('' if exact).
     */
    function reconcileQuizCount(m, wanted) {
        if (!m || !Array.isArray(m.quizQuestions)) return '';
        var got = m.quizQuestions.length;
        if (!wanted || got === wanted) return '';
        if (got > wanted) {
            m.quizQuestions = m.quizQuestions.slice(0, wanted);
            return '';
        }
        return ' Note: the generator returned ' + got + ' of the ' + wanted + ' quiz questions you asked for.'
            + ' Regenerate if you need the full set.';
    }

    /**
     * Whether the quiz overlay is currently on screen.
     *
     * Slide navigation (keyboard, swipe) must be inert while it is, or it re-enters
     * showQuiz() and destroys the run in progress.
     *
     * @return {boolean}
     */
    function isQuizOpen() {
        var o = document.getElementById('pe-quiz-overlay');
        return !!(o && o.style.display && o.style.display !== 'none');
    }

    /**
     * Cancel the pending "re-enable Next" safety timer.
     *
     * The timer is keyed to the button id, which every question reuses, so a timer left
     * over from a previous question would otherwise enable Next on the current one before
     * its feedback had finished playing.
     */
    function clearQuizNextTimer() {
        if (quizNextTimer) {
            clearTimeout(quizNextTimer);
            quizNextTimer = null;
        }
    }

    // FEAT-PASS-MARK-WIRED: single source of truth for the pass mark.
    // When the teacher has enabled the "pass the knowledge quiz" completion rule we use
    // the percentage they configured (completionquizpercent). Otherwise there is no
    // teacher-set threshold, so we fall back to 80% — the value the UI used to hardcode.
    function getQuizPassMark() {
        var pct = parseInt(cfg.completionQuizPct, 10);
        if (cfg.completionQuiz && !isNaN(pct) && pct > 0 && pct <= 100) return pct;
        return 80;
    }

    // Real question index currently on screen.
    function currentQuizIdx() {
        return quizOrder.length ? quizOrder[quizCurrentQ] : 0;
    }

    // Score is always counted across the WHOLE quiz, not just the questions in this run.
    function recalcQuizScore() {
        var n = 0;
        for (var i = 0; i < quizQuestions.length; i++) {
            if (quizResultMap[i] === true) n++;
        }
        quizScore = n;
        return n;
    }

    // Indices of every question not yet answered correctly.
    function getWrongQuizIdx() {
        var out = [];
        for (var i = 0; i < quizQuestions.length; i++) {
            if (quizResultMap[i] !== true) out.push(i);
        }
        return out;
    }

    /**
     * Open the quiz.
     * @param {boolean} retryWrongOnly When true, re-present only the questions the
     *        student has not yet answered correctly, keeping their existing score.
     */
    function showQuiz(retryWrongOnly) {
        if (isBuilderPreviewMode) return;
        if (!quizQuestions.length) return;

        // Stop any slide audio and any in-progress quiz audio (e.g. retake mid-read)
        Object.keys(audioElements).forEach(function(k) {
            if (audioElements[k]) { audioElements[k].pause(); audioElements[k].currentTime = 0; }
        });
        stopQuizAudio();
        isPlayingAudio = false;

        quizRetryMode = (retryWrongOnly === true);

        if (quizRetryMode) {
            // Keep quizResultMap and attemptAnswers — only the wrong ones are re-asked.
            quizOrder = getWrongQuizIdx();
            if (!quizOrder.length) { showQuizResults(); return; }
        } else {
            // Full run: wipe every remembered outcome and start from question 1.
            quizResultMap = {};
            quizOrder = [];
            for (var i = 0; i < quizQuestions.length; i++) quizOrder.push(i);
            attemptAnswers   = [];
            attemptStartTime = Date.now();
            // Must clear too, or a pass recorded before a retake stays true for the whole
            // of the new run and leaves the certificate gate open.
            quizPassed       = false;
            quizAttemptSaved = false;
        }
        clearQuizNextTimer();

        quizCurrentQ = 0;
        quizSelected = null;
        quizAnswered = false;
        prefetchAudioMap = {};
        recalcQuizScore();

        var overlay = document.getElementById('pe-quiz-overlay');
        if (!overlay) return;
        overlay.style.display = 'flex';

        // A retry goes straight to the first outstanding question — the student has
        // already seen the intro splash, and re-showing it just adds a click.
        if (quizRetryMode) {
            renderQuizQuestion(0);
        } else {
            renderQuizSplash();
        }
    }

    function renderQuizSplash() {
        var overlay = document.getElementById('pe-quiz-overlay');
        if (!overlay) return;
        var total     = quizQuestions.length;
        var topicName = (manifest && (manifest.productName || manifest.conceptName || manifest.topic)) || '';
        var html = '';
        html += '<div class="pe-quiz-splash">';
        html += '<div class="pe-quiz-splash-icon">';
        html += '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
        html += '</div>';
        html += '<h2 class="pe-quiz-splash-title">Check Your Understanding</h2>';
        if (topicName) html += '<p class="pe-quiz-splash-topic">' + escHtml(topicName) + '</p>';
        html += '<div class="pe-quiz-splash-info">';
        html += '<div class="pe-quiz-splash-stat"><span class="pe-quiz-splash-stat-val">' + total + '</span><span class="pe-quiz-splash-stat-lbl">Questions</span></div>';
        html += '<div class="pe-quiz-splash-divider"></div>';
        // FEAT-PASS-MARK-WIRED: show the teacher's actual pass mark, not a hardcoded 80%.
        html += '<div class="pe-quiz-splash-stat"><span class="pe-quiz-splash-stat-val">' + getQuizPassMark() + '%</span><span class="pe-quiz-splash-stat-lbl">To Pass</span></div>';
        html += '</div>';
        html += '<div class="pe-quiz-splash-voice">';
        html += '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>';
        html += '<span>Questions &amp; feedback are read aloud</span>';
        html += '</div>';
        html += '<button class="pe-quiz-start-btn" id="pe-quiz-start-btn">';
        html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        html += 'Start Quiz</button>';
        html += '</div>';
        overlay.innerHTML = html;
        var startBtn = document.getElementById('pe-quiz-start-btn');
        if (startBtn) startBtn.addEventListener('click', function() { renderQuizQuestion(0); });
        // FIX-QUIZ-Q0-AUDIO-DELAY: Pre-warm Q0 question TTS now, while student reads splash.
        // By the time they click Start, the audio is cached and plays instantly.
        if (quizQuestions.length > 0) {
            prefetchFeedbackTts(quizQuestions[0].question || '');
        }
    }

    function renderQuizQuestion(idx) {
        var overlay = document.getElementById('pe-quiz-overlay');
        if (!overlay) return;
        // Reset per-question state so options are selectable on every new question.
        quizAnswered = false;
        quizSelected = null;
        clearQuizNextTimer();
        // `idx` is a position within quizOrder, which in a retry run holds only the
        // question indices the student still has to get right.
        quizCurrentQ = idx;
        var realIdx = currentQuizIdx();
        var q      = quizQuestions[realIdx];
        if (!q) { showQuizResults(); return; }
        var runTotal = quizOrder.length;
        // Progress reflects questions completed, so the bar reaches 100% on the last one.
        var pct    = Math.round(((idx + 1) / runTotal) * 100);
        var letters = ['A','B','C','D'];

        var optHtml = '';
        (q.options || []).forEach(function(opt, i) {
            var txt = String(opt || '').replace(/\.\s*$/, '').trim();
            if (txt.length) txt = txt.charAt(0).toUpperCase() + txt.slice(1);
            // letters[] only covers A-D; fall back to a number so a 5th+ option from the
            // generator does not render the literal text "undefined".
            var letter = letters[i] || String(i + 1);
            optHtml += '<div class="pe-quiz-option" data-index="' + i + '">'
                + '<span class="pe-quiz-option-letter">' + letter + '</span>'
                + '<span class="pe-quiz-option-text">' + escHtml(txt) + '</span>'
                + '</div>';
        });

        var isLast = (idx === runTotal - 1);
        var html = '<div class="pe-quiz-question-wrap">';
        html += '<div class="pe-quiz-header">';
        html += '<div class="pe-quiz-prog-track"><div class="pe-quiz-prog-fill" style="width:' + pct + '%"></div></div>';
        html += '<div class="pe-quiz-header-bar">';
        if (quizRetryMode) {
            html += '<span class="pe-quiz-counter">' + icon('zap') + 'Retry&nbsp;' + (idx + 1) + '&nbsp;of&nbsp;' + runTotal
                + '&nbsp;&bull;&nbsp;Q' + (realIdx + 1) + '</span>';
        } else {
            html += '<span class="pe-quiz-counter">' + icon('clipboard') + 'Question&nbsp;' + (idx + 1) + '&nbsp;of&nbsp;' + runTotal + '</span>';
        }
        html += '<span class="pe-quiz-score-badge">' + quizScore + '/' + quizQuestions.length + ' correct</span>';
        html += '</div></div>';

        html += '<div class="pe-quiz-body">';
        html += '<p class="pe-quiz-qtext">' + escHtml(q.question || '') + '</p>';
        html += '<div class="pe-quiz-options" id="pe-quiz-options">' + optHtml + '</div>';
        html += '<div class="pe-quiz-feedback" id="pe-quiz-feedback"></div>';
        html += '<div class="pe-quiz-actions">';
        html += '<button class="pe-quiz-check-btn" id="pe-quiz-check-btn" disabled>Check Answer</button>';
        html += '<button class="pe-quiz-next-btn" id="pe-quiz-next-btn" style="display:none">'
            + (isLast ? 'See Results ' : 'Next Question ') + icon('chevR') + '</button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        overlay.innerHTML = html;
        bindQuizOptions();
        // FIX-KC-FEEDBACK-DELAY: pre-warm BOTH feedback texts (correct + incorrect) now,
        // before the student selects any option, so audio is ready when Check is clicked.
        warmupQuizFeedbacks(q);
        var qText = q.question || '';
        if (qText) setTimeout(function() { speakQuizText(qText); }, 50);
    }

    function bindQuizOptions() {
        var opts = document.querySelectorAll('.pe-quiz-option');
        for (var i = 0; i < opts.length; i++) {
            opts[i].addEventListener('click', onQuizOptionClick);
        }
        var cb = document.getElementById('pe-quiz-check-btn');
        if (cb) cb.addEventListener('click', checkQuizAnswer);
        var nb = document.getElementById('pe-quiz-next-btn');
        if (nb) nb.addEventListener('click', advanceQuiz);
    }

    function onQuizOptionClick(e) {
        if (quizAnswered) return;
        var el = e.currentTarget;
        var idx = parseInt(el.getAttribute('data-index'), 10);
        var opts = document.querySelectorAll('.pe-quiz-option');
        for (var i = 0; i < opts.length; i++) opts[i].classList.remove('pe-quiz-option--selected');
        el.classList.add('pe-quiz-option--selected');
        quizSelected = idx;
        var cb = document.getElementById('pe-quiz-check-btn');
        if (cb) cb.disabled = false;
        // Pre-generate feedback TTS now so it's ready the instant Check is clicked
        var q = quizQuestions[currentQuizIdx()];
        if (q) {
            var letters = ['A','B','C','D'];
            var isOk = (idx === q.correctAnswer);
            var prefix = isOk ? 'Correct! ' : 'The correct answer is ' + (letters[q.correctAnswer] || String((q.correctAnswer || 0) + 1)) + '. ';
            prefetchFeedbackTts(prefix + (q.explanation || ''));
        }
    }

    function checkQuizAnswer() {
        if (quizSelected === null || quizAnswered) return;
        quizAnswered = true;
        var realIdx = currentQuizIdx();
        var q       = quizQuestions[realIdx];
        var correct = q.correctAnswer;
        var isOk    = (quizSelected === correct);
        var letters = ['A','B','C','D'];

        // Remember the outcome against the REAL question index so a later "retry the
        // ones I got wrong" run updates this question rather than appending a duplicate.
        quizResultMap[realIdx] = isOk;

        // Record answer for reporting payload — replace any earlier answer to the same
        // question so a retry reports the student's final answer, not both attempts.
        if (!isBuilderPreviewMode) {
            var rec = {
                qidx:        realIdx,
                qtext:       (q && q.question ? q.question : '').slice(0, 255),
                selectedidx: quizSelected,
                correctidx:  correct,
                iscorrect:   isOk ? 1 : 0
            };
            var replaced = false;
            for (var ai = 0; ai < attemptAnswers.length; ai++) {
                if (attemptAnswers[ai].qidx === realIdx) { attemptAnswers[ai] = rec; replaced = true; break; }
            }
            if (!replaced) attemptAnswers.push(rec);
        }

        recalcQuizScore();
        if (isOk) { playQuizCorrectSound(); }
        else       { playQuizIncorrectSound(); }

        // Style option cards
        var opts = document.querySelectorAll('.pe-quiz-option');
        for (var i = 0; i < opts.length; i++) {
            opts[i].classList.add('pe-quiz-option--disabled');
            if (i === correct)                     opts[i].classList.add('pe-quiz-option--correct');
            else if (i === quizSelected && !isOk)  opts[i].classList.add('pe-quiz-option--incorrect');
        }

        // Show feedback panel
        var fb = document.getElementById('pe-quiz-feedback');
        if (fb) {
            var fbHtml;
            if (isOk) {
                fbHtml = '<div class="pe-quiz-fb pe-quiz-fb--correct">'
                    + '<span class="pe-quiz-fb-icon">' + icon('check') + '</span>'
                    + '<div class="pe-quiz-fb-body"><strong>Correct!</strong><br>'
                    + escHtml(q.explanation || '') + '</div></div>';
            } else {
                fbHtml = '<div class="pe-quiz-fb pe-quiz-fb--incorrect">'
                    + '<span class="pe-quiz-fb-icon">' + icon('alert') + '</span>'
                    + '<div class="pe-quiz-fb-body"><strong>The correct answer is&nbsp;' + (letters[correct] || String((correct || 0) + 1)) + '.</strong><br>'
                    + escHtml(q.explanation || '') + '</div></div>';
            }
            fb.innerHTML = fbHtml;
            fb.style.display = 'block';

            // Animate feedback in
            setTimeout(function() {
                var fbEl = document.getElementById('pe-quiz-feedback');
                if (fbEl) fbEl.classList.add('pe-quiz-feedback--visible');
            }, 10);

            // Speak explanation — if incorrect, re-enable Next only after speech ends
            var spokenPrefix = isOk ? 'Correct! ' : 'The correct answer is ' + (letters[correct] || String((correct || 0) + 1)) + '. ';
            speakQuizText(spokenPrefix + (q.explanation || ''), !isOk ? function() {
                var nbEl = document.getElementById('pe-quiz-next-btn');
                if (nbEl) nbEl.disabled = false;
            } : null);
            // FIX-NEXT-BTN-STRANDED: several TTS paths (stale generation id, prefetch
            // timeout) return without ever calling onEnd, which used to leave the student
            // stuck on the feedback screen with a permanently disabled Next button.
            // This safety net always re-enables it.
            if (!isOk) {
                clearQuizNextTimer();
                quizNextTimer = setTimeout(function() {
                    quizNextTimer = null;
                    var nbEl = document.getElementById('pe-quiz-next-btn');
                    if (nbEl) nbEl.disabled = false;
                }, 12000);
            }
            // FIX-QUIZ-NEXT-Q-AUDIO-DELAY: Pre-warm next question's TTS while student reads
            // feedback — 1.5 s delay lets speakQuizText consume the feedback cache first.
            // Follows quizOrder so a retry run pre-warms the next OUTSTANDING question.
            var _nextPos = quizCurrentQ + 1;
            if (_nextPos < quizOrder.length) {
                var _nextQ = quizQuestions[quizOrder[_nextPos]];
                var _nextQText = _nextQ ? (_nextQ.question || '') : '';
                if (_nextQText) {
                    setTimeout(function() { prefetchFeedbackTts(_nextQText); }, 1500);
                }
            }
        }

        // Swap buttons — for incorrect answers, Next stays disabled until voiceover ends
        var cb = document.getElementById('pe-quiz-check-btn');
        var nb = document.getElementById('pe-quiz-next-btn');
        if (cb) cb.style.display = 'none';
        if (nb) {
            nb.style.display = '';
            if (!isOk) nb.disabled = true;
        }
    }

    function advanceQuiz() {
        stopQuizAudio();
        clearQuizNextTimer();
        // quizCurrentQ walks quizOrder, which is the full question list on a normal run
        // and only the outstanding questions on a "retry incorrect" run.
        if (quizCurrentQ + 1 < quizOrder.length) {
            renderQuizQuestion(quizCurrentQ + 1);
        } else {
            showQuizResults();
        }
    }

    function showQuizResults() {
        var overlay = document.getElementById('pe-quiz-overlay');
        if (!overlay) return;
        recalcQuizScore();
        var total     = quizQuestions.length;
        var pct       = total ? Math.round((quizScore / total) * 100) : 0;
        var incorrect = total - quizScore;
        var isPerfect = (pct === 100);
        // FEAT-PASS-MARK-WIRED: everything celebratory below is gated on the teacher's
        // configured pass mark instead of the old hardcoded 60% / 80% literals.
        var passMark  = getQuizPassMark();
        var passed    = (pct >= passMark);
        quizPassed    = passed;
        var wrongIdx  = getWrongQuizIdx();

        // Report rich attempt data to server for completion tracking (fire-and-forget).
        if (!isBuilderPreviewMode) {
            // FIX-DWELL-INFLATION: finalise the last slide's dwell time ONCE, on the first
            // results screen of this sitting. slideEntryTime is not touched by the quiz
            // overlay, so recomputing it on a retry's results screen would charge the
            // final slide with the entire quiz + results-reading + retry duration, and
            // overwrite the honest first value.
            if (!quizAttemptSaved && slideEntryTime > 0 && lastSlideIdx >= 0) {
                var secsOnLast = Math.round((Date.now() - slideEntryTime) / 1000);
                var ls = manifest && manifest.slides && manifest.slides[lastSlideIdx];
                attemptSlideTimes[lastSlideIdx] = {
                    idx:   lastSlideIdx,
                    type:  ls ? (ls.type || ls.slideType || '') : '',
                    title: ls ? (ls.title || ls.productName || ls.conceptName || ('Slide ' + (lastSlideIdx + 1))) : ('Slide ' + (lastSlideIdx + 1)),
                    secs:  secsOnLast
                };
            }
            var totalTimeSecs = Math.round((Date.now() - attemptStartTime) / 1000);
            // FIX-DUPLICATE-SLIDETIMES: only the first save of a sitting carries the
            // per-slide dwell data. A retry produces a second attempt row, and re-sending
            // the identical slide times would double-count every slide in the teacher's
            // "average time per slide" chart.
            var slideTimesArr = quizAttemptSaved ? [] : Object.keys(attemptSlideTimes).map(function(k) {
                return attemptSlideTimes[k];
            });
            quizAttemptSaved = true;
            ajaxPost(
                cfg.ajaxUrl,
                { action: 'save_attempt', cmid: cfg.cmid, sesskey: cfg.sesskey },
                JSON.stringify({
                    score:         pct,
                    route:         manifest ? (manifest.mode || 'product') : 'product',
                    slidecount:    manifest && manifest.slides ? manifest.slides.length : 0,
                    questioncount: quizQuestions.length,
                    timetaken:     totalTimeSecs,
                    slidetimes:    slideTimesArr,
                    answers:       attemptAnswers
                }),
                function() {},
                function() {}
            );
        }

        if (passed) playQuizFanfare();

        // Ring: r=54, circumference ≈ 339
        var circ   = 339;
        var offset = circ - (circ * pct / 100);

        var tier, title, message;
        if (isPerfect) {
            tier='perfect';    title='Perfect Score!';
            message='Outstanding! You\'ve mastered this content completely.';
        } else if (passed) {
            tier='excellent';  title='Passed!';
            message='You scored ' + pct + '%, above the ' + passMark + '% pass mark. Review any gaps in the slides.';
        } else if (incorrect === 1) {
            tier='needs-work'; title='So Close!';
            message='You scored ' + pct + '%, just under the ' + passMark + '% pass mark. Retry the one question you missed.';
        } else {
            tier='needs-work'; title='Not Quite Yet';
            message='You scored ' + pct + '%. You need ' + passMark + '% to pass — retry the ' + incorrect + ' questions you missed, or review the slides first.';
        }

        var gradId = isPerfect ? 'peGradPerfect' : 'peGradScore';
        var gradStop = isPerfect
            ? '<stop offset="0%" style="stop-color:#f59e0b"/><stop offset="50%" style="stop-color:#ef4444"/><stop offset="100%" style="stop-color:#8b5cf6"/>'
            : '<stop offset="0%" style="stop-color:#667eea"/><stop offset="100%" style="stop-color:#764ba2"/>';

        var html = '';
        html += '<div class="pe-quiz-confetti-wrap" id="pe-quiz-confetti-wrap"></div>';
        html += '<div class="pe-quiz-results-card">';
        html += '<div class="pe-quiz-results-badge">' + icon('check') + 'Quiz Complete</div>';

        // SVG ring
        html += '<div class="pe-quiz-ring">';
        html += '<svg viewBox="0 0 120 120" width="130" height="130">';
        html += '<defs><linearGradient id="' + gradId + '" x1="0%" y1="0%" x2="100%" y2="100%">' + gradStop + '</linearGradient></defs>';
        html += '<circle class="pe-quiz-ring-bg" cx="60" cy="60" r="54"/>';
        html += '<circle class="pe-quiz-ring-fill pe-quiz-ring-' + tier + '" cx="60" cy="60" r="54"'
            + ' stroke="url(#' + gradId + ')" data-offset="' + offset + '"/>';
        html += '</svg>';
        html += '<div class="pe-quiz-ring-center">';
        html += '<span class="pe-quiz-ring-pct pe-quiz-ring-pct--' + tier + '" data-target="' + pct + '">0%</span>';
        html += '</div></div>';

        html += '<h3 class="pe-quiz-results-title">' + escHtml(title) + '</h3>';
        html += '<p class="pe-quiz-results-msg">' + escHtml(message) + '</p>';

        html += '<div class="pe-quiz-stats">';
        html += '<div class="pe-quiz-stat"><div class="pe-quiz-stat-val pe-quiz-stat-correct">' + quizScore + '</div><div class="pe-quiz-stat-lbl">Correct</div></div>';
        html += '<div class="pe-quiz-stat"><div class="pe-quiz-stat-val pe-quiz-stat-incorrect">' + incorrect + '</div><div class="pe-quiz-stat-lbl">Incorrect</div></div>';
        html += '<div class="pe-quiz-stat"><div class="pe-quiz-stat-val">' + total + '</div><div class="pe-quiz-stat-lbl">Questions</div></div>';
        html += '</div>';

        html += '<p class="pe-quiz-passmark-note">Pass mark: <strong>' + passMark + '%</strong></p>';

        html += '<div class="pe-quiz-results-actions">';
        // FEAT-QUIZ-RETRY-WRONG: primary action is to re-answer only the outstanding
        // questions; a full retake is still available as a secondary option.
        if (wrongIdx.length > 0) {
            html += '<button class="pe-quiz-retry-wrong-btn" id="pe-quiz-retry-wrong-btn">' + icon('zap')
                + 'Retry ' + wrongIdx.length + ' incorrect question' + (wrongIdx.length === 1 ? '' : 's') + '</button>';
        }
        html += '<button class="pe-quiz-retake-btn" id="pe-quiz-retake-btn">' + icon('zap') + 'Retake Whole Quiz</button>';
        html += '<button class="pe-quiz-back-btn" id="pe-quiz-back-btn">' + icon('chevL') + 'Back to Slides</button>';
        // Certificate is only offered once the student has actually passed.
        if (cfg.enableCertificate && passed) {
            html += '<button class="pe-quiz-cert-btn" id="pe-quiz-cert-btn">' + icon('award') + 'View Certificate</button>';
        }
        html += '</div>';
        html += '</div>'; // results-card

        overlay.innerHTML = html;

        // FEAT-PASS-MARK-WIRED: confetti only for a genuine pass. Previously this fired
        // at a hardcoded 60%, so a student who failed a 100%-pass-mark quiz still got a
        // celebration.
        var confWrap = document.getElementById('pe-quiz-confetti-wrap');
        if (confWrap && passed) launchQuizConfetti(confWrap);

        // Animate ring fill + percent counter
        setTimeout(function() {
            var ringFill = document.querySelector('.pe-quiz-ring-fill');
            var pctEl    = document.querySelector('.pe-quiz-ring-pct');
            if (ringFill) ringFill.style.strokeDashoffset = offset;
            if (pctEl) {
                var target   = parseInt(pctEl.getAttribute('data-target'), 10);
                var duration = 1200;
                var startTs  = null;
                function animCount(ts) {
                    if (!startTs) startTs = ts;
                    var elapsed  = ts - startTs;
                    var progress = Math.min(elapsed / duration, 1);
                    var eased    = 1 - Math.pow(1 - progress, 3);
                    pctEl.textContent = Math.round(eased * target) + '%';
                    if (progress < 1) requestAnimationFrame(animCount);
                }
                requestAnimationFrame(animCount);
            }
        }, 60);

        // Bind action buttons
        var retake = document.getElementById('pe-quiz-retake-btn');
        var back   = document.getElementById('pe-quiz-back-btn');
        // Wrapped, not passed directly: addEventListener would hand showQuiz the click
        // event as its retryWrongOnly argument, which is truthy.
        if (retake) retake.addEventListener('click', function() { showQuiz(false); });
        var retryWrong = document.getElementById('pe-quiz-retry-wrong-btn');
        if (retryWrong) retryWrong.addEventListener('click', function() { showQuiz(true); });
        if (back)   back.addEventListener('click', function() {
            stopQuizAudio();
            var o = document.getElementById('pe-quiz-overlay');
            if (o) o.style.display = 'none';
            // FIX-BACK-TO-SLIDES-FIRST: navigate to slide 0 so student
            // always returns to the beginning, not the last slide they saw.
            currentSlide = 0;
            var totalSlides = manifest && manifest.slides ? manifest.slides.length : 1;
            showSlide(currentSlide, totalSlides, false);
        });
        var certQuizBtn = document.getElementById('pe-quiz-cert-btn');
        if (certQuizBtn) certQuizBtn.addEventListener('click', showCertificate);
    }

    function showCertificate() {
        if (!cfg.enableCertificate || isBuilderPreviewMode) return;
        // FEAT-PASS-MARK-WIRED: when the activity has a quiz, the certificate is only
        // available to a student who has met the pass mark. Previously showCertificate()
        // checked only enableCertificate, so a 0% score could still print a certificate.
        if (quizQuestions.length > 0 && !quizPassed) return;

        // Re-show if already built
        var existing = document.getElementById('pe-cert-overlay');
        if (existing) { existing.style.display = ''; return; }

        var accentColor = cfg.accentColor || '#3b82f6';
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        var now = new Date();
        var dateStr = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();

        var logoHtml = '';
        if (cfg.siteLogoUrl) {
            logoHtml = '<img class="pe-cert-logo-img" src="' + escHtml(cfg.siteLogoUrl) + '" alt="' + escHtml(cfg.siteName || '') + '">';
        } else {
            logoHtml = '<div class="pe-cert-logo-text">' + escHtml(cfg.siteName || 'AI Grader') + '</div>';
        }

        var cpdHtml = '';
        var pts = parseInt(cfg.cpdPoints, 10);
        if (pts > 0) {
            cpdHtml = '<div class="pe-cert-cpd">'
                + '<div class="pe-cert-cpd-badge">'
                + '<div class="pe-cert-cpd-num">' + pts + '</div>'
                + '<div class="pe-cert-cpd-label">CPD Points</div>'
                + '</div></div>';
        }

        var dlBtnHtml = '';
        if (cfg.certificatePdf) {
            dlBtnHtml = '<button class="pe-cert-download-btn" id="pe-cert-download-btn">'
                + icon('download') + 'Download PDF</button>';
        }

        // Award seal SVG — concentric rings with a checkmark
        var sealSvg = '<svg class="pe-cert-seal" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
            + '<circle cx="40" cy="40" r="37" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3.5 4.5" opacity="0.35"/>'
            + '<circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>'
            + '<circle cx="40" cy="40" r="28" fill="currentColor" opacity="0.1"/>'
            + '<circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" stroke-width="1" opacity="0.45"/>'
            + '<path d="M28 40l8 9 16-18" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>'
            + '</svg>';

        var overlay = document.createElement('div');
        overlay.id = 'pe-cert-overlay';
        overlay.className = 'pe-cert-overlay';

        var h = '';
        h += '<div class="pe-cert-backdrop" id="pe-cert-backdrop"></div>';
        h += '<div class="pe-cert-modal" role="dialog" aria-modal="true" aria-label="Certificate of Completion">';
        h += '<button class="pe-cert-close-btn" id="pe-cert-close-btn" aria-label="Close">&#x2715;</button>';
        h += '<div class="pe-cert-card" id="pe-cert-card" style="--pe-cert-accent:' + escHtml(accentColor) + '">';
        // Dot pattern background
        h += '<div class="pe-cert-bg-pattern" aria-hidden="true"></div>';
        // Top accent band
        h += '<div class="pe-cert-top-band"></div>';
        h += '<div class="pe-cert-inner">';
        // Inner decorative frame
        h += '<div class="pe-cert-frame">';
        // Header: title left | seal centre | logo right
        h += '<div class="pe-cert-header">';
        h += '<div class="pe-cert-header-left">';
        h += '<div class="pe-cert-of-completion">Certificate of Completion</div>';
        if (cfg.siteName) h += '<div class="pe-cert-site-name">' + escHtml(cfg.siteName) + '</div>';
        h += '</div>';
        h += '<div class="pe-cert-header-center">' + sealSvg + '</div>';
        h += '<div class="pe-cert-header-right">' + logoHtml + '</div>';
        h += '</div>';
        h += '<div class="pe-cert-divider"></div>';
        // Body
        h += '<div class="pe-cert-body">';
        h += '<p class="pe-cert-this-certifies">This certifies that</p>';
        h += '<h2 class="pe-cert-name">' + escHtml(cfg.studentName || 'Student') + '</h2>';
        h += '<p class="pe-cert-completed-text">has successfully completed</p>';
        h += '<h3 class="pe-cert-activity-name">' + escHtml(cfg.activityName || '') + '</h3>';
        h += cpdHtml;
        h += '<p class="pe-cert-date">Issued ' + escHtml(dateStr) + '</p>';
        h += '</div>';
        // Footer: sig line left, download right
        h += '<div class="pe-cert-footer-row">';
        h += '<div class="pe-cert-sig"><div class="pe-cert-sig-line"></div><div class="pe-cert-sig-label">Authorised by ' + escHtml(cfg.siteName || 'AI Grader') + '</div></div>';
        h += '<div class="pe-cert-footer-actions">' + dlBtnHtml + '</div>';
        h += '</div>';
        h += '</div>'; // pe-cert-frame
        h += '</div>'; // pe-cert-inner
        h += '<div class="pe-cert-bottom-band"></div>';
        h += '</div>'; // pe-cert-card
        h += '</div>'; // pe-cert-modal

        overlay.innerHTML = h;
        document.body.appendChild(overlay);

        var closeFunc = function() { overlay.style.display = 'none'; };
        var closeBtnEl = document.getElementById('pe-cert-close-btn');
        var backdropEl = document.getElementById('pe-cert-backdrop');
        if (closeBtnEl) closeBtnEl.addEventListener('click', closeFunc);
        if (backdropEl) backdropEl.addEventListener('click', closeFunc);

        var dlBtn = document.getElementById('pe-cert-download-btn');
        if (dlBtn) dlBtn.addEventListener('click', function() {
            overlay.classList.add('pe-cert-printing');
            window.print();
            overlay.classList.remove('pe-cert-printing');
        });

        certificateShown = true;
    }

    return { init: init };
});
/* jshint ignore:end */
