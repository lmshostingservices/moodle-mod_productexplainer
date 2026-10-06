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
 * Executable narration/player reliability regression tests.
 *
 * @package    mod_productexplainer
 * @copyright  2026 AI Grader
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';
import {minify} from 'terser';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = readFileSync(root + 'amd/src/player.js', 'utf8');
let narration;
vm.runInNewContext(readFileSync(root + 'amd/src/narration.js', 'utf8'), {
    define: (_name, _deps, factory) => { narration = factory(); },
});
const flush = () => new Promise(resolve => setImmediate(resolve));

function harness(slides, config = {}) {
    const dom = new JSDOM('<div id="pe-app"></div>', {url: 'https://moodle.example/mod/productexplainer/view.php?id=42'});
    dom.window.confirm = () => true;
    const requests = [], audios = [], timers = new Map();
    let seq = 0, api;
    class Audio {
        constructor(url) { this.src = url; this.paused = true; this.currentTime = 0; this.calls = 0; audios.push(this); }
        play() {
            this.calls++;
            if (this.reject) return Promise.reject({name: this.reject});
            this.paused = false;
            this.onplay?.();
            this.onplaying?.();
            return Promise.resolve();
        }
        pause() { this.paused = true; this.onpause?.(); }
        load() { this.loads = (this.loads || 0) + 1; }
        removeAttribute() {}
        finish() { this.paused = true; this.onended?.(); }
    }
    class XHR {
        open(_method, url) { this.url = url; }
        setRequestHeader() {}
        send(body) { this.body = JSON.parse(body); requests.push(this); }
        respond(data) { this.status = 200; this.responseText = JSON.stringify(data); this.onload(); }
        fail() { this.onerror(); }
    }
    const instrumented = source.replace('return { init: init };', `return {
        init:init, generate:handleGenerateAllVoiceovers, save:handleSave,
        resolve:buildVoiceoverText, show:showSlide, start:startAudio, toggle:toggleAudio,
        speak:speakQuizText, stopQuiz:stopQuizAudio, canAdvance:canAdvanceFromSlide,
        state:function(){return {manifest:manifest,busy:generationRunning,blocked:audioBlocked,failed:audioFailed};},
        setup:function(m,c){manifest=m;cfg=c;builderApp=document.getElementById('pe-app');totalSlides=m.slides.length;},
        navigate:function(i){currentSlide=i;showSlide(i,totalSlides,true);}
    };`);
    vm.runInNewContext(instrumented, {
        define: (_name, _deps, factory) => { api = factory(narration); },
        document: dom.window.document, window: dom.window, Audio, XMLHttpRequest: XHR,
        setTimeout: (fn, delay) => { const id = ++seq; timers.set(id, {fn, delay}); return id; },
        clearTimeout: id => timers.delete(id), setInterval: () => ++seq, clearInterval() {},
        Date, URL: {createObjectURL: () => 'blob:test', revokeObjectURL() {}}, Blob, Uint8Array,
        atob: value => Buffer.from(value, 'base64').toString('binary'),
        alert() {},
    });
    const manifest = {slides, mode: 'product'};
    const cfg = {cmid:42, ajaxUrl:'/ajax.php', sesskey:'session', enableVoiceover:true, requireVoiceover:true,
        voiceLanguage:'fr-CA', voiceStyle:'Leda', manifest:encodeURIComponent(JSON.stringify(manifest)), ...config};
    return {api, dom, requests, audios, timers, cfg, manifest, init:() => api.init(cfg)};
}

test('explicit Start supplies first play; delayed navigation never toggles it off; no-audio has no gate', async () => {
    const h = harness([{type:'cx-introduction',title:'Safety',voiceoverUrl:'/a.mp3'}, {title:'Next',voiceoverUrl:'/b.mp3'}]);
    h.init();
    assert.equal(h.audios.length, 0);
    assert.ok(h.dom.window.document.querySelector('#pe-start-btn'));
    h.dom.window.document.querySelector('#pe-start-btn').click();
    assert.equal(h.audios[0].calls, 1);
    assert.equal(h.audios[0].paused, false);
    assert.equal(h.timers.size, 0, 'play event clears pending playback timeout');
    h.api.start(0, h.api.state().manifest.slides[0]);
    assert.equal(h.audios[0].paused, false);
    h.audios[0].finish();
    assert.equal(h.api.canAdvance(0,h.api.state().manifest.slides), true);
    h.api.navigate(1);
    assert.equal(h.audios[1].calls, 1);
    await flush();
    const silent = harness([{title:'Read this',type:'pe-image-slide'}]);
    silent.init();
    assert.equal(silent.dom.window.document.querySelector('#pe-start-btn'), null);
    assert.equal(silent.api.canAdvance(0,silent.api.state().manifest.slides), true);
});

