# Changelog

All notable changes to **AI Slide Flow** (`mod_productexplainer`) are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions correspond to `$plugin->release` in `version.php`.

---

## [1.0.109] - 2026-09-09

Release-pipeline compliance. No functional or schema changes.

### Fixed

- **`index.php` now calls `require_login($course)`** instead of `require_course_login($course)`.
  The latter delegates to `require_login()` internally but also admits guests and
  not-logged-in users on courses that allow guest access, which is wrong for a page listing
  a course's activities. `mod/assign` and `mod/quiz` use `require_login($course)` on their
  index pages for the same reason.
- Language string `cpdpoints` reworded to "Continuing professional development (CPD) points"
  so the value does not lead with a bare all-caps token.
- `classes/local/exporter.php`: replaced an `array_filter()` call whose first argument sat on
  the opening-parenthesis line with an explicit loop.
- `mod_form.php`: the `/* fall through */` inline comment in a catch block is now a proper
  sentence-cased comment.

---

## [1.0.108] - 2026-09-09

Packaging only. No functional, schema or behavioural changes.

### Added

- `CHANGELOG.md` — this file. The release pipeline requires it in the plugin ZIP.

### Changed

- Release history moved out of `version.php` into `CHANGELOG.md`. `version.php` had grown to
  29 KB, almost all of it embedded comment history, with a 1,286-character `$plugin->release`
  string. It is now 1.2 KB containing only the five metadata assignments.

---

## [1.0.107] - 2026-09-09

Verified against real Moodle 4.5.13+ and 5.2.2+ installations (PostgreSQL 16, PHP 8.3 and 8.4).
No database schema changes.

### Fixed

- **Report page title.** `report.php` built its title with `'\u2014'` inside single quotes, which
  PHP does not interpret as an escape, so the browser tab read `Activity \u2014 Reports`. Now uses
  a language string.
- **Export filenames.** `filename_base()` ran `clean_filename()` on `format_string()` output, which
  is HTML-escaped, so an activity named `Q&A Widgets` downloaded as `Qamp_A_Widgets`. Entities are
  now decoded before sanitising.

---

## [1.0.106] - 2026-09-09

Corrections found while reviewing the 1.0.105 changes. No database schema changes.

### Fixed

- **Quiz progress destroyed by keyboard or swipe navigation.** The global `keydown` handler and the
  touch-swipe handler stayed active while the quiz overlay was open, re-entering `showQuiz()` and
  restarting the quiz from question one. With the retry feature this also wiped the results of the
  preceding run. Slide navigation is now inert while the quiz is open.
- **Stale pass state after a retake.** `quizPassed` was not reset when a new full run started,
  leaving the certificate gate open for the duration of that run.
- **Duplicated analytics on retry.** Each results screen re-sent the identical per-slide dwell data,
  double-counting every slide in the teacher's report. Slide times are now sent only with the first
  attempt of a sitting.
- **Inflated dwell time.** The final slide's dwell time was recomputed from a stale `slideEntryTime`
  on every results screen, charging that slide with the entire quiz and retry duration.
- **Stale "unstick Next" timer.** The 12-second safety timer was keyed to a button id reused by every
  question, so a leftover timer could enable Next on a later question before its feedback had played.
- **Export crash on a malformed manifest.** `has_content()` used `!empty()`, which passes for a
  scalar, after which `count()` raised a `TypeError` mid-download. All readers now go through guarded
  accessors.
- **HTML entities in exports.** `format_string()` escapes for HTML, so an activity named `Q&A "X"`
  exported as `Q&amp;A &quot;X&quot;` inside a `.txt` file.
- **Recursion guard defeated.** The `MAX_DEPTH` limit in the export walker reset to zero on every hop
  through a list, so it never fired.
- `gzdecode()` warning on a corrupt manifest could be echoed before `send_file()` set its headers,
  corrupting the download.
- `index.php` did not load the plugin stylesheet, so the bulk export block rendered unstyled.

### Changed

