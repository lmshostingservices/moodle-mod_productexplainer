/* jshint ignore:start */
define('mod_productexplainer/report', [], function() {
    'use strict';

    var cfg = {};

    // ── Utilities ────────────────────────────────────────────────────────────
    function esc(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    function fmtTime(secs) {
        if (!secs || secs < 1) return '< 1s';
        var m = Math.floor(secs / 60), s = secs % 60;
        return m > 0 ? (m + 'm ' + (s > 0 ? s + 's' : '')).trim() : s + 's';
    }
    function fmtDate(ts) {
        var d = new Date(ts * 1000);
        return d.toLocaleDateString();
    }
    function fmtDateTime(ts) {
        var d = new Date(ts * 1000);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});
    }
    function avg(arr) {
        if (!arr.length) return 0;
        return Math.round(arr.reduce(function(a, b) { return a + b; }, 0) / arr.length);
    }
    function csvEsc(v) {
        v = String(v || '');
        if (v.indexOf(',') >= 0 || v.indexOf('"') >= 0 || v.indexOf('\n') >= 0) return '"' + v.replace(/"/g, '""') + '"';
        return v;
    }

    // ── SVG Chart Helpers ────────────────────────────────────────────────────
    function makeSvg(w, h, content) {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ' + w + ' ' + h + '" style="display:block;overflow:visible">' + content + '</svg>';
    }

    function renderBarChart(el, labels, values, opts) {
        opts = opts || {};
        var color = opts.color || '#3b82f6';
        var unit  = opts.unit  || '';
        var title = opts.title || '';
        var max   = opts.max   || Math.max.apply(null, values.concat([1]));
        var n = values.length;
        if (!n) { el.innerHTML = '<p class="pe-rpt-nodata">No data yet.</p>'; return; }
        var W = 640, H = 260, pL = 44, pR = 20, pT = 28, pB = 52;
        var cW = W - pL - pR, cH = H - pT - pB;
        var gap = cW / n, bW = Math.min(52, Math.max(10, gap * 0.6));
        var c = '';
        for (var gi = 0; gi <= 4; gi++) {
            var gy = pT + cH - (gi / 4) * cH;
            c += '<line x1="' + pL + '" y1="' + gy + '" x2="' + (pL + cW) + '" y2="' + gy + '" stroke="#e5e7eb" stroke-width="1"/>';
            c += '<text x="' + (pL - 6) + '" y="' + (gy + 4) + '" text-anchor="end" font-size="10" fill="#9ca3af">' + Math.round(max * gi / 4) + unit + '</text>';
        }
        c += '<line x1="' + pL + '" y1="' + (pT + cH) + '" x2="' + (pL + cW) + '" y2="' + (pT + cH) + '" stroke="#d1d5db" stroke-width="1.5"/>';
        for (var i = 0; i < n; i++) {
            var val = values[i] || 0;
            var bH = Math.max(val > 0 ? 3 : 0, (val / max) * cH);
            var bx = pL + gap * i + gap / 2 - bW / 2;
            var by = pT + cH - bH;
            var fc = opts.colorFn ? opts.colorFn(val, i) : color;
            c += '<rect x="' + bx + '" y="' + by + '" width="' + bW + '" height="' + bH + '" rx="4" fill="' + fc + '" opacity="0.88"/>';
            if (val > 0) c += '<text x="' + (bx + bW / 2) + '" y="' + (by - 5) + '" text-anchor="middle" font-size="10" font-weight="600" fill="#374151">' + val + unit + '</text>';
            var lbl = String(labels[i] || '');
            if (lbl.length > 14) lbl = lbl.slice(0, 13) + '\u2026';
            c += '<text x="' + (bx + bW / 2) + '" y="' + (pT + cH + 16) + '" text-anchor="middle" font-size="9" fill="#6b7280">' + esc(lbl) + '</text>';
        }
        el.innerHTML = (title ? '<div class="pe-rpt-chart-title">' + esc(title) + '</div>' : '') + makeSvg(W, H, c);
    }

    function renderHorizBar(el, labels, values, opts) {
        opts = opts || {};
        var color = opts.color || '#8b5cf6';
        var unit  = opts.unit  || '%';
        var title = opts.title || '';
        var max   = opts.max   || 100;
        var n = labels.length;
        if (!n) { el.innerHTML = '<p class="pe-rpt-nodata">No data yet.</p>'; return; }
        var W = 640, pL = 180, pR = 68, pT = 16, pB = 16;
        var bH = 24, rH = 44;
        var H = pT + n * rH + pB;
        var cW = W - pL - pR;
        var c = '';
        for (var i = 0; i < n; i++) {
            var val = values[i] || 0;
            var bw = Math.max(0, (val / max) * cW);
            var by = pT + rH * i + (rH - bH) / 2;
            if (i % 2 === 0) c += '<rect x="0" y="' + (pT + rH * i) + '" width="' + W + '" height="' + rH + '" fill="#f9fafb"/>';
            var lbl = String(labels[i] || '');
            if (lbl.length > 28) lbl = lbl.slice(0, 27) + '\u2026';
            c += '<text x="' + (pL - 10) + '" y="' + (by + bH / 2 + 4) + '" text-anchor="end" font-size="11" fill="#374151">' + esc(lbl) + '</text>';
            c += '<rect x="' + pL + '" y="' + by + '" width="' + cW + '" height="' + bH + '" rx="4" fill="#f3f4f6"/>';
            if (bw > 0) {
                var fc = opts.colorFn ? opts.colorFn(val, max) : color;
                c += '<rect x="' + pL + '" y="' + by + '" width="' + bw + '" height="' + bH + '" rx="4" fill="' + fc + '"/>';
            }
            c += '<text x="' + (pL + cW + 8) + '" y="' + (by + bH / 2 + 4) + '" font-size="11" font-weight="600" fill="#374151">' + val + unit + '</text>';
        }
        el.innerHTML = (title ? '<div class="pe-rpt-chart-title">' + esc(title) + '</div>' : '') + makeSvg(W, H, c);
    }

    function renderDonut(el, value, max, opts) {
        opts  = opts  || {};
        var color = opts.color || '#3b82f6';
        var label = opts.label || '';
        var sub   = opts.sub   || '';
        var size = 148, cx = 74, cy = 74, r = 54, sw = 13;
        var pct = max > 0 ? Math.min(1, value / max) : 0;
        var circ = 2 * Math.PI * r;
        var offset = circ * (1 - pct);
        var c = '';
        c += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#e5e7eb" stroke-width="' + sw + '"/>';
        c += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round"';
        c += ' stroke-dasharray="' + circ + '" stroke-dashoffset="' + offset + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>';
        c += '<text x="' + cx + '" y="' + (cy + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="22" font-weight="700" fill="#111827">' + Math.round(pct * 100) + '%</text>';
        if (sub) c += '<text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" font-size="9" fill="#6b7280">' + esc(sub) + '</text>';
        var html = '<div style="display:flex;align-items:center;gap:20px">' + makeSvg(size, size, c);
        if (label) html += '<div class="pe-rpt-donut-label"><div class="pe-rpt-donut-title">' + esc(label) + '</div>' + (sub ? '<div class="pe-rpt-donut-sub">' + esc(sub) + '</div>' : '') + '</div>';
        html += '</div>';
        el.innerHTML = html;
    }

    function renderLineChart(el, labels, values, opts) {
        opts  = opts  || {};
        var color = opts.color || '#3b82f6';
        var title = opts.title || '';
        var n = values.length;
        if (n < 2) { el.innerHTML = '<p class="pe-rpt-nodata">Needs 2+ attempts to show trend.</p>'; return; }
        var W = 640, H = 200, pL = 44, pR = 20, pT = 24, pB = 40;
        var cW = W - pL - pR, cH = H - pT - pB;
        var maxV = Math.max.apply(null, values.concat([100])), minV = 0;
        var c = '';
        for (var gi = 0; gi <= 4; gi++) {
            var gy = pT + cH - (gi / 4) * cH;
            c += '<line x1="' + pL + '" y1="' + gy + '" x2="' + (pL + cW) + '" y2="' + gy + '" stroke="#e5e7eb" stroke-width="1"/>';
            c += '<text x="' + (pL - 6) + '" y="' + (gy + 4) + '" text-anchor="end" font-size="9" fill="#9ca3af">' + Math.round(maxV * gi / 4) + '</text>';
        }
        var pts = values.map(function(v, i) {
            return [pL + (i / (n - 1)) * cW, pT + cH - ((v - minV) / (maxV - minV)) * cH];
        });
        var ap = 'M' + pts[0][0] + ',' + (pT + cH) + ' L' + pts[0][0] + ',' + pts[0][1];
        for (var j = 1; j < pts.length; j++) ap += ' L' + pts[j][0] + ',' + pts[j][1];
        ap += ' L' + pts[pts.length - 1][0] + ',' + (pT + cH) + ' Z';
        c += '<path d="' + ap + '" fill="' + color + '" opacity="0.10"/>';
        var lp = 'M' + pts[0][0] + ',' + pts[0][1];
        for (var k = 1; k < pts.length; k++) lp += ' L' + pts[k][0] + ',' + pts[k][1];
        c += '<path d="' + lp + '" fill="none" stroke="' + color + '" stroke-width="2.5" stroke-linejoin="round"/>';
        for (var m = 0; m < pts.length; m++) {
            c += '<circle cx="' + pts[m][0] + '" cy="' + pts[m][1] + '" r="4.5" fill="' + color + '" stroke="#fff" stroke-width="2"/>';
            c += '<text x="' + pts[m][0] + '" y="' + (pts[m][1] - 9) + '" text-anchor="middle" font-size="10" font-weight="600" fill="#374151">' + values[m] + '%</text>';
            var lbl = String(labels[m] || '');
            if (lbl.length > 10) lbl = lbl.slice(0, 9) + '\u2026';
            c += '<text x="' + pts[m][0] + '" y="' + (pT + cH + 16) + '" text-anchor="middle" font-size="9" fill="#6b7280">' + esc(lbl) + '</text>';
        }
        c += '<line x1="' + pL + '" y1="' + (pT + cH) + '" x2="' + (pL + cW) + '" y2="' + (pT + cH) + '" stroke="#d1d5db" stroke-width="1.5"/>';
        el.innerHTML = (title ? '<div class="pe-rpt-chart-title">' + esc(title) + '</div>' : '') + makeSvg(W, H, c);
    }

    // ── KPI Cards ────────────────────────────────────────────────────────────
    function renderKPIs(el, attempts) {
        var total = attempts.length;
        var uniqueIds = [];
        attempts.forEach(function(a) { if (uniqueIds.indexOf(a.userid) < 0) uniqueIds.push(a.userid); });
        var avgScore = total ? avg(attempts.map(function(a) { return a.score; })) : 0;
        var times = attempts.filter(function(a) { return a.timetaken > 0; }).map(function(a) { return a.timetaken; });
        var avgT = times.length ? avg(times) : 0;
        var passRate = total ? Math.round(attempts.filter(function(a) { return a.score >= 60; }).length / total * 100) : 0;
        var kpis = [
            {val: total,            label: 'Total Attempts',    color: '#3b82f6'},
            {val: uniqueIds.length, label: 'Students',          color: '#8b5cf6'},
            {val: avgScore + '%',   label: 'Avg Score',         color: avgScore >= 80 ? '#22c55e' : avgScore >= 60 ? '#f59e0b' : '#ef4444'},
            {val: fmtTime(avgT),    label: 'Avg Completion',    color: '#10b981'},
            {val: passRate + '%',   label: 'Pass Rate (60%+)',  color: '#22c55e'}
        ];
        el.innerHTML = '<div class="pe-rpt-kpi-row">' + kpis.map(function(k) {
            return '<div class="pe-rpt-kpi"><div class="pe-rpt-kpi-val" style="color:' + k.color + '">' + esc(String(k.val)) + '</div><div class="pe-rpt-kpi-lbl">' + esc(k.label) + '</div></div>';
        }).join('') + '</div>';
    }

    // ── CSV Download ─────────────────────────────────────────────────────────
    function downloadCsv(filename, rows) {
        var csv = rows.map(function(r) {
            return (Array.isArray(r) ? r : [r]).map(csvEsc).join(',');
        }).join('\r\n');
        var blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = filename; a.style.display = 'none';
        document.body.appendChild(a); a.click();
        setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
    }

    // ── Class Report ─────────────────────────────────────────────────────────
    function renderClassReport(data) {
        var attempts = data.attempts || [];

        // KPI cards
        var kpisEl = document.getElementById('pe-rpt-kpis');
        if (kpisEl) renderKPIs(kpisEl, attempts);

        // Score distribution (per-bar colour)
        var distEl = document.getElementById('pe-rpt-score-dist');
        if (distEl) {
            var bands = ['0\u201339%', '40\u201359%', '60\u201379%', '80\u201399%', '100%'];
            var counts = [0, 0, 0, 0, 0];
            attempts.forEach(function(a) {
                var s = a.score;
                if (s < 40) counts[0]++; else if (s < 60) counts[1]++; else if (s < 80) counts[2]++; else if (s < 100) counts[3]++; else counts[4]++;
            });
            var dColors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6'];
            var maxC = Math.max.apply(null, counts.concat([1]));
            var W = 640, H = 260, pL = 44, pR = 20, pT = 28, pB = 52;
            var cW = W - pL - pR, cH = H - pT - pB;
            var gap = cW / 5, bW = gap * 0.6;
            var c = '';
            for (var gi = 0; gi <= 4; gi++) {
                var gy = pT + cH - (gi / 4) * cH;
                c += '<line x1="' + pL + '" y1="' + gy + '" x2="' + (pL + cW) + '" y2="' + gy + '" stroke="#e5e7eb" stroke-width="1"/>';
                c += '<text x="' + (pL - 6) + '" y="' + (gy + 4) + '" text-anchor="end" font-size="10" fill="#9ca3af">' + Math.round(maxC * gi / 4) + '</text>';
            }
            c += '<line x1="' + pL + '" y1="' + (pT + cH) + '" x2="' + (pL + cW) + '" y2="' + (pT + cH) + '" stroke="#d1d5db" stroke-width="1.5"/>';
            for (var i = 0; i < 5; i++) {
                var bH = Math.max(counts[i] > 0 ? 3 : 0, (counts[i] / maxC) * cH);
                var bx = pL + gap * i + gap / 2 - bW / 2;
                var by = pT + cH - bH;
                c += '<rect x="' + bx + '" y="' + by + '" width="' + bW + '" height="' + bH + '" rx="4" fill="' + dColors[i] + '" opacity="0.88"/>';
                if (counts[i] > 0) c += '<text x="' + (bx + bW / 2) + '" y="' + (by - 5) + '" text-anchor="middle" font-size="11" font-weight="600" fill="#374151">' + counts[i] + '</text>';
                c += '<text x="' + (bx + bW / 2) + '" y="' + (pT + cH + 16) + '" text-anchor="middle" font-size="10" fill="#6b7280">' + esc(bands[i]) + '</text>';
            }
            distEl.innerHTML = '<div class="pe-rpt-chart-title">Score Distribution</div>' + makeSvg(W, H, c);
        }

        // Avg score donut
        var donutEl = document.getElementById('pe-rpt-avg-donut');
        if (donutEl && attempts.length) {
            var avgS = avg(attempts.map(function(a) { return a.score; }));
            var dc = avgS >= 80 ? '#22c55e' : avgS >= 60 ? '#f59e0b' : '#ef4444';
            renderDonut(donutEl, avgS, 100, {color: dc, label: 'Class average score', sub: attempts.length + ' attempt' + (attempts.length !== 1 ? 's' : '')});
        }

        // All-attempts score trend
        var timelineEl = document.getElementById('pe-rpt-timeline');
        if (timelineEl) {
            var sorted = attempts.slice().sort(function(a, b) { return a.timecreated - b.timecreated; });
            if (sorted.length >= 2) {
                renderLineChart(timelineEl, sorted.map(function(a, i) { return '#' + (i + 1); }), sorted.map(function(a) { return a.score; }), {title: 'Score Trend \u2014 All Attempts (chronological)', color: '#8b5cf6'});
            } else {
                timelineEl.innerHTML = '<p class="pe-rpt-nodata">Needs 2+ attempts to show trend.</p>';
            }
        }

        // Question difficulty
        var qdEl = document.getElementById('pe-rpt-q-difficulty');
        if (qdEl) {
            var qMap = {};
            attempts.forEach(function(a) {
                (a.answers || []).forEach(function(ans) {
                    var k = ans.qidx;
                    if (!qMap[k]) qMap[k] = {qtext: ans.qtext, total: 0, correct: 0};
                    qMap[k].total++;
                    if (ans.iscorrect) qMap[k].correct++;
                });
            });
            var qKeys = Object.keys(qMap).sort(function(a, b) { return +a - +b; });
            if (qKeys.length) {
                var qLabels = qKeys.map(function(k, i) {
                    var txt = qMap[k].qtext || ('Q' + (i + 1));
                    return txt.length > 42 ? txt.slice(0, 41) + '\u2026' : txt;
                });
                var qVals = qKeys.map(function(k) {
                    var m = qMap[k]; return m.total ? Math.round(m.correct / m.total * 100) : 0;
                });
                renderHorizBar(qdEl, qLabels, qVals, {
                    title: 'Knowledge Check \u2014 % Correct per Question',
                    unit: '%', max: 100,
                    colorFn: function(v) { return v >= 80 ? '#22c55e' : v >= 60 ? '#f59e0b' : '#ef4444'; }
                });
                var minPct = Math.min.apply(null, qVals), maxPct = Math.max.apply(null, qVals);
                qdEl.innerHTML += '<div class="pe-rpt-annotations">'
                    + '<div class="pe-rpt-ann pe-rpt-ann--hard">Hardest: <strong>' + esc(qLabels[qVals.indexOf(minPct)]) + '</strong> (' + minPct + '% correct)</div>'
                    + '<div class="pe-rpt-ann pe-rpt-ann--easy">Easiest: <strong>' + esc(qLabels[qVals.indexOf(maxPct)]) + '</strong> (' + maxPct + '% correct)</div>'
                    + '</div>';
            } else {
                qdEl.innerHTML = '<p class="pe-rpt-nodata">No knowledge check data yet. Data is recorded when students complete the quiz.</p>';
            }
        }

        // Average time per slide
        var stEl = document.getElementById('pe-rpt-avg-slide-time');
        if (stEl) {
            var slideMap = {};
            attempts.forEach(function(a) {
                (a.slidetimes || []).forEach(function(st) {
                    var k = st.slideidx;
                    if (!slideMap[k]) slideMap[k] = {title: st.slidetitle || ('Slide ' + (k + 1)), times: []};
                    if (st.timesecs > 0) slideMap[k].times.push(st.timesecs);
                });
            });
            var sKeys = Object.keys(slideMap).sort(function(a, b) { return +a - +b; });
            if (sKeys.length) {
                var sLabels = sKeys.map(function(k) { var t = slideMap[k].title; return t.length > 16 ? t.slice(0, 15) + '\u2026' : t; });
                var sVals   = sKeys.map(function(k) { var arr = slideMap[k].times; return arr.length ? Math.round(arr.reduce(function(a, b) { return a + b; }) / arr.length) : 0; });
                renderBarChart(stEl, sLabels, sVals, {title: 'Average Time per Slide (seconds)', unit: 's', color: '#10b981'});
            } else {
                stEl.innerHTML = '<p class="pe-rpt-nodata">Slide timing data is recorded when students complete the quiz for the first time.</p>';
            }
        }

        // Student leaderboard
        var tableEl = document.getElementById('pe-rpt-student-table');
        if (tableEl) {
            var byUser = {};
            attempts.forEach(function(a) {
                if (!byUser[a.userid]) byUser[a.userid] = {firstname: a.firstname, lastname: a.lastname, scores: [], times: []};
                byUser[a.userid].scores.push(a.score);
                if (a.timetaken > 0) byUser[a.userid].times.push(a.timetaken);
            });
            var rows = Object.keys(byUser).map(function(uid) {
                var u = byUser[uid];
                return {name: u.firstname + ' ' + u.lastname, n: u.scores.length, best: Math.max.apply(null, u.scores), avgSc: avg(u.scores), avgTm: u.times.length ? avg(u.times) : 0};
            }).sort(function(a, b) { return b.best - a.best; });
            var th = '<div class="pe-rpt-chart-title">Student Leaderboard</div><div class="pe-rpt-table-wrap"><table class="pe-rpt-table"><thead><tr><th>Student</th><th>Attempts</th><th>Best</th><th>Average</th><th>Avg Time</th></tr></thead><tbody>';
            var tb = rows.map(function(r, i) {
                var cls = r.best >= 80 ? 'pe-rpt-score--good' : r.best >= 60 ? 'pe-rpt-score--ok' : 'pe-rpt-score--low';
                return '<tr><td class="pe-rpt-td-name">' + (i < 3 ? '<span class="pe-rpt-rank pe-rpt-rank-' + (i + 1) + '">' + (i + 1) + '</span>' : '') + esc(r.name) + '</td>'
                    + '<td class="pe-rpt-td-center">' + r.n + '</td>'
                    + '<td class="pe-rpt-td-center"><span class="pe-rpt-score-badge ' + cls + '">' + r.best + '%</span></td>'
                    + '<td class="pe-rpt-td-center">' + r.avgSc + '%</td>'
                    + '<td class="pe-rpt-td-center">' + fmtTime(r.avgTm) + '</td></tr>';
            }).join('');
            tableEl.innerHTML = th + tb + '</tbody></table></div>';
        }

        // Class CSV export
        var exportBtn = document.getElementById('pe-rpt-export-class');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                var csvRows = [['Student', 'Date', 'Score%', 'TimeTaken_s', 'Route', 'Slides', 'Questions']];
                attempts.forEach(function(a) {
                    csvRows.push([a.firstname + ' ' + a.lastname, fmtDateTime(a.timecreated), a.score, a.timetaken, a.route, a.slidecount, a.questioncount]);
                });
                downloadCsv('class_report.csv', csvRows);
            });
        }
    }

    // ── Student Report ────────────────────────────────────────────────────────
    function renderStudentReport(data, userid) {
        var all  = data.attempts || [];
        var mine = all.filter(function(a) { return a.userid === userid; }).sort(function(a, b) { return a.timecreated - b.timecreated; });

        // Show all chart cards
        ['pe-rpt-score-trend', 'pe-rpt-student-slide-times', 'pe-rpt-qa-detail', 'pe-rpt-attempts-table'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.style.display = '';
        });
        var exportRow = document.getElementById('pe-rpt-student-export-row');
        if (exportRow) exportRow.style.display = '';

        var detailEl = document.getElementById('pe-rpt-student-detail');
        if (!mine.length) {
            if (detailEl) detailEl.innerHTML = '<p class="pe-rpt-nodata">No attempts yet for this student.</p>';
            return;
        }
        if (detailEl) detailEl.innerHTML = '';

        var latest = mine[mine.length - 1];

        // Score trend
        var trendEl = document.getElementById('pe-rpt-score-trend');
        if (trendEl) {
            renderLineChart(trendEl,
                mine.map(function(a) { return fmtDate(a.timecreated); }),
                mine.map(function(a) { return a.score; }),
                {title: 'Score Trend (All Attempts)', color: '#3b82f6'});
        }

        // Slide times — latest attempt
        var stEl = document.getElementById('pe-rpt-student-slide-times');
        if (stEl) {
            var sts = latest.slidetimes || [];
            if (sts.length) {
                var stLabels = sts.map(function(s) { var t = s.slidetitle || ('Slide ' + (s.slideidx + 1)); return t.length > 34 ? t.slice(0, 33) + '\u2026' : t; });
                var stVals   = sts.map(function(s) { return s.timesecs || 0; });
                renderHorizBar(stEl, stLabels, stVals, {
                    title: 'Time Spent per Slide \u2014 Latest Attempt',
                    unit: 's',
                    max: Math.max.apply(null, stVals.concat([30])),
                    colorFn: function(v) { return v < 10 ? '#f59e0b' : v < 60 ? '#3b82f6' : '#8b5cf6'; }
                });
            } else {
                stEl.innerHTML = '<p class="pe-rpt-nodata">Slide timing recorded for attempts made after the reporting upgrade.</p>';
            }
        }

        // Q&A breakdown — latest attempt
        var qaEl = document.getElementById('pe-rpt-qa-detail');
        if (qaEl) {
            var answers = latest.answers || [];
            if (answers.length) {
                var correct = answers.filter(function(a) { return a.iscorrect; }).length;
                var html = '<div class="pe-rpt-chart-title">Knowledge Check \u2014 Latest Attempt (' + latest.score + '% \u2014 ' + correct + '/' + answers.length + ' correct)</div>';
                html += '<div class="pe-rpt-qa-list">';
                answers.forEach(function(a, i) {
                    var ok = a.iscorrect;
                    var L  = ['A', 'B', 'C', 'D'];
                    html += '<div class="pe-rpt-qa-item pe-rpt-qa-item--' + (ok ? 'correct' : 'incorrect') + '">';
                    html += '<div class="pe-rpt-qa-icon">' + (ok ? '\u2713' : '\u2717') + '</div>';
                    html += '<div class="pe-rpt-qa-body"><div class="pe-rpt-qa-qtext">Q' + (i + 1) + ': ' + esc(a.qtext || '') + '</div>';
                    html += '<div class="pe-rpt-qa-ans pe-rpt-qa-ans--' + (ok ? 'correct' : 'incorrect') + '">';
                    html += ok ? ('Answered ' + (L[a.selectedidx] || '?') + ' \u2014 Correct!')
                               : ('Answered ' + (L[a.selectedidx] || '?') + ' \u2014 Correct answer: ' + (L[a.correctidx] || '?'));
                    html += '</div></div></div>';
                });
                html += '</div>';
                qaEl.innerHTML = html;
            } else {
                qaEl.innerHTML = '<p class="pe-rpt-nodata">Knowledge check answers recorded for attempts made after the reporting upgrade.</p>';
            }
        }

        // All attempts table
        var attEl = document.getElementById('pe-rpt-attempts-table');
        if (attEl) {
            var html2 = '<div class="pe-rpt-chart-title">All Attempts (' + mine.length + ' total)</div><div class="pe-rpt-table-wrap"><table class="pe-rpt-table"><thead><tr><th>#</th><th>Date</th><th>Score</th><th>Time Taken</th><th>Route</th></tr></thead><tbody>';
            mine.slice().reverse().forEach(function(a, i) {
                var sc = a.score, cls = sc >= 80 ? 'pe-rpt-score--good' : sc >= 60 ? 'pe-rpt-score--ok' : 'pe-rpt-score--low';
                html2 += '<tr><td class="pe-rpt-td-center">' + (mine.length - i) + '</td><td>' + fmtDateTime(a.timecreated) + '</td>'
                    + '<td class="pe-rpt-td-center"><span class="pe-rpt-score-badge ' + cls + '">' + sc + '%</span></td>'
                    + '<td class="pe-rpt-td-center">' + fmtTime(a.timetaken) + '</td>'
                    + '<td class="pe-rpt-td-center">' + esc(a.route || '') + '</td></tr>';
            });
            html2 += '</tbody></table></div>';
            attEl.innerHTML = html2;
        }

        // Student CSV export
        var exportBtn = document.getElementById('pe-rpt-export-student');
        if (exportBtn) {
            exportBtn.onclick = null;
            exportBtn.addEventListener('click', function() {
                var csvRows = [['Date', 'Score%', 'TimeTaken_s', 'Route', 'Slides', 'Questions']];
                mine.forEach(function(a) {
                    csvRows.push([fmtDateTime(a.timecreated), a.score, a.timetaken, a.route, a.slidecount, a.questioncount]);
                    if ((a.slidetimes || []).length) {
                        csvRows.push(['--- Slide Times ---', '', '', '', '', '']);
                        a.slidetimes.forEach(function(st) { csvRows.push(['', st.slidetitle || ('Slide ' + (st.slideidx + 1)), st.timesecs + 's', '', '', '']); });
                    }
                    if ((a.answers || []).length) {
                        csvRows.push(['--- Q&A ---', '', '', '', '', '']);
                        a.answers.forEach(function(ans) { csvRows.push(['', ans.qtext || '', ans.iscorrect ? 'Correct' : 'Incorrect', '', '', '']); });
                    }
                });
                var name = mine[0] ? (mine[0].firstname + '_' + mine[0].lastname).replace(/\s+/g, '_') : 'student';
                downloadCsv('student_report_' + name + '.csv', csvRows);
            });
        }
    }

    // ── AJAX ─────────────────────────────────────────────────────────────────
    function fetchData(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', cfg.ajaxUrl + '?action=get_report_data&cmid=' + cfg.cmid + '&sesskey=' + encodeURIComponent(cfg.sesskey), true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try { callback(null, JSON.parse(xhr.responseText)); }
                    catch(e) { callback('Parse error: ' + e.message); }
                } else {
                    callback('HTTP ' + xhr.status);
                }
            }
        };
        xhr.send(JSON.stringify({}));
    }

    // ── Tabs ─────────────────────────────────────────────────────────────────
    function bindTabs(data) {
        var tabs = document.querySelectorAll('.pe-rpt-tab');
        for (var i = 0; i < tabs.length; i++) {
            (function(tab) {
                tab.addEventListener('click', function() {
                    var target = tab.getAttribute('data-tab');
                    for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('pe-rpt-tab--active');
                    var panels = document.querySelectorAll('.pe-rpt-panel');
                    for (var k = 0; k < panels.length; k++) panels[k].classList.add('pe-rpt-panel--hidden');
                    tab.classList.add('pe-rpt-tab--active');
                    var panel = document.getElementById('pe-rpt-panel-' + target);
                    if (panel) panel.classList.remove('pe-rpt-panel--hidden');
                });
            })(tabs[i]);
        }

        // Student selector
        var sel = document.getElementById('pe-rpt-student-sel');
        if (sel) {
            var users = {};
            (data.attempts || []).forEach(function(a) {
                if (!users[a.userid]) users[a.userid] = {firstname: a.firstname, lastname: a.lastname};
            });
            var sortedIds = Object.keys(users).sort(function(a, b) {
                return (users[a].lastname + users[a].firstname).localeCompare(users[b].lastname + users[b].firstname);
            });
            sel.innerHTML = '<option value="">Select a student\u2026</option>' + sortedIds.map(function(uid) {
                return '<option value="' + uid + '">' + esc(users[uid].firstname + ' ' + users[uid].lastname) + '</option>';
            }).join('');
            sel.addEventListener('change', function() {
                var uid = parseInt(sel.value, 10);
                if (!uid) {
                    var detailEl = document.getElementById('pe-rpt-student-detail');
                    if (detailEl) detailEl.innerHTML = '<p class="pe-rpt-nodata">Select a student above to view their results.</p>';
                    ['pe-rpt-score-trend','pe-rpt-student-slide-times','pe-rpt-qa-detail','pe-rpt-attempts-table','pe-rpt-student-export-row'].forEach(function(id) {
                        var el = document.getElementById(id); if (el) el.style.display = 'none';
                    });
                    return;
                }
                renderStudentReport(data, uid);
            });
        }
    }

    // ── Init ─────────────────────────────────────────────────────────────────
    function init(config) {
        cfg = config || {};
        var loadingEl = document.getElementById('pe-rpt-loading');
        var contentEl = document.getElementById('pe-rpt-content');

        fetchData(function(err, data) {
            if (err || !data || !data.success) {
                if (loadingEl) loadingEl.innerHTML = '<p class="pe-rpt-error">Could not load report data. ' + esc(err || (data && data.error) || 'Unknown error') + '</p>';
                return;
            }
            if (loadingEl) loadingEl.style.display = 'none';
            if (contentEl) contentEl.style.display = '';

            renderClassReport(data);
            bindTabs(data);

            // Auto-select first student alphabetically
            var sel = document.getElementById('pe-rpt-student-sel');
            if (sel && sel.options.length > 1) {
                sel.selectedIndex = 1;
                var uid = parseInt(sel.options[1].value, 10);
                if (uid) renderStudentReport(data, uid);
            }
        });
    }

    return {init: init};
});
/* jshint ignore:end */