test('play rejection visible, manual retry works, media errors do not bypass must-watch video', async () => {
    const h = harness([{type:'pe-video-slide',title:'Demo',mustWatchVideo:true,videoUrl:'https://youtu.be/abcdefghijk',voiceoverUrl:'/a.ogg'},
        {title:'End'}]);
    h.init();
    // Get an audio before the gesture solely to simulate the browser policy.
    h.api.start(0,h.api.state().manifest.slides[0]);
    h.audios[0].pause();
    h.audios[0].reject = 'NotAllowedError';
    h.dom.window.document.querySelector('#pe-start-btn').click();
    await flush();
    assert.equal(h.api.state().blocked[0], true);
    assert.match(h.dom.window.document.querySelector('#pe-audio-instruction-text').textContent,/Press play/);
    delete h.audios[0].reject;
    h.dom.window.document.querySelector('#pe-audio-btn').click();
    h.audios[0].onerror();
    assert.equal(h.api.canAdvance(0,h.api.state().manifest.slides), false);
    assert.match(h.dom.window.document.querySelector('#pe-audio-instruction-text').textContent,/retry/);
    h.dom.window.document.querySelector('#pe-audio-btn').click();
    assert.equal(h.audios[0].loads, 1);
});

test('generation locks save and all authoring; prevents overlap; never retries ambiguous requests; keeps completed links', () => {
    const h = harness([{title:'One',type:'cx-summary',content:{conceptName:'Safety'}},
        {title:'Two',type:'faq',content:{faqs:[{question:'Why?',answer:'Protect people.'}]}}],{builderMode:true});
    h.init();
    h.api.generate();
    assert.equal(h.requests.length,1);
    assert.equal(h.dom.window.document.querySelector('#pe-save-btn').disabled,true);
    assert.equal(h.dom.window.document.querySelector('.pe-narration-ta').disabled,true);
    const unload = new h.dom.window.Event('beforeunload',{cancelable:true});
    h.dom.window.dispatchEvent(unload);
    assert.equal(unload.defaultPrevented,true);
    h.api.generate(); h.api.save();
    assert.equal(h.requests.length,1);
    const text = h.requests[0].body.text;
    assert.equal(h.requests[0].body.language,'fr-CA');
    assert.equal(h.requests[0].body.voice,'Leda');
    h.requests[0].respond({success:true,audioUrl:'/one.mp3'});
    assert.equal(h.requests.length,2);
    h.requests[1].fail();
    assert.equal(h.requests.length,2,'no automatic charged retry');
    assert.equal(h.api.state().manifest.slides[0].generatedNarrationText,text);
    assert.equal(h.api.state().manifest.slides[0].voiceoverUrl,'/one.mp3');
    assert.equal(h.api.state().busy,false);
    assert.match(h.dom.window.document.querySelector('#pe-vo-status').textContent,/uncertain request/);
    h.api.save();
    assert.equal(h.requests.length,2,'incomplete requested narration blocks publish');
    h.api.state().manifest.slides[1].narrationOmitted = true;
    h.api.save();
    assert.equal(h.requests.length,3);
    assert.equal(h.requests[2].body.manifest.slides[0].narrationScript,text);
});

test('teacher input is an explicit override; stale publication blocked; omit retains old link', () => {
    const h = harness([{type:'cx-summary',title:'Summary',voiceoverUrl:'/legacy.ogg',voiceoverText:'Old AI prose',
        content:{conceptName:'Safety',keyTakeaways:[{point:'Wear eye protection'}]}}],{builderMode:true});
    h.init();
    const slide = h.api.state().manifest.slides[0];
    assert.equal(slide.narrationMode,undefined);
    assert.equal(narration.stale(slide),false);
    const ta = h.dom.window.document.querySelector('.pe-narration-ta');
    ta.value = 'Deliberate teacher script.';
    ta.dispatchEvent(new h.dom.window.Event('input',{bubbles:true}));
    assert.equal(h.api.resolve(slide),'Deliberate teacher script.');
    assert.equal(narration.stale(slide),true);
    h.api.save();
    assert.equal(h.requests.length,0);
    assert.match(h.dom.window.document.querySelector('[role=status]').textContent,/out of date/);
    h.dom.window.document.querySelector('[data-narration-omit]').click();
    h.api.save();
    assert.equal(h.requests[0].body.manifest.slides[0].voiceoverUrl,'/legacy.ogg');
});