- Reverted an incorrect change to `index.php` from 1.0.105: Moodle's `notice()` already detects a
  printed header, so there was never a doubled page header. The activity list heading was restored.

---

## [1.0.105] - 2026-09-09

### Added

- **Content export.** New `export.php` and `classes/local/exporter.php` download all generated slide
  text, narration scripts, AI image prompts, image URLs and quiz questions with the answer key, as
  plain text, Markdown or JSON. Links appear on the activity page for teachers; `index.php` gains a
  course-wide bulk export producing either one combined file or a zip with one file per activity.
  Requires the manage capability. The renderer walks the manifest generically, so new slide types and
  fields export without a code change.

---

## [1.0.104] - 2026-09-09

No database schema changes.

### Fixed

- **Quiz question count was ignored.** The builder sent the teacher's chosen count as `quizCount`,
  but `ajax.php` never read it and never forwarded it to the generator, so the AI always returned its
  own default. `generate_slides` and `generate_concept` now read, clamp (1-10) and forward it.
  Note: the generation endpoint must also honour `quizCount` for this to take full effect.
- **Pass mark was not wired up.** `completionQuizPct` was passed to the player and never read. The
  pass mark was hardcoded — confetti at 60%, fanfare and result tier at 80%, the splash screen always
  showing "80% To Pass" — and the certificate was offered at any score. A single `getQuizPassMark()`
  now drives all of them, using the teacher's `completionquizpercent` when the quiz completion rule
  is enabled and 80% otherwise.
- Quiz progress bar never reached 100% on the final question.
- A fifth or later answer option rendered the letter `undefined`.
- The Next button could be left permanently disabled when a TTS callback never fired.

### Added

- **Retry incorrect questions.** The results screen offers "Retry N incorrect question(s)" alongside
  the full retake. A retry re-presents only the questions not yet answered correctly and lifts the
  score for the whole quiz.

---

## [1.0.70] - [1.0.103]

Consolidated notes carried over from `version.php`.

### FIX-13DIGIT-SAVEPOINT-REBASE

release rebuilt from repo db/upgrade.php with all gates/savepoints on 10-digit values <=
$plugin->version; the previously served ZIP still carried legacy 13-digit savepoints that would
silently re-strand rebased sites on the next upgrade. No schema/PHP-logic/JS changes. // ADD-
BACKUP-RESTORE: Added full Moodle backup/restore support (backup/moodle2/). Fixes stuck progress
and missing activity data when a teacher copies or deletes the activity. Backs up manifest JSON
and all settings; optionally backs up attempts, slide times and quiz answers when "Include user
data" is selected. No DB schema changes. Savepoint 2026072200098. (v1.0.97): Removed empty-string
DEFAULT from NOTNULL CHAR fields in install.xml (route, slidetype, slidetitle, qtext). Fixes XMLDB
debugging warnings on Moodle sites running local_adminer. // VERSION-TRACKING-FIX: Formal bump to
surface quiz-voice fixes in the plugin directory. v1.0.92 shipped FIX-QUIZ-VOICE-BROKEN
(doChirpHdAjax helper, wait-loop calls Chirp HD on wrong-prefetch) and FIX-QUIZ-VOICE-CONSISTENCY
(manifest.voiceStyle saved at generation; speakQuizText/prefetchFeedbackTts read
manifest.voiceStyle so quiz always matches slide voice) in the same release without incrementing.
No code changes.

### FIX-QUIZ-VOICE-CONSISTENCY

Quiz narration now uses the same voice selected in the voiceover panel. Root cause:
speakQuizText() and prefetchFeedbackTts() were using cfg.voiceStyle (the PHP activity setting)
instead of the voice the teacher chose when generating slide voiceovers. When a teacher generated
voiceovers with Aoede but the activity voiceStyle setting defaulted to Zephyr, quiz narration
played in a different voice than the slides — inconsistent student experience. Fix:
handleGenerateAllVoiceovers() now saves manifest.voiceStyle at the start of generation
(manifest.voiceStyle = selectedVoiceStyle || cfg.voiceStyle || 'Zephyr'). Both
prefetchFeedbackTts() and speakQuizText() now read (manifest && manifest.voiceStyle) ||
cfg.voiceStyle || 'Zephyr', so quiz TTS always matches the voice used for slide voiceovers. Web
app: SlideFlowStudio.tsx handleVoiceover() voice corrected from invalid 'en-AU-Chirp3-HD-Aoife' to
valid 'en-AU-Chirp3-HD-Aoede'. All three AMD files (amd/src/player.js, amd/build/player.js,
amd/build/player.min.js) updated and synced. No PHP, no DB schema changes.

