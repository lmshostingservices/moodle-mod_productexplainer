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

namespace mod_productexplainer\local;
require_once(__DIR__ . '/narration.php');

/**
 * Renders the generated slide and quiz content of an activity as downloadable text.
 *
 * The generated manifest is free-form JSON: every slide type carries its own set of
 * content fields, and the AI generator may add more over time. Rather than hardcoding a
 * renderer per slide type, this class walks the structure generically and humanises the
 * field names, so a new slide type or a new field exports correctly without a code change.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class exporter {
    /** @var int Maximum recursion depth when walking nested content structures. */
    const MAX_DEPTH = 6;

    /** @var string[] Slide keys handled by dedicated sections, so skipped by the generic walk. */
    const SKIP_KEYS = [
        'type', 'slideType', 'title', 'content', 'voiceoverText', 'imagePrompt',
        'imageUrl', 'noImage', 'isCustom', 'icon',
        'narrationMode', 'narrationOverride', 'narrationScript', 'generatedNarrationText',
        'narrationRequested', 'narrationOmitted', 'voiceoverUrl',
        'narrationBaselineText',
        'narrationGenerationFailed', 'generatedNarrationVoice', 'generatedNarrationLanguage',
    ];

    /** @var string[] Presentation-only keys stripped at any depth — they carry no content. */
    const NOISE_KEYS = ['icon', 'iconName', 'colour', 'color', 'className', 'cssClass'];

    /** @var \stdClass The activity record. */
    protected $pe;

    /** @var \stdClass The course record. */
    protected $course;

    /** @var array|null Decoded manifest, or null when the activity has no generated content. */
    protected $manifest;

    /**
     * Constructor.
     *
     * @param \stdClass $pe     The productexplainer activity record.
     * @param \stdClass $course The course the activity belongs to.
     */
    public function __construct(\stdClass $pe, \stdClass $course) {
        $this->pe = $pe;
        $this->course = $course;
        $this->manifest = self::decode_manifest($pe->manifestjson ?? '');
    }

    /**
     * Decode a stored manifest, transparently handling the "gz:" compressed form.
     *
     * @param  string $raw Raw manifestjson column value.
     * @return array|null  Decoded manifest array, or null when absent or unreadable.
     */
    public static function decode_manifest($raw) {
        if (empty($raw)) {
            return null;
        }
        if (strncmp($raw, 'gz:', 3) === 0) {
            $decoded = base64_decode(substr($raw, 3), true);
            if ($decoded === false) {
                return null;
            }
            // Suppressed: a truncated or non-gzip payload raises an E_WARNING, and on a
            // site with debug display on that warning is echoed before send_file() sets
            // its headers, corrupting the download. The false check below handles it.
            $raw = @gzdecode($decoded);
            if ($raw === false) {
                return null;
            }
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : null;
    }

    /**
     * The manifest's slides, guaranteed to be an array.
     *
     * A hand-edited or corrupted manifest can carry a scalar here; returning [] keeps the
     * renderers from calling count()/foreach on a string and fataling mid-download.
     *
     * @return array
     */
    protected function slides(): array {
        return isset($this->manifest['slides']) && is_array($this->manifest['slides'])
            ? $this->manifest['slides'] : [];
    }

    /**
     * The manifest's quiz questions, guaranteed to be an array.
     *
     * @return array
     */
    protected function questions(): array {
        return isset($this->manifest['quizQuestions']) && is_array($this->manifest['quizQuestions'])
            ? $this->manifest['quizQuestions'] : [];
    }

    /**
     * Whether this activity has any generated content to export.
     *
     * @return bool
     */
    public function has_content(): bool {
        return !empty($this->slides()) || !empty($this->questions());
    }

    /**
     * Number of slides in the manifest.
     *
     * @return int
     */
    public function slide_count(): int {
        return count($this->slides());
    }

    /**
     * Number of quiz questions in the manifest.
     *
     * @return int
     */
    public function question_count(): int {
        return count($this->questions());
    }

    /**
     * A filesystem-safe base name for this activity's export file (no extension).
     *
     * @return string
     */
    public function filename_base(): string {
        // Decode entities BEFORE sanitising: format_string() escapes, so an activity named
        // "Q&A Widgets" arrived here as "Q&amp;A Widgets" and produced the filename
        // "Qamp_A_Widgets" instead of "Q_A_Widgets".
        $name = clean_filename($this->plain($this->pe->name));
        $name = preg_replace('/[^A-Za-z0-9_\-]+/', '_', $name);
        $name = trim(preg_replace('/_+/', '_', $name), '_');
        if ($name === '') {
            $name = 'slideflow';
        }
        return $name . '_' . $this->pe->id;
    }

    // Public renderers.

    /**
     * Render the whole activity as plain text.
     *
     * @return string
     */
    public function to_text(): string {
        return $this->render(false);
    }

    /**
     * Render the whole activity as Markdown.
     *
     * @return string
     */
    public function to_markdown(): string {
        return $this->render(true);
    }

    /**
     * Render the whole activity as a normalised data structure for JSON encoding.
     *
     * Unlike the text formats this keeps the original field names, so it round-trips
     * cleanly into another tool.
     *
     * @return array
     */
    public function to_array(): array {
        $out = [
            'activity' => $this->settings_array(),
            'slides'   => [],
            'quiz'     => [],
        ];

        $slides = $this->slides();
        foreach ($slides as $i => $slide) {
            if (!is_array($slide)) {
                continue;
            }
            $out['slides'][] = [
                'number'      => $i + 1,
                'type'        => (string)($slide['type'] ?? $slide['slideType'] ?? 'unknown'),
                'title'       => (string)($slide['title'] ?? ''),
                'content'     => $this->clean_value($slide['content'] ?? []),
                'extra'       => $this->clean_value($this->extra_fields($slide)),
                'narration'   => narration::resolve($slide),
                'imagePrompt' => (string)($slide['imagePrompt'] ?? ''),
                'imageUrl'    => (string)($slide['imageUrl'] ?? ''),
            ];
        }

        $questions = $this->questions();
        foreach ($questions as $i => $q) {
            if (!is_array($q)) {
                continue;
            }
            $correct = isset($q['correctAnswer']) ? (int)$q['correctAnswer'] : 0;
            $options = isset($q['options']) && is_array($q['options']) ? array_values($q['options']) : [];
            $out['quiz'][] = [
                'number'        => $i + 1,
                'question'      => (string)($q['question'] ?? ''),
                'options'       => array_map('strval', $options),
                'correctIndex'  => $correct,
                'correctLetter' => $this->letter($correct),
                'correctText'   => isset($options[$correct]) ? (string)$options[$correct] : '',
                'explanation'   => (string)($q['explanation'] ?? ''),
            ];
        }

        return $out;
    }

    // Internals.

    /**
     * Filter a Moodle text field for output into a PLAIN TEXT file.
     *
     * format_string() returns HTML-escaped text, which is right for a web page and wrong
     * for a .txt/.md/.json download — an activity named 'Q&A "Widgets"' otherwise exports
     * as 'Q&amp;A &quot;Widgets&quot;'. Slide body text comes straight from the manifest
     * and is never escaped, so without this the two halves of the file disagree.
     *
     * @param  string $text Raw text field value.
     * @return string
     */
    protected function plain($text): string {
        return html_entity_decode(format_string((string)$text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    /**
     * Build the activity settings block as an array.
     *
     * @return array
     */
    protected function settings_array(): array {
        $mode = (string)($this->manifest['mode'] ?? '');
        $passmark = !empty($this->pe->completionquiz) ? (int)($this->pe->completionquizpercent ?? 100) : 80;
        return [
            'name'           => $this->plain($this->pe->name),
            'course'         => $this->plain($this->course->fullname),
            'courseShortname' => $this->plain($this->course->shortname),
            'mode'           => $mode === 'concept' ? 'Concept Slides' : ($mode === 'product' ? 'Product Slides' : 'Unknown'),
            'topic'          => (string)($this->manifest['productName'] ?? $this->manifest['conceptName']
                ?? $this->manifest['topic'] ?? ''),
            'slideCount'     => $this->slide_count(),
            'questionCount'  => $this->question_count(),
            'passMarkPct'    => $passmark,
            'passMarkSource' => !empty($this->pe->completionquiz) ? 'completion rule' : 'default',
            'voiceLanguage'  => (string)($this->pe->voicelanguage ?? ''),
            'voiceStyle'     => (string)($this->manifest['voiceStyle'] ?? $this->pe->voicestyle ?? ''),
            'voiceoverEnabled' => !empty($this->pe->enablevoiceover),
            'voiceoverRequired' => !empty($this->pe->requirevoiceover),
            'accentColour'   => (string)($this->pe->accentcolor ?? ''),
            'certificate'    => !empty($this->pe->enablecertificate),
            'cpdPoints'      => (int)($this->pe->cpdpoints ?? 0),
            'exportedAt'     => userdate(time()),
        ];
    }

    /**
     * Slide-level fields that are not meta and not part of content (e.g. videoUrl).
     *
     * @param  array $slide One slide from the manifest.
     * @return array
     */
    protected function extra_fields(array $slide): array {
        $out = [];
        foreach ($slide as $key => $value) {
            if (in_array($key, self::SKIP_KEYS, true)) {
                continue;
            }
            $out[$key] = $value;
        }
        return $out;
    }

    /**
     * Recursively cast a decoded manifest fragment to plain scalars/arrays.
     *
     * @param  mixed $value Any manifest fragment.
     * @return mixed
     */
    protected function clean_value($value) {
        if (is_array($value)) {
            $out = [];
            foreach ($value as $k => $v) {
                $out[$k] = $this->clean_value($v);
            }
            return $out;
        }
        if (is_bool($value) || is_int($value) || is_float($value) || $value === null) {
            return $value;
        }
        return (string)$value;
    }

    /**
     * Render the full document in either plain text or Markdown.
     *
     * @param  bool $md True for Markdown, false for plain text.
     * @return string
     */
    protected function render(bool $md): string {
        $lines = [];
        $settings = $this->settings_array();

        // Header.
        if ($md) {
            $lines[] = '# ' . $settings['name'];
            $lines[] = '';
            $lines[] = '_AI Slide Flow content export_';
            $lines[] = '';
        } else {
            $lines[] = str_repeat('=', 78);
            $lines[] = 'AI SLIDE FLOW - CONTENT EXPORT';
            $lines[] = str_repeat('=', 78);
        }

        $meta = [
            'Activity'       => $settings['name'],
            'Course'         => $settings['course'],
            'Mode'           => $settings['mode'],
            'Topic'          => $settings['topic'],
            'Slides'         => (string)$settings['slideCount'],
            'Quiz questions' => (string)$settings['questionCount'],
            'Pass mark'      => $settings['passMarkPct'] . '% (' . $settings['passMarkSource'] . ')',
            'Voiceover'      => ($settings['voiceoverEnabled'] ? 'Enabled' : 'Disabled')
                . ' - ' . $settings['voiceLanguage'] . ' / ' . $settings['voiceStyle']
                . ($settings['voiceoverRequired'] ? ' (required before advancing)' : ''),
            'Certificate'    => $settings['certificate']
                ? ('Enabled' . ($settings['cpdPoints'] ? ', ' . $settings['cpdPoints'] . ' CPD points' : ''))
                : 'Disabled',
            'Exported'       => $settings['exportedAt'],
        ];
        foreach ($meta as $label => $value) {
            if ($value === '' || $value === null) {
                continue;
            }
            $lines[] = $md ? ('- **' . $label . ':** ' . $value) : (str_pad($label, 15) . ': ' . $value);
        }
        $lines[] = '';

        if (!$this->has_content()) {
            $lines[] = $md ? '> No slides have been generated for this activity yet.'
                : 'No slides have been generated for this activity yet.';
            return implode("\n", $lines) . "\n";
        }

        // Slides.
        $slides = $this->slides();
        $total = count($slides);
        foreach ($slides as $i => $slide) {
            if (!is_array($slide)) {
                continue;
            }
            $num = $i + 1;
            $title = trim((string)($slide['title'] ?? ''));
            $type = (string)($slide['type'] ?? $slide['slideType'] ?? 'unknown');
            $heading = 'Slide ' . $num . ' of ' . $total . ($title !== '' ? ' - ' . $title : '');

            if ($md) {
                $lines[] = '';
                $lines[] = '## ' . $heading;
                $lines[] = '';
                $lines[] = '`' . $type . '`';
                $lines[] = '';
            } else {
                $lines[] = str_repeat('-', 78);
                $lines[] = strtoupper($heading);
                $lines[] = 'Type: ' . $type;
                $lines[] = str_repeat('-', 78);
            }

            $body = [];
            $this->walk($slide['content'] ?? [], $body, 0, $md);
            $this->walk($this->extra_fields($slide), $body, 0, $md);
            if (empty($body)) {
                $body[] = $md ? '_(no text content on this slide)_' : '(no text content on this slide)';
            }
            $lines = array_merge($lines, $body);

            $narration = narration::resolve($slide);
            if ($narration !== '') {
                $lines[] = '';
                $lines[] = $md ? '**Narration script**' : 'NARRATION SCRIPT';
                $lines = array_merge($lines, $this->wrap_block($narration, $md ? '> ' : '  '));
            }

            $prompt = trim((string)($slide['imagePrompt'] ?? ''));
            if ($prompt !== '') {
                $lines[] = '';
                $lines[] = $md ? '**AI image prompt**' : 'AI IMAGE PROMPT';
                $lines = array_merge($lines, $this->wrap_block($prompt, $md ? '> ' : '  '));
            }

            $imageurl = trim((string)($slide['imageUrl'] ?? ''));
            if ($imageurl !== '') {
                $lines[] = '';
                $lines[] = ($md ? '**Image URL:** ' : 'Image URL: ') . $imageurl;
            }
            $lines[] = '';
        }

        // Quiz.
        $questions = $this->questions();
        if (!empty($questions)) {
            $qtotal = count($questions);
            if ($md) {
                $lines[] = '';
                $lines[] = '## Knowledge check - ' . $qtotal . ' question' . ($qtotal === 1 ? '' : 's');
                $lines[] = '';
                $lines[] = 'Pass mark: **' . $settings['passMarkPct'] . '%**';
                $lines[] = '';
            } else {
                $lines[] = str_repeat('=', 78);
                $lines[] = 'KNOWLEDGE CHECK - ' . $qtotal . ' QUESTION' . ($qtotal === 1 ? '' : 'S')
                    . '  (pass mark ' . $settings['passMarkPct'] . '%)';
                $lines[] = str_repeat('=', 78);
            }

            foreach ($questions as $i => $q) {
                if (!is_array($q)) {
                    continue;
                }
                $num = $i + 1;
                $qtext = trim((string)($q['question'] ?? ''));
                $correct = isset($q['correctAnswer']) ? (int)$q['correctAnswer'] : 0;
                $options = isset($q['options']) && is_array($q['options']) ? array_values($q['options']) : [];

                $lines[] = '';
                $lines[] = $md ? ('### Q' . $num . '. ' . $qtext) : ('Q' . $num . '. ' . $qtext);
                $lines[] = '';
                foreach ($options as $oi => $opt) {
                    $mark = ($oi === $correct) ? ' [CORRECT]' : '';
                    $text = $this->letter($oi) . '. ' . trim((string)$opt) . $mark;
                    $lines[] = $md ? ('- ' . ($oi === $correct ? '**' . $text . '**' : $text)) : ('    ' . $text);
                }
                $lines[] = '';
                $correcttext = isset($options[$correct]) ? trim((string)$options[$correct]) : '';
                $answer = 'Correct answer: ' . $this->letter($correct) . ($correcttext !== '' ? ' - ' . $correcttext : '');
                $lines[] = $md ? ('**' . $answer . '**') : ('  ' . $answer);
                $explanation = trim((string)($q['explanation'] ?? ''));
                if ($explanation !== '') {
                    $lines[] = $md ? ('Explanation: ' . $explanation) : ('  Explanation: ' . $explanation);
                }
            }
            $lines[] = '';
        }

        return implode("\n", $lines) . "\n";
    }

    /**
     * Recursively turn a manifest fragment into readable lines.
     *
     * @param mixed $value  The fragment to render.
     * @param array $lines  Output buffer, appended to by reference.
     * @param int   $depth  Current recursion depth.
     * @param bool  $md     True for Markdown output.
     * @param string $label Optional label for this fragment.
     */
    protected function walk($value, array &$lines, int $depth, bool $md, string $label = '') {
        if ($depth > self::MAX_DEPTH) {
            return;
        }
        $indent = str_repeat('  ', $depth);

        if ($value === null || $value === '' || $value === []) {
            return;
        }

        // Scalar: render as "Label: value" (or bare value when unlabelled).
        if (!is_array($value)) {
            if (is_bool($value)) {
                $value = $value ? 'Yes' : 'No';
            }
            $text = trim((string)$value);
            if ($text === '') {
                return;
            }
            if ($label === '') {
                $lines[] = $indent . $text;
            } else if ($md) {
                $lines[] = $indent . '- **' . $label . ':** ' . $text;
            } else {
                $lines[] = $indent . $label . ': ' . $text;
            }
            return;
        }

        // Numerically indexed list.
        if ($this->is_list($value)) {
            if ($label !== '') {
                $lines[] = $indent . ($md ? '- **' . $label . ':**' : $label . ':');
            }
            foreach ($value as $item) {
                if (is_array($item)) {
                    // A list of objects — render each as a bulleted block whose first
                    // field sits on the bullet line and the rest align beneath it.
                    $sub = [];
                    foreach ($item as $k => $v) {
                        if (in_array((string)$k, self::NOISE_KEYS, true)) {
                            continue;
                        }
                        // Depth must keep climbing here: passing 0 reset the counter on
                        // every list hop and defeated the MAX_DEPTH guard completely.
                        $this->walk($v, $sub, $depth + 1, $md, $this->humanise((string)$k));
                    }
                    $rendered = [];
                    foreach ($sub as $subline) {
                        if (trim($subline) !== '') {
                            $rendered[] = $subline;
                        }
                    }
                    $sub = $rendered;
                    if (!empty($sub)) {
                        $prefix = $indent . '  ';
                        foreach ($sub as $si => $line) {
                            $bullet = ($si === 0) ? ($md ? '- ' : '* ') : '  ';
                            $lines[] = $prefix . $bullet . $this->strip_bullet($line);
                        }
                    }
                } else {
                    $text = trim((string)$item);
                    if ($text !== '') {
                        $lines[] = $indent . '  ' . ($md ? '- ' : '* ') . $text;
                    }
                }
            }
            return;
        }

        // Associative object.
        if ($label !== '') {
            $lines[] = $indent . ($md ? '- **' . $label . ':**' : $label . ':');
            $depth++;
        }
        foreach ($value as $k => $v) {
            if (in_array((string)$k, self::NOISE_KEYS, true)) {
                continue;
            }
            $this->walk($v, $lines, $depth, $md, $this->humanise((string)$k));
        }
    }

    /**
     * Whether an array is a plain zero-indexed list.
     *
     * @param  array $arr Array to test.
     * @return bool
     */
    protected function is_list(array $arr): bool {
        return $arr === [] || array_keys($arr) === range(0, count($arr) - 1);
    }

    /**
     * Turn a camelCase manifest key into a readable label.
     *
     * @param  string $key Manifest field name.
     * @return string
     */
    protected function humanise(string $key): string {
        $acronyms = ['url' => 'URL', 'id' => 'ID', 'cpd' => 'CPD', 'faq' => 'FAQ', 'tts' => 'TTS'];
        $spaced = preg_replace('/(?<!^)([A-Z])/', ' $1', $key);
        $spaced = str_replace('_', ' ', $spaced);
        $words = preg_split('/\s+/', trim($spaced));
        $out = [];
        foreach ($words as $i => $word) {
            $lower = strtolower($word);
            if (isset($acronyms[$lower])) {
                $out[] = $acronyms[$lower];
            } else if ($i === 0) {
                $out[] = ucfirst($lower);
            } else {
                $out[] = $lower;
            }
        }
        return implode(' ', $out);
    }

    /**
     * Option letter for an index, falling back to a number beyond D.
     *
     * @param  int $index Zero-based option index.
     * @return string
     */
    protected function letter(int $index): string {
        $letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        return $letters[$index] ?? (string)($index + 1);
    }

    /**
     * Strip a rendered line's own leading indent and bullet, ready for re-indenting.
     *
     * Only an exact leading bullet is removed. A previous version used
     * ltrim($line, "- \t"), which also ate the first character of legitimate content
     * such as "-5% margin".
     *
     * @param  string $line A line produced by walk().
     * @return string
     */
    protected function strip_bullet(string $line): string {
        $line = ltrim($line, " \t");
        if (strpos($line, '- ') === 0 || strpos($line, '* ') === 0) {
            $line = substr($line, 2);
        }
        return $line;
    }

    /**
     * Wrap a long paragraph and prefix every line.
     *
     * @param  string $text   Text to wrap.
     * @param  string $prefix Prefix for each produced line.
     * @return string[]
     */
    protected function wrap_block(string $text, string $prefix): array {
        $wrapped = wordwrap(trim($text), 74, "\n", false);
        $out = [];
        foreach (explode("\n", $wrapped) as $line) {
            $out[] = $prefix . $line;
        }
        return $out;
    }
}