test('regeneration uses the teacher script, clears failure only on success and retries only failed/changed slides', () => {
    const h = harness([{type:'faq',title:'One',voiceoverUrl:'/old.ogg',voiceoverText:'Legacy prose',
        content:{faqs:[{question:'Old question',answer:'Old answer'}]}},{title:'Two',type:'pe-image-slide'}],{builderMode:true});
    h.init();
    const ta = h.dom.window.document.querySelector('.pe-narration-ta');
    ta.value = 'Teacher pronunciation and emphasis.';
    ta.dispatchEvent(new h.dom.window.Event('input',{bubbles:true}));
    h.api.generate();
    assert.equal(h.requests[0].body.text,ta.value);
    h.requests[0].respond({success:true,audioUrl:'/new.mp3'});
    h.requests[1].fail();
    h.api.generate();
    assert.equal(h.requests.length,3,'completed unchanged slide is not charged again');
    assert.equal(h.requests[2].body.slideIndex,1);
    h.requests[2].respond({success:true,audioUrl:'/two.mp3'});
    assert.equal(h.api.state().manifest.slides[1].narrationGenerationFailed,false);
    h.api.save();
    const saved = h.requests[3].body.manifest;
    assert.equal(saved.slides[0].narrationScript,'Teacher pronunciation and emphasis.');
    assert.equal(saved.slides[0].generatedNarrationText,'Teacher pronunciation and emphasis.');
    assert.equal(saved.slides[0].narrationOverride,'Teacher pronunciation and emphasis.');
});

test('initial and final narration gates cannot be bypassed by quiz CTA; omitted recording is never played', () => {
    const h = harness([{title:'Final',type:'pe-image-slide',voiceoverUrl:'/old.ogg'}]);
    h.cfg.manifest = encodeURIComponent(JSON.stringify({...h.manifest,
        quizQuestions:[{question:'Which action?',options:['Safe','Unsafe'],correctAnswer:0,explanation:'Keep people safe.'}]}));
    h.init();
    const cta = h.dom.window.document.querySelector('#pe-quiz-cta-btn');
    assert.equal(cta.disabled,true);
    h.dom.window.document.querySelector('#pe-start-btn').click();
    assert.equal(cta.disabled,true);
    h.audios[0].finish();
    assert.equal(cta.disabled,false);
    cta.click();
    assert.notEqual(h.dom.window.document.querySelector('#pe-quiz-overlay').style.display,'none');
    const omit = harness([{title:'Read only',voiceoverUrl:'/preserved.ogg',narrationOmitted:true}]);
    omit.init();
    assert.equal(omit.audios.length,0);
    assert.equal(omit.dom.window.document.querySelector('#pe-start-btn'),null);
});

test('stopped quiz discards late service response and repeat render clears playback timers/listeners', () => {
    const h = harness([{title:'Slide',voiceoverUrl:'/a.mp3'}]);
    h.init();
    h.dom.window.document.querySelector('#pe-start-btn').click();
    const oldAudio = h.audios[0];
    oldAudio.onwaiting();
    assert.equal(h.timers.size,1);
    h.init();
    assert.equal(h.timers.size,0);
    assert.equal(oldAudio.onended,null);
    assert.equal(oldAudio.onwaiting,null);
    h.api.speak('Cancelled question');
    h.api.stopQuiz();
    h.requests[0].respond({success:true,audioType:'audio/mpeg',audioContent:Buffer.from('ID3').toString('base64')});
    assert.equal(h.audios.length,1,'late response must not create/play quiz audio');
});

test('quiz service failure has explicit Continue; retry playback reuses bytes, not a new charged request', async () => {
    const h = harness([{title:'Quiz slide',voiceoverUrl:'/slide.mp3'}]);
    h.api.setup(h.manifest,h.cfg);
    const overlay = h.dom.window.document.createElement('div');
    overlay.id = 'pe-quiz-overlay';
    h.dom.window.document.body.appendChild(overlay);
    let ended = 0;
    h.api.speak('Question',() => ended++);
    h.requests[0].fail();
    assert.equal(ended,0);
    assert.ok(h.dom.window.document.querySelector('#pe-quiz-audio-error'));
    h.dom.window.document.querySelector('#pe-quiz-audio-continue').click();
    assert.equal(ended,1);
    h.api.speak('Feedback',() => ended++);
    h.requests[1].respond({success:true,audioType:'audio/mpeg',audioContent:Buffer.from('ID3 bytes').toString('base64')});
    h.audios[0].onerror();
    h.dom.window.document.querySelector('#pe-quiz-audio-retry').click();
    assert.equal(h.requests.length,2);
    h.audios[0].finish();
    assert.equal(ended,2);
    h.api.stopQuiz();
    assert.equal(h.timers.size,0);
    await flush();
});

