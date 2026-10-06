# AI Slide Flow (`mod_productexplainer`)

An activity module for Moodle that turns a product document or a workplace concept into a
narrated, interactive slide deck with an optional knowledge check and completion
certificate.

Teachers generate the content with AI, review and edit it in a built-in builder, then
publish it. Students work through the slides in a self-contained player with optional
voiceover narration. Teachers get a per-activity analytics dashboard and can export all
generated text for reuse elsewhere.

---

## Features

**Two authoring routes**

- **Product Slides** — upload or paste a product document and generate structured retail
  or sales training slides (overview, what/how, benefits, who it's for, objections,
  care, upsell, troubleshooting, staff tips and more).
- **Concept Slides** — teach any workplace concept through seven fixed, pedagogically
  ordered slides: introduction, scenario, key concept, real example, common mistake,
  best practice and summary.

**Content**

- AI-generated slide text, editable in the builder before publishing.
- AI-generated images per slide, or upload your own.
- Optional AI voiceover narration per slide, in 59 languages and 8 voices.
- Add your own YouTube video slides (with an optional "must watch in full" gate) and
  image slides anywhere in the deck.
- An optional multiple-choice knowledge check of 1–10 questions, with spoken feedback.

**For students**

- Keyboard, swipe and on-screen navigation, with a fullscreen mode.
- Optional requirement to listen to each slide's narration before advancing.
- A completion certificate showing the site logo, student name and CPD points.

**For teachers**

- An analytics dashboard: score distribution, per-question difficulty, average time per
  slide, a student leaderboard and per-student detail, with CSV export.
- A content export of every slide's text, narration script, AI image prompt and quiz
  question (including the answer key) as plain text, Markdown or JSON — per activity, or
  for every activity in a course at once.
- Activity completion on passing the knowledge check at a configurable threshold.

---

## Requirements

| | |
|---|---|
| Moodle | 4.0 (2022041900) or later. Tested against 4.5 LTS and 5.2. |
| PHP | 8.1 or later. Tested on 8.3 and 8.4. |
| Database | Any Moodle-supported database. Tested on PostgreSQL 16. |
| PHP extensions | `curl`, `zlib` (both standard in a Moodle install). |
| Account | An LMS-Labs account with available credits — see below. |

---

## External service and credits

This plugin **requires an external service** to generate content. It is not usable
offline or without an account.

Slide text, images and voiceover are produced by calling the AI Grader / LMS-Labs API at
`https://lms-labs.com`. When a teacher generates content, the request sends the site ID,
the API key and the teacher-supplied material (product name, pasted text, uploaded
document contents, or the concept details) to that service. No student personal data is
sent.

Generation consumes credits from the site's account:

| Action | Credits |
|---|---|
| Generate a Product Slides deck | Scales with deck size: 5 credits per 3 slides, so a 6-slide deck costs 10 and a 12-slide deck costs 20. |
| Generate a Concept Slides deck | 10 |
| AI image, per slide | 2 |
| Voiceover narration, per slide | 3 |
| Quiz question or feedback narration | 1 per utterance |

Students viewing or replaying published slides and narration cost nothing. Quiz narration
is generated on demand.

---

## Installation

1. Copy the plugin into your Moodle installation so that it sits at
   `mod/productexplainer` (on Moodle 5.x, `public/mod/productexplainer`).
2. Log in as an administrator and visit **Site administration → Notifications**, or run
   `php admin/cli/upgrade.php`, to complete the installation.
3. Configure the credentials below before teachers try to generate content.

Installing from a ZIP through **Site administration → Plugins → Install plugins** also
works.

---

## Configuration

Set the credentials at **Site administration → Plugins → Activity modules → AI Slide
Flow**:

- **Site ID** — your LMS-Labs site identifier.
- **API key** — your LMS-Labs API key.

If the `local_aiconfig` plugin is installed, its site ID and API key are used instead and
these settings can be left blank.

Per-activity settings (voice language and style, whether narration is required before
advancing, accent colour, slide transition, certificate and CPD points) are configured
when adding or editing an activity.

---

## Capabilities

| Capability | Default roles | Purpose |
|---|---|---|
| `mod/productexplainer:addinstance` | Editing teacher, Manager | Add the activity to a course. |
| `mod/productexplainer:view` | Guest, Student, Teacher, Editing teacher, Manager | View a published deck. |
| `mod/productexplainer:manage` | Teacher, Editing teacher, Manager | Generate and edit content, view reports, download the content export. |

The content export includes the quiz answer key and therefore requires
`mod/productexplainer:manage`.

---

## Data stored

The plugin stores, in addition to the activity's own settings and the generated slide
manifest:

- one row per quiz attempt, with the user ID, score, time taken and slide/question counts;
- the time each student spent on each slide, per attempt;
- each answer given, per attempt, with whether it was correct.

Generated images and voiceover audio are stored in the activity's Moodle file areas
(`slideimages` and `slidevoiceovers`).

Course backup and restore covers the activity settings and the generated slide manifest,
and — when "Include user data" is selected — the attempt, slide-time and answer records.

---

## Licence

GNU GPL v3 or later. See `LICENSE`.

Copyright 2026 AI Grader.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