### FIX-TESTER-FEEDBACK-V7

(1) FIX-MUSTWATCH-LABEL-LIGHT-BG: pe-add-video-mustwatch-label color changed from #e2e8f0
(invisible on the light #f9fafb add-slide panel background) to #374151 (clearly readable dark
text). pe-edit-video-mustwatch-label retains #e2e8f0 since the edit panel background is dark
#1e1b4b. (2) FIX-IMAGE-ASPECT-RATIO: pe-image-slide-img-wrap img changed from object-fit:cover
(crops image) to object-fit:contain with width/height:auto so the uploaded image is shown in full
without cropping or distortion. pe-slide-image-col img (AI image column in builder) also changed
to object-fit:contain. buildImageColInner() style updated to match. (3) FIX-BACK-TO-SLIDES-FIRST:
pe-quiz-back-btn click handler now resets currentSlide=0 and calls showSlide() after hiding the
quiz overlay, so "Back to Slides" always returns the student to Slide 1 instead of the last slide
they were on before the quiz. Applies to both product slides and concept slides.

### FIX-TESTER-FEEDBACK-V6

(1) FIX-IMAGE-BTN-LAYOUT: pe-custom-slide-actions changed from flex-row to flex-column so Remove
Image/Upload Image/Remove Slide stack vertically — eliminates misalignment reported on image
slides. (2) FIX-IMAGE-BTN-COLORS: Remove Image button is now gray (#374151) so only Remove Slide
is red — visual distinction between clearing an image vs deleting the whole slide. (3) FIX-VIDEO-
FRAME-PADDING: pe-video-slide-inner changed from flex-start + padding-top:24px to center +
padding:5% so the video frame has equal spacing on all four sides. (4) FIX-IMAGE-OBJECT-COVER: pe-
image-slide-img-wrap img changed from object-fit:contain to object-fit:cover so the uploaded image
fills the frame naturally. (5) FIX-IMAGE-SLIDE-TITLE: Added .pe-image-slide-inner .pe-slide-title
override (color:#94a3b8, opacity:1) so the slide label is clearly readable on the dark image-slide
background. (6) FIX-QUIZ-Q0-AUDIO-DELAY: prefetchFeedbackTts(Q0.question) called at end of
renderQuizSplash() — by the time the student clicks Start Quiz, Q0 narration is already cached and
plays instantly. (7) FIX-QUIZ-NEXT-Q-AUDIO-DELAY: checkQuizAnswer() schedules
prefetchFeedbackTts(Q[n+1].question) 1.5 s after feedback starts, so next question narration is
pre-downloaded during the feedback reading window. All CSS and JS fixes apply equally to product
slides and concept slides.

### FIX-TESTER-FEEDBACK-V5

(1) FIX-MUST-WATCH-NEXT-LOCKED: YouTube postMessage subscription message sent on slide entry so
infoDelivery events fire correctly; origin check extended to youtube-nocookie.com; loose == for
playerState catches string "0". (2) FIX-MUST-WATCH-CONTROLS: controls=0 added to embed URL for
must-watch videos so students cannot seek to end. (3) FIX-VIDEO-TITLE-CONTRAST: pe-video-slide-
inner .pe-slide-title override — color #94a3b8 opacity:1 so title is readable on dark background.
(4) FIX-MUSTWATCH-LABEL-CONTRAST: mustwatch label color #c7d2fe → #e2e8f0 for better readability.

### FIX-VIDEO-TITLE-VISIBLE

Added labelled headings to Moodle builder edit panel (YouTube URL / Slide title labels) so both
inputs are clearly visible. Web app: scrollIntoView on panel open + removed autoFocus from URL
input so title input is never hidden below fold.

### FIX-VIDEO-EDIT-PREPOPULATE

Edit panel now always shown (pre-populated) when navigating to a video slide in builder mode —
removed toggle/display:none, removed "Edit video" button. Cancel button still hides panel. Same
fix applied to SlideFlowStudio web app (useEffect auto-populates on slide navigation).

### FIX-UPLOAD-CURSOR

Added cursor:pointer!important to .pe-slide-img-upload-btn, its hidden input[type="file"], and
.pe-custom-upload-label so Moodle theme stylesheets cannot override the pointer cursor on upload
buttons.

### FIX-SLIDE-TITLE-CLIP

Added line-height:1.5 and padding-bottom:2px to .pe-slide-title to prevent text being clipped at
the bottom by overflow:hidden.

### FEAT-MUST-WATCH-VIDEO

Video slides now support a "Must watch whole video" gate. When mustWatchVideo=true on a pe-video-
slide, the Next button is disabled until YouTube fires an onStateChange=0 (ended) postMessage
event via enablejsapi=1. New pe-must-watch-banner element shown below the iframe with lock icon +
"Watch the full video to continue" message; banner hides once video ends. canAdvanceFromSlide()
blocks navigation independently of the voiceover gate. showSlide() also disables the next button
visually when entering a must-watch slide. ytMsgListenerBound flag prevents duplicate
window.message listeners across player re-renders. SlideFlowStudio web app: adds "Must watch whole
video before advancing" checkbox to the Add Video Slide form; stores mustWatchVideo in manifest
and shows an amber "Must watch" badge overlay on the video slide preview. Server: mustWatchVideo
field added to replace-slide and add-slide API schemas and saved in manifest JSON. Homepage and
docs updated.

### FIX-TESTER-FEEDBACK-V4

Three fixes. (1) FIX-HEADING-CONSISTENCY: Video and image custom slides now display "Slide X •
Title" heading identical to all other slide types (was showing title-only with no slide number, or
no heading at all). (2) FIX-VIDEO-REMOVE-BTN: "Remove Slide" button on video slides wrapped in pe-
custom-slide-actions flex container so it renders visibly and aligned, same as image slides. (3)
FIX-IMAGE-BTN-ORDER: Image slides now show buttons in requested order — Remove Image (only when
image is present, clears imageUrl) → Upload Image → Remove Slide. "Remove Image" uses new data-
action="remove-custom-image" which clears imageUrl without deleting the slide.

### FIX-TESTER-FEEDBACK-V3

Six fixes. (1) INSERT-AT-POSITION: Video and image slides now insert immediately after the current
slide (splice at currentSlide+1) instead of appending at the end. pendingImageUploads indices are
shifted up correctly. (2) AUTO-IMAGE-PREVIEW: When a teacher selects an image file in the Add
Image Slide form before clicking Add, the image now shows immediately in the new slide (blob URL
preview via handleSlideImageUpload) without requiring a second upload click. (3) REMOVE-SLIDE-
BUTTON-STYLE: pe-custom-slide-delete-btn redesigned — solid #ef4444 red background, white text and
white SVG icon, border:none, border-radius:4px, subtle hover (darkens to #dc2626). No more semi-
transparent pink style. (4) BUTTON-ALIGNMENT: pe-custom-upload-label now has identical
padding/height/border-radius/style as the delete button (dark #374151 background, white text/icon,
same 7px 14px padding, border-radius:4px). Both sit inside pe-custom-slide-actions flex row with
gap:8px, margin-top:0 override removes the old button-level spacing that caused misalignment. (5)
QUIZ-FEEDBACK-AUDIO-DELAY: Added prefetchFeedbackTts() function that starts Chirp HD TTS AJAX
immediately when the student selects an answer option (onQuizOptionClick). The generated Audio
object is cached in prefetchQuizAudio{text,audio,url}. speakQuizText() checks this cache first —
if the correct text is ready it plays instantly, eliminating the 1-3 sec delay between clicking
Check and hearing feedback. Falls back to normal AJAX path if pre-fetch is still in-flight or
failed. (6) SAME-FIX-FOR-CONCEPT-SLIDES: All concept slide quizzes use the same
renderQuizQuestion/onQuizOptionClick/checkQuizAnswer path, so the pre-fetch fix applies equally.

---

## [1.0.69] - Add Video and Image slides

FEAT-ADD-SLIDE: Add Video Slide and Add Image Slide buttons in builder mode. New pe-video-slide
(YouTube embed) and pe-image-slide (upload) types stored in manifest JSON. Builder shows dashed "+
Add a slide" panel between player preview and narration editor; each custom slide shows a "Remove
Slide" button in builder preview. FEAT-CPD-CERTIFICATE (v1.0.68) (v1.0.68): Completion certificate
feature. New mod_form.php settings: enablecertificate, cpdpoints, certificatepdf. view.php passes
studentName, activityName, siteName, siteLogoUrl, enableCertificate, cpdPoints, certificatePdf to
AMD init. player.js: showCertificate() builds a beautiful landscape certificate modal with accent
colour top/bottom bands, site logo, student name, activity name, CPD points badge, and date.
Certificate button appears in footer on last slide (no-quiz) or as "View Certificate" in quiz
results screen. PDF download via window.print() + @media print CSS. DB: 3 new fields
(enablecertificate, cpdpoints, certificatepdf). upgrade.php savepoint 2026061700068. FIX-PE-PLAY-
BTN-SIZE (v1.0.67): Reduced pe-audio-btn from 52×52px to 36×36px and SVG icon from 26×26px to
16×16px. Button was visually oversized relative to the footer row. CSS-only. No AMD or PHP
changes.

## [1.0.66] - Tester feedback, round 2

FIX-TESTER-FEEDBACK-ROUND2 — three root causes fixed after second tester review. (1) VOICEOVER-
CONSISTENCY: buildVoiceoverText() previously applied a 25-word threshold, causing some slides to
use AI voiceoverText and others to fall through to the content-based fallback — producing two
different reading styles unpredictably. Fix: threshold removed entirely. voiceoverText is now used
whenever it is non-empty and does not begin with a generic welcome phrase. Both paths now behave
identically for all slides, eliminating the "sometimes reads exact text, sometimes adds extra
words" inconsistency and the "some slides read headings, others skip them" heading issue. (2)
PRODUCT-SLIDE-DESIGN: All 15 product slide render functions redesigned to use the same visual
component system as concept slides: pe-cx-callout coloured callout boxes
(challenge/fix/stat/role/definition/protip/result), pe-cx-components + pe-cx-component icon cards,
pe-cx-steps + pe-cx-step numbered steps, pe-cx-body-text, pe-cx-concept-name. Old product-specific
elements (pe-benefit-card, pe-persona-card, pe-step-card, pe-what-how-grid, pe-talking-point, pe-
staff-tip, pe-explanation-box, pe-best-fit, pe-conversation-box, pe-objections-list, pe-personas-
grid, pe-benefits-grid) replaced. (3) CSS: .pe-cx-callout > div { flex:1; min-width:0 } added so
the inner content div fills remaining callout width correctly when a title+desc pattern is used.

## [1.0.65] - Seven tester-reported bugs

FIX-TESTER-FEEDBACK-7-ISSUES — seven tester-reported bugs fixed. (1) NAV-BTN-DARK-GREY: nav
buttons briefly turned dark grey on click due to Moodle Bootstrap applying its own :active
background. Fixed by removing background from CSS transition (was transitioning background which
caused a flash), adding overflow:hidden and -webkit-tap-highlight-color:transparent to .pe-nav-
btn, and adding higher-specificity .pe-player .pe-nav-btn:active rule that locks background to
rgba(255,255,255,0.92). Active state now shows a subtle scale(0.95) instead of a dark flash. (2)
PLAY-BTN-SIZE: play/pause SVG icons had hardcoded width="16" height="16" attributes that competed
with the CSS .pe-audio-btn svg { width:22px } rule. Removed the width/ height HTML attributes so
CSS controls size exclusively. Also enlarged .pe-audio-btn from 44px to 52px and icon from 22px to
26px for better tap target and visibility. (3) VOICEOVER-WELCOME-FILTER: buildVoiceoverText() used
to return any voiceoverText ≥40 words verbatim. Old AI prompts generated "Welcome to this training
on..." style openers that are not present on the slide. Now filters these generic intro phrases
and falls through to the content-based builder. Threshold also reduced 40→25 words. (4) VOICEOVER-
HEADINGS-ONLY: same threshold fix (40→25) ensures fewer slides fall through to the content-based
fallback, which previously triggered only for very short AI text. With the lower bar the AI
narration (correct slide content) is used in more cases. (5) REQUIRE-VOICEOVER-DEFAULT:
mod_form.php default for requirevoiceover changed from 0 (off) to 1 (on). New activities now
require students to listen to each slide's narration before advancing. Teachers can still disable
this in the activity settings. (6) AUTO-IMAGE-GENERATION: product route now calls
generateConceptImages() immediately after slide generation succeeds, auto-generating AI images for
any slide that has an imagePrompt field (concept slides already did this; product slides now
match). (7) IMAGE-COLUMN-UX: builder image column now shows "No image yet" label (instead of "No
image") when in builder mode, and buildRegenOverlay() is always rendered for builder slides
regardless of whether imageUrl is set — exposing Upload/Remove buttons even before a first image
is generated or uploaded.

## [1.0.36] - AI image must match slide content

FIX-IMAGE-PROMPT-SLIDE-MATCH — AI image must depict the slide's own content. Root cause:
imagePrompt rule 7 gave no instruction to base the image on slide text, producing generic stock-
photo workplace scenes unrelated to the slide content. Fix (1) Rule 7 rewritten: image MUST
directly depict the specific content/scenario described in that slide's own fields — derive
subject, characters, actions and setting from the slide text. Explicit bans: "busy office" filler,
handshake images. Fix (2) cx-introduction imagePrompt hint: base on whyItMatters + inYourRole
fields. Fix (3) cx-scenario imagePrompt hint: base on situation + whatHappened (exact scene). Fix
(4) cx-key-concept imagePrompt hint: depict a named component being performed. Fix (5) cx-real-
example imagePrompt hint: depict whatTheyDid + behaviours list. Fix (6) cx-common-mistake
imagePrompt hint: depict mistakeLabel + whatItLooksLike. Fix (7) cx-best-practice imagePrompt
hint: depict practiceTitle + steps in action. Fix (8) cx-summary imagePrompt hint: depict first
keyTakeaway as positive outcome.

## [1.0.35] - Voiceover must read the slide

FIX-VOICEOVER-SLIDE-MATCH — voiceover must read exactly what is on the slide. Root cause: AI
prompt said "70-90 word conversational narration as if a colleague is briefing you" — produced a
summary/interpretation, not a reading of the slide text. Fix (1) Product route system prompt rule
7: "read aloud every piece of text the student sees — title, every body field, label+value pairs,
bullets, steps in order — 90-130 words. Do NOT summarise or introduce new information." Fix (2)
Concept route system prompt rule 6: same instruction for all 7 cx-* slide types, covering
conceptName through commitmentPrompt — 90-140 words per slide. Fix (3) All 7 concept slide
voiceoverText schema hints updated to explicitly list every content field the narration must
cover, in render order. Fix (4) Product-overview voiceoverText hint updated to list
badge/productName/valueProp/ quickFacts explicitly. Fix (5) Token budget bumped: product route
8k→11k base; concept route 11k→14k. Fix (6) buildVoiceoverText fallback (all 3 AMD files: src +
build + build.min) extended to cover all cx-* content fields (tagline, whyItMatters, statOrFact,
inYourRole, scenarioTitle, situation, whatHappened, challenge, reflection, definition, components,
metaphor, contextSetting, whatTheyDid, behaviours, result, insight, mistakeLabel, whatItLooksLike,
whyItHappens, impacts, doThisInstead, practiceTitle, steps, keyTakeaways, reflectionQuestion,
commitmentPrompt) — previously concept slides fell back to title-only.

## [1.0.34] - Fullscreen layout and player size

FIX-FULLSCREEN-LAYOUT + FIX-NORMAL-PLAYER-SIZE (1) Fullscreen: .pe-slide-content-col gets justify-
content:center !important so slide content is vertically centred in 100vh instead of top-aligned
with whitespace below. overflow-y:auto retains scrollability for long slides. (2) Fullscreen:
explicit .pe-slide-image-col rules ensure flex-shrink:0 + overflow:hidden are always applied
regardless of Moodle Bootstrap interference. (3) Normal view: .pe-player max-width:860px removed
-> width:100% so the player fills the Moodle content column width instead of capping at 860px on
wide themes. (4) .pe-app padding changed from 32px 0 -> 24px (adds horizontal breathing room so
the player card has consistent padding on all sides inside the Moodle page).

## [1.0.33] - Fullscreen button

FIX-FULLSCREEN-BTN — comprehensive Moodle Bootstrap resistance for fullscreen button: (1) SVG:
stroke="currentColor" -> stroke="#374151" in markup (colour no longer inherited). (2) CSS: all
.pe-fullscreen-btn properties now !important (display/flex/bg/color/size/padding). (3) CSS:
explicit hover/focus/active + SVG sub-rules with !important for fullscreen button. (4) CSS:
fullscreen-mode (:fullscreen / :-webkit-full-screen) scoped rules for both the fullscreen button
AND nav buttons, including hover states. (5) font-size:0 on button prevents text-rendering
artifacts; flex+align-items centres icon.

## [1.0.32] - Nav chevron size

FIX-NAV-CHEVRON-SIZE — add width="18" height="18" directly to chevL/chevR SVG markup so Moodle
cannot override the icon size via CSS; also bump stroke-width to 2.5 for better visual weight.
Same change in src, build, and build.min.

## [1.0.31] - Nav button hover

FIX-NAV-BTN-HOVER — lock SVG stroke to #374151 on nav button hover/focus/active via explicit .pe-
nav-btn:hover svg { stroke: #374151 !important; fill: none !important } to prevent Moodle
Bootstrap overriding the icon colour with white-on-white.

## [1.0.30] - Last-slide navigation

FIX-LAST-SLIDE-NAV — hide next arrow on final slide (was only disabled, now display:none).

## [1.0.29] - Reporting module

REPORTING-MODULE — World-class self-contained analytics dashboard. New DB tables:
productexplainer_slidetimes (per-slide dwell time per attempt), productexplainer_answers (per-
question right/wrong per attempt). Extended productexplainer_attempts: timetaken, route,
slidecount, questioncount. New AJAX: save_attempt (replaces save_quiz_score), get_report_data
(teacher-only). New report.php + report.js AMD: KPI cards, pure-SVG bar/horiz-bar/donut/line
charts, Class Overview + Individual Student tabs, CSV export for each tab. player.js: slide-time
tracking + per-answer capture, one atomic JSON payload on complete. view.php: View Reports link
for teachers when content is locked.

## [1.0.28] - CSS class mismatches

CSS-WORLD-CLASS — Fixed 15 CSS class mismatches causing the plugin to render completely unstyled.
Root causes: (1) SVG icons had no stroke/fill CSS so defaulted to solid black filled blobs; (2)
builder form used .pe-label/.pe-input/.pe-textarea but CSS only defined .pe-form-label/.pe-form-
input (scoped to .pe-concept-builder); (3) .pe-route-card-title/.pe-route-card-desc/.pe-route-
card-list had zero CSS (CSS targeted .pe-route-card h3 / p which don't exist in DOM); (4) .pe-
builder-header had no flex so icon+title stacked vertically with no layout; (5) .pe-route-btn used
display:inline-block breaking the flex icon+text layout; (6) .pe-actions-row, .pe-save-bar, .pe-
divider had no CSS at all. All fixed. Added world-class gradient builder header, proper icon
containers, full form field system, route card feature lists, centred route-selection layout. No
DB schema changes. Savepoint 2026061300024.

## [1.0.23] - Renamed to AI Slide Flow

RENAME-AI-SLIDE-FLOW — plugin renamed from 'Slide Flow' to 'AI Slide Flow'.

## [1.0.22] - Player padding

FIX-PLAYER-PADDING — Added padding: 24px 0 to .pe-app container so the player card has vertical
breathing room within the Moodle page frame. No DB schema changes. Savepoint 2026061300022.

## [1.0.21] - Nav hover

FIX-NAV-HOVER — prev/next nav arrow buttons were showing a dark grey hover overlay from Moodle's
Bootstrap theme overriding the plugin's button styles. Fixed by adding !important to background,
background-color, color, border, opacity on .pe-nav-btn, .pe-nav-btn:hover/:focus/:active, and
.pe-nav-btn:disabled. Also reset appearance and padding to prevent Moodle theme interference. No
DB schema changes. Savepoint 2026061300021.

## [1.0.20] - Renamed to Slide Flow

RENAME — Plugin display name changed from "Product & Concept Explainer" to "Slide Flow". Activity
chooser shows "Slide Flow". Route cards renamed "Product Slides" / "Concept Slides". New icon
(slide frame + right-pointing flow arrow). All lang strings, builder titles, and button labels
updated. No DB schema changes. Savepoint 2026061300020.

## [1.0.19] - Knowledge-check quiz

QUIZ — 5-question MCQ knowledge check appended after last slide. Features: 4 card-select options
per question (2x2 grid), correct/incorrect Web Audio sounds, animated feedback panel with
explanation voiceover (Web Speech API), score ring with percent counter animation, confetti on
100%, retake + back-to-slides buttons. quizQuestions array added to both product-explainer and
concept-explainer generate prompts. Concept-explainer maxTokens raised to 11000. No DB changes.
Savepoint 2026061300019.

## [1.0.18] - Voiceover skip

FIX-VOICEOVER-SKIP — later slides (4-5) were producing very short TTS audio. Root cause:
pre-v1.0.13 manifests had no voiceoverText field; the buildVoiceoverText fallback only covered the
original 3 slide types. Slides 4-5 (who-for, how-recommend) fell through with only the slide title
(~3 words) sent to TTS. Fix: (a) buildVoiceoverText now requires voiceoverText to be ≥ 40 words
before using it; short AI text falls back to the richer content-based builder. (b) generate
endpoint maxTokens raised from 4 k to 8 k base so the AI has sufficient budget to write full 70-90
word voiceoverText for every slide.

## [1.0.17] - Dual route: product and concept

DUAL-ROUTE — renamed to "Product & Concept Explainer". (1) ROUTE-SELECTION-SCREEN: On first
create, teacher sees two option cards: "Product Explainer" (existing flow) and "Concept Explainer"
(new). (2) CONCEPT-EXPLAINER-MODE: 7 fixed slide types (cx-introduction, cx-scenario, cx-key-
concept, cx-real-example, cx-common-mistake, cx-best-practice, cx-summary). Inputs: concept name,
industry/context, target learner, learning objective, optional file upload and paste area. (3) AI-
GENERATED-IMAGES: Concept slides auto-generate one Imagen 4 Ultra image per slide (2 credits each)
after text content is generated (10 credits). Teachers may still override with their own uploaded
images. (4) NEW-SERVER-ENDPOINTS: /api/moodle/concept-explainer/generate (10 credits) and
/api/moodle/concept-explainer/generate-image (2 credits per image). (5) PLUGIN-RENAME: modulename
and pluginname lang strings updated. No DB schema changes. Savepoint 2026061300017.