test('ordered renderer fields cover all types; no concept omissions, duplicate challenge, metadata or legacy override', () => {
    const typeMapSource = source.slice(source.indexOf('function renderSlide('),source.indexOf('function slideShell('));
    for (const [_, type, name] of typeMapSource.matchAll(/'([^']+)':\s+(render\w+)/g)) {
        const start = source.indexOf('function '+name+'(');
        const end = source.indexOf('\n    function ',start+10);
        const renderer = source.slice(start,end);
        const fields = [...new Set([...renderer.matchAll(/\bc\.(\w+)/g)].map(match => match[1]))].sort();
        assert.deepEqual(narration.fields[type].split(' ').filter(Boolean).sort(),fields,'Renderer fields drifted: '+type);
    }
    assert.equal(narration.resolve({type:'cx-scenario',title:'Situation',voiceoverText:'Ignore me',
        content:{challenge:'Act carefully',imagePrompt:'Secret',conceptName:'not rendered'}}),
        'Situation.  Act carefully.');
    assert.equal(narration.resolve({type:'cx-key-concept',content:{conceptName:'Hand hygiene',definition:'Wash hands'}}),
        'Hand hygiene.  Wash hands.');
    assert.equal(narration.resolve({type:'competitive-advantage',content:{vsAlternatives:[{competitor:'Alternative',ourAdvantage:'Reusable',icon:'star'}]}}),
        'Alternative.  Reusable.');
    assert.equal(narration.resolve({type:'custom',content:{body:'Read me',imageUrl:'ignore',icon:'ignore',items:['Also read']}}),
        'Read me.  Also read.');
    assert.equal(narration.resolve({type:'pe-video-slide',title:'Watch demo',videoUrl:'https://not-spoken',content:{body:'not rendered'}}),'Watch demo.');
});

test('PHP narration/export/MIME harness and JS/PHP ordered schema parity', () => {
    const payload = Object.entries(narration.fields).map(([type, fields]) => ({
        type,title:'Slide',voiceoverText:'Legacy AI must not override',
        content:Object.fromEntries(fields.split(' ').filter(Boolean).map(key => [key,
            narration.nested[key] ? [Object.fromEntries(narration.nested[key].split(' ').map(k => [k,'Text '+k]))] : 'Text '+key])),
    }));
    payload.push({type:'unknown',content:{body:'Body',imageUrl:'ignore'}},
        {type:'faq',narrationMode:'override',narrationOverride:'Teacher exact script!',content:{}});
    const result = spawnSync('php',[root+'tests/narration_harness.php'],{input:JSON.stringify(payload),encoding:'utf8'});
    assert.equal(result.status,0,result.stderr || result.stdout);
    const output = JSON.parse(result.stdout);
    assert.deepEqual(output.scripts,payload.map(narration.resolve));
    assert.deepEqual(output.fields,JSON.parse(JSON.stringify(narration.fields)));
    assert.deepEqual(output.nested,JSON.parse(JSON.stringify(narration.nested)));
    assert.equal(output.mimeTests,9);
});

test('Moodle build artifacts match current sources and contain only minified companions with valid named modules', async () => {
    for (const module of ['player','narration','report']) {
        assert.equal(existsSync(root+'amd/build/'+module+'.js'),false,'Unminified AMD companion must not ship');
        const built = readFileSync(root+'amd/build/'+module+'.min.js','utf8');
        const compiled = await minify(readFileSync(root+'amd/src/'+module+'.js','utf8'),
            {ecma:2015, compress:true, mangle:true, sourceMap:{filename:module+'.min.js',url:module+'.min.js.map'}});
        assert.equal(built.trim(),compiled.code.trim(),'Stale AMD build: '+module);
        const map = JSON.parse(readFileSync(root+'amd/build/'+module+'.min.js.map','utf8'));
        assert.equal(map.file,module+'.min.js');
        assert.match(built,new RegExp(`define\\(["']mod_productexplainer/${module}["']`));
        new vm.Script(built);
    }
});

test('PHP save enforces canonical contracts before storing; immutable audio validates before writing; tariffs unchanged', () => {
    const php = readFileSync(root+'ajax.php','utf8');
    const save = php.slice(php.indexOf("if ($action === 'save_manifest')"),php.indexOf("// ACTION: get_manifest"));
    assert.ok(save.indexOf('narration::incomplete') < save.indexOf('$DB->set_field'));
    assert.match(save,/narration::resolve/);
    const tts = php.slice(php.indexOf("if ($action === 'generate_voiceover')"),php.indexOf("// ACTION: generate_quiz_tts"));
    assert.ok(tts.indexOf('audio_format::decode') < tts.indexOf('create_file_from_string'));
    assert.match(tts,/random_bytes\(12\)/);
    assert.match(tts,/'mimetype'\s*=>\s*\$format\['type'\]/);
    assert.doesNotMatch(tts,/\$existing->delete/);
    assert.match(tts,/'creditsToUse'\s*=>\s*3/);
    const quiz = php.slice(php.indexOf("if ($action === 'generate_quiz_tts')"),php.indexOf("// ACTION: save_quiz_score"));
    assert.match(quiz,/'audioType'\s*=>\s*\$format\['type'\]/);
    assert.match(quiz,/'creditsToUse'\s*=>\s*1/);
});
