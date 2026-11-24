/**
 * Keys and Code: typing trainer for programmers.
 * Author: LouisNeval
 *
 * What it does: the learner types terminal commands, SQL, code and editor
 * shortcuts, and the page shows the result (terminal output, a nano screen,
 * an editor with breakpoints, a live HTML preview).
 *
 * File map:
 *   lessons.js  all lesson content (data only)
 *   app.js      this file: state, input handling and rendering
 *   style.css   the look of the page
 *
 * Sections of this file:
 *   1. helpers         4. keyboard shortcuts    7. results
 *   2. state, text     5. lessons and sessions  8. rendering
 *   3. storage         6. input handling        9. events and start-up
 */
'use strict';

(() => {
  /* ==========================================================================
     1. Helpers
     ========================================================================== */

  const DRILL_LENGTH = 12; // shortcuts per drill round
  const REVEAL_DELAY_MS = 4000; // hidden keycaps appear after this long
  const EXTRA_CHARS_ALLOWED = 3; // typing past the end of the target is capped

  const $ = (selector) => document.querySelector(selector);

  const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

  const shuffle = (list) => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const formatTime = (totalSeconds) => {
    const seconds = Math.round(totalSeconds);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };

  /* ==========================================================================
     2. State and text
     ========================================================================== */

  const detectPlatform = () => (/Mac/i.test(navigator.platform || navigator.userAgent || '') ? 'mac' : 'win');

  const state = {
    mode: 'term', // which tab is open
    session: null, // the lesson being played
    showKeys: true, // show keycaps right away, or only after a pause
    lastLesson: {}, // last opened lesson per tab
    platform: detectPlatform(),
  };

  const isMac = () => state.platform === 'mac';

  const TEXT = {
    subtitle: 'Typing trainer for programmers: terminal, SQL, editor, code.',
    banner: 'You are typing non-Latin letters. Switch your keyboard layout to English.',
    coarse: 'You need a physical keyboard. This does not work on a phone or tablet.',
    footerWin:
      'Shortcuts come from Visual Studio for Windows. If the browser steals a shortcut, press Esc to skip the step. ' +
      'Terminal lessons write files with nano, which comes with Git Bash and WSL.',
    footerMac:
      'On Mac the shortcuts follow VS Code, because Visual Studio for Mac was retired. Alt is Option, Ctrl is Control. ' +
      'On a MacBook hold fn with F1-F12. If the browser steals a shortcut, press Esc to skip.',
    lessons: 'Lessons',
    best: 'best',
    time: 'Time',
    speed: 'Speed, WPM',
    rate: 'Shortcuts/min',
    accuracy: 'Accuracy',
    errors: 'Errors',
    restart: 'Restart',
    next: 'Next lesson',
    skip: 'Skip',
    showKeys: 'Show keys',
    clickToFocus: 'Click the window and start typing.',
    done: 'Done',
    lowAccuracy: 'Accuracy is below 95%. Type cleanly first, speed will follow.',
    goodAccuracy: 'Accuracy is above 95%. You can speed up.',
    slowest: 'Slowest to find:',
    step: 'Step',
    of: 'of',
    shortcut: 'Shortcut',
    escSkips: 'Esc skips the shortcut.',
    terminal: 'Command line',
    output: 'Output',
    characters: 'characters',
    macNote: 'Mac: VS Code keymap is used.',
    howTerminal:
      'Type the commands like in a real terminal. Enter sends a line, Backspace deletes a character. ' +
      'Files are written with nano: Ctrl+O saves, Enter confirms, Ctrl+X exits.',
    howSql: 'Type whole queries, with the semicolon. Keywords are uppercase, so watch your Shift key.',
    howDrill:
      'Press the shortcut you are asked for. Layout does not matter. For two-part shortcuts, press the parts one after another.',
    howEditor: 'Type text and press shortcuts like in a real editor. Indentation after Enter is added for you.',
    howEmmet: 'Emmet is built into VS Code: type a short abbreviation, press Tab, get ready-made markup.',
    howCode: 'Type the whole snippet. Indentation is added for you: after Enter just type the line text.',
  };

  const MODES = [
    { id: 'term', label: 'Terminal' },
    { id: 'sql', label: 'SQL' },
    { id: 'vs', label: 'Visual Studio' },
    { id: 'code', label: 'Code' },
  ];

  /* ==========================================================================
     3. Storage (best results and preferences, kept in the browser)
     ========================================================================== */

  const storage = {
    read(name, fallback) {
      try {
        return JSON.parse(localStorage.getItem(name)) ?? fallback;
      } catch {
        return fallback;
      }
    },
    write(name, value) {
      try {
        localStorage.setItem(name, JSON.stringify(value));
      } catch {
        /* Storage can be blocked. The trainer works fine without it. */
      }
    },
  };

  const bestResults = storage.read('kk-best', {});
  const savedPrefs = storage.read('kk-prefs', {});
  if (savedPrefs.platform) state.platform = savedPrefs.platform;

  /* Terminal and editor lessons differ per system, so their records are kept per system. */
  const bestKey = (lesson) => (lesson.mode === 'term' || lesson.mode === 'vs' ? `${lesson.id}|${state.platform}` : lesson.id);

  /* ==========================================================================
     4. Keyboard shortcuts: parsing and matching
     ========================================================================== */

  const KEY_CODES = {
    Tab: 'Tab', Enter: 'Enter', Space: 'Space', Esc: 'Escape',
    Up: 'ArrowUp', Down: 'ArrowDown', Left: 'ArrowLeft', Right: 'ArrowRight',
    Home: 'Home', End: 'End',
    '.': 'Period', ',': 'Comma', '-': 'Minus', '`': 'Backquote', '/': 'Slash',
  };

  const KEY_LABELS = { Up: '↑', Down: '↓', Left: '←', Right: '→' };
  const MAC_KEY_LABELS = {
    Cmd: '⌘ Cmd', Alt: '⌥ Option', Shift: '⇧ Shift', Ctrl: '⌃ Control', Enter: '↩ Return', Tab: '⇥ Tab',
  };

  const MODIFIER_CODE = /^(Control|Shift|Alt|Meta|OS|CapsLock|AltGraph)/;

  const keyLabel = (part) => (isMac() && MAC_KEY_LABELS[part]) || KEY_LABELS[part] || part;

  /**
   * "Ctrl+K Ctrl+C" becomes two combos. Each combo remembers its modifiers and the
   * physical key (event.code), so keyboard layout does not matter.
   */
  const parseShortcut = (spec, forMac) =>
    spec.split(' ').map((chord) => {
      const parts = chord.split('+');
      const combo = { ctrl: false, cmd: false, shift: false, alt: false, code: '', parts, forMac };
      for (const part of parts) {
        if (part === 'Ctrl') combo.ctrl = true;
        else if (part === 'Cmd') combo.cmd = true;
        else if (part === 'Shift') combo.shift = true;
        else if (part === 'Alt') combo.alt = true;
        else if (/^[A-Z]$/.test(part)) combo.code = `Key${part}`;
        else if (/^[0-9]$/.test(part)) combo.code = `Digit${part}`;
        else if (/^F\d+$/.test(part)) combo.code = part;
        else combo.code = KEY_CODES[part] ?? part;
      }
      return combo;
    });

  const matchesCombo = (event, combo) => {
    if (event.shiftKey !== combo.shift || event.altKey !== combo.alt || event.code !== combo.code) return false;
    // On Mac, Cmd and Control are different keys. On Windows, Ctrl (or Cmd) counts as Ctrl.
    if (combo.forMac) return event.metaKey === combo.cmd && event.ctrlKey === combo.ctrl;
    return (event.ctrlKey || event.metaKey) === combo.ctrl;
  };

  /* ==========================================================================
     5. Lessons and sessions
     ========================================================================== */

  const toCodeLesson = ({ id, title, tag, lines }) => ({
    id,
    mode: 'code',
    kind: 'code',
    title,
    tag,
    how: TEXT.howCode,
    items: [
      {
        kind: 'type',
        submit: false,
        hint: '',
        text: lines.map((line) => line.trimStart()).join('\n'),
        indents: lines.map((line) => line.length - line.trimStart().length),
      },
    ],
  });

  const LESSONS = [
    ...TERMINAL_LESSONS.map(({ id, title, tag, steps }) => ({
      id: `t-${id}`, mode: 'term', kind: 'term', title, tag, how: TEXT.howTerminal, items: steps,
    })),
    ...SQL_LESSONS.map(({ id, title, tag, steps }) => ({
      id: `q-${id}`, mode: 'sql', kind: 'sql', title, tag, how: TEXT.howSql, items: steps,
    })),
    { id: 'v-drill', mode: 'vs', kind: 'drill', title: 'Shortcut drill', tag: String(DRILL_LENGTH), how: TEXT.howDrill },
    ...EDITOR_LESSONS.map((lesson) => ({
      ...lesson, mode: 'vs', kind: 'vs', how: lesson.view ? TEXT.howEmmet : TEXT.howEditor,
    })),
    ...CODE_SNIPPETS.map(toCodeLesson),
  ];

  /** Picks the Windows or Mac text and prepares shortcut combos. */
  const resolveItem = (raw) => {
    const mac = isMac();
    if (raw.kind === 'keys') {
      const keys = mac ? raw.mac : raw.win;
      return { ...raw, keys, combos: parseShortcut(keys, mac) };
    }
    if (raw.win !== undefined) {
      return { ...raw, text: mac ? raw.mac : raw.win, out: mac ? raw.macOut : raw.out };
    }
    return raw;
  };

  const buildDrillItems = () => {
    const seen = new Set();
    const unique = SHORTCUTS.filter((entry) => {
      const spec = isMac() ? entry.mac : entry.win;
      if (seen.has(spec)) return false;
      seen.add(spec);
      return true;
    });
    return shuffle(unique)
      .slice(0, DRILL_LENGTH)
      .map((entry) => resolveItem({ kind: 'keys', hint: entry.action, win: entry.win, mac: entry.mac }));
  };

  /** All the changing data of one playthrough of a lesson. */
  const createSession = (lesson) => ({
    lesson,
    items: lesson.kind === 'drill' ? buildDrillItems() : lesson.items.map(resolveItem),
    index: 0, // current step
    typed: '', // what was typed in the current step
    chord: 0, // how many parts of a shortcut are already pressed
    startedAt: null,
    endedAt: null,
    correct: 0,
    total: 0,
    errors: 0,
    typedOk: 0, // correct characters, used for WPM
    history: [], // finished terminal lines
    cwd: '', // current folder shown in the prompt
    files: {}, // files saved with nano
    nano: null, // the nano screen, while it is open
    base: lesson.base ?? '', // editor text, "|" marks the caret
    output: '',
    toast: '',
    breakpoints: [],
    currentLine: 0,
    panel: null, // extra panel under the editor (Locals, References...)
    flash: false,
    done: false,
    times: [], // time spent on each shortcut
    stepStart: 0,
    revealed: false,
    revealTimer: null,
  });

  const enterStep = (session) => {
    session.stepStart = Date.now();
    session.revealed = false;
    clearTimeout(session.revealTimer);
    const item = session.items[session.index];
    if (item?.kind === 'keys' && !state.showKeys) {
      session.revealTimer = setTimeout(() => {
        if (state.session === session && !session.done) {
          session.revealed = true;
          renderStage();
        }
      }, REVEAL_DELAY_MS);
    }
  };

  const selectLesson = (id) => {
    const lesson = LESSONS.find((candidate) => candidate.id === id);
    if (!lesson) return;
    if (state.session) clearTimeout(state.session.revealTimer);
    state.mode = lesson.mode;
    state.lastLesson[lesson.mode] = id;
    state.session = createSession(lesson);
    enterStep(state.session);
    renderChrome();
    renderSidebar();
    renderStage();
  };

  /* ==========================================================================
     6. Input handling
     ========================================================================== */

  const startClock = (session) => {
    if (!session.startedAt) session.startedAt = Date.now();
  };

  const promptOf = (session) => {
    if (session.lesson.kind === 'sql') return 'sql> ';
    return isMac() ? `~/dev${session.cwd} % ` : `C:\\dev${session.cwd}> `;
  };

  /** Inserts text at the "|" caret marker and keeps the indentation of that line. */
  const insertAtCaret = (base, text) => {
    const caret = base.indexOf('|');
    if (caret < 0) return base + text;
    const before = base.slice(0, caret);
    const after = base.slice(caret + 1);
    const indent = before.slice(before.lastIndexOf('\n') + 1).match(/^ */)[0];
    return `${before}${text.replace(/\n/g, `\n${indent}`)}|${after}`;
  };

  const advance = (session) => {
    session.index += 1;
    session.typed = '';
    session.chord = 0;
    if (session.index >= session.items.length) finish(session);
    else enterStep(session);
    renderStage();
  };

  const completeTyping = (session, item) => {
    const { kind } = session.lesson;
    if (item.nano) {
      session.nano.text += item.text;
      session.nano.saved = false;
    } else if (kind === 'term' || kind === 'sql') {
      const output = item.catFile ? (session.files[item.catFile] ?? '') : item.out;
      session.history.push({ prompt: promptOf(session), text: item.text, output });
      if (item.cd) session.cwd += (isMac() ? '/' : '\\') + item.cd;
      if (item.openNano) {
        session.nano = { file: item.openNano, text: '', prompting: false, saved: true, message: '' };
      }
    } else if (kind === 'vs') {
      session.base = insertAtCaret(session.base, item.text);
    }
    advance(session);
  };

  /** What a shortcut does to the nano screen. */
  const applyNanoEffects = (session, item) => {
    const { nano } = session;
    if (!nano) return;
    if (item.nanoPrompt) nano.prompting = true;
    if (item.nanoSave) {
      nano.prompting = false;
      nano.saved = true;
      session.files[nano.file] = nano.text;
      const lineCount = nano.text.split('\n').length;
      nano.message = `[ Wrote ${lineCount} ${lineCount === 1 ? 'line' : 'lines'} ]`;
    }
    if (item.nanoExit) session.nano = null;
  };

  /** What a shortcut does on screen: editor text, highlights, panels, output. */
  const applyEffects = (session, item) => {
    if (item.set !== undefined) session.base = item.set;
    if (item.breakpoints !== undefined) session.breakpoints = item.breakpoints;
    if (item.currentLine !== undefined) session.currentLine = item.currentLine;
    if (item.panel !== undefined) session.panel = item.panel;
    session.toast = item.toast ?? '';
    if (item.out) session.output += (session.output ? '\n' : '') + item.out;
    applyNanoEffects(session, item);
  };

  const completeShortcut = (session, item, skipped) => {
    if (!skipped) session.times.push({ action: item.hint, seconds: (Date.now() - session.stepStart) / 1000 });
    applyEffects(session, item);
    advance(session);
  };

  const addCharacter = (session, item, char) => {
    if (session.typed.length >= item.text.length + EXTRA_CHARS_ALLOWED) {
      session.flash = true;
      renderStage();
      return;
    }
    startClock(session);
    const isCorrect = item.text.startsWith(session.typed) && item.text[session.typed.length] === char;
    session.total += 1;
    if (isCorrect) {
      session.correct += 1;
      session.typedOk += 1;
    } else {
      session.errors += 1;
    }
    session.typed += char;
    if (!item.submit && session.typed === item.text) completeTyping(session, item);
    else renderStage();
  };

  const handleTypedKey = (event, session, item) => {
    const { key } = event;

    if (key === 'Backspace') {
      event.preventDefault();
      const deleteWord = event.ctrlKey || event.altKey;
      session.typed = deleteWord ? session.typed.replace(/\S*\s*$/, '') : session.typed.slice(0, -1);
      renderStage();
      return;
    }

    if (key === 'Enter') {
      event.preventDefault();
      if (!item.submit) {
        addCharacter(session, item, '\n');
        return;
      }
      // A terminal line is only accepted when it is exactly right.
      startClock(session);
      session.total += 1;
      if (session.typed === item.text) {
        session.correct += 1;
        session.typedOk += 1;
        completeTyping(session, item);
      } else {
        session.errors += 1;
        session.flash = true;
        renderStage();
      }
      return;
    }

    if (key.length === 1) {
      const isShortcut = (event.ctrlKey || event.metaKey) && !event.getModifierState('AltGraph');
      if (isShortcut) return; // leave browser shortcuts alone while typing
      event.preventDefault();
      if (/[\u0400-\u04FF]/.test(key)) {
        $('#banner').textContent = TEXT.banner;
        $('#banner').hidden = false;
        return;
      }
      $('#banner').hidden = true;
      addCharacter(session, item, key);
    }
  };

  const handleShortcutKey = (event, session, item) => {
    if (MODIFIER_CODE.test(event.code)) return; // pressing Ctrl alone is not an attempt
    event.preventDefault();
    if (event.code === 'Escape') {
      completeShortcut(session, item, true);
      return;
    }
    startClock(session);
    session.total += 1;
    if (matchesCombo(event, item.combos[session.chord])) {
      session.correct += 1;
      session.chord += 1;
      if (session.chord >= item.combos.length) completeShortcut(session, item, false);
      else renderStage();
    } else {
      session.errors += 1;
      session.flash = true;
      // A wrong key may still be the start of the shortcut.
      session.chord = matchesCombo(event, item.combos[0]) ? 1 : 0;
      renderStage();
    }
  };

  window.addEventListener(
    'keydown',
    (event) => {
      const session = state.session;
      if (!session || session.done || event.isComposing) return;
      const item = session.items[session.index];
      if (!item) return;
      if (item.kind === 'keys') handleShortcutKey(event, session, item);
      else handleTypedKey(event, session, item);
    },
    true,
  );

  /* ==========================================================================
     7. Results
     ========================================================================== */

  const calculateStats = (session) => {
    const end = session.endedAt ?? Date.now();
    const seconds = session.startedAt ? (end - session.startedAt) / 1000 : 0;
    const minutes = seconds / 60;
    const isDrill = session.lesson.kind === 'drill';
    const units = isDrill ? session.times.length : session.typedOk / 5; // 5 characters = 1 word
    return {
      seconds,
      speed: minutes > 0.02 ? Math.round(units / minutes) : 0,
      accuracy: session.total ? Math.round((100 * session.correct) / session.total) : 100,
      errors: session.errors,
    };
  };

  const finish = (session) => {
    session.done = true;
    session.endedAt = Date.now();
    clearTimeout(session.revealTimer);
    if (session.startedAt) {
      const stats = calculateStats(session);
      const key = bestKey(session.lesson);
      const best = bestResults[key] ?? {};
      if (!best.speed || stats.speed > best.speed) best.speed = stats.speed;
      if (!best.seconds || stats.seconds < best.seconds) best.seconds = stats.seconds;
      bestResults[key] = best;
      storage.write('kk-best', bestResults);
    }
    renderSidebar();
  };

  /* ==========================================================================
     8. Rendering
     ========================================================================== */

  /* ---- page chrome ---- */

  const renderChrome = () => {
    $('#sub').textContent = TEXT.subtitle;
    $('#coarse').textContent = TEXT.coarse;
    $('#foot').textContent = isMac() ? TEXT.footerMac : TEXT.footerWin;
    $('#seg-plat').innerHTML = [['win', 'Windows'], ['mac', 'Mac']]
      .map(([id, label]) => `<button type="button" data-platform="${id}" aria-pressed="${state.platform === id}">${label}</button>`)
      .join('');
    $('#tabs').innerHTML = MODES.map(
      ({ id, label }) => `<button type="button" role="tab" data-mode="${id}" aria-selected="${state.mode === id}">${label}</button>`,
    ).join('');
  };

  const renderSidebar = () => {
    const current = state.session?.lesson.id;
    const note = state.mode === 'vs' && isMac() ? `<div class="platnote">${TEXT.macNote}</div>` : '';
    const buttons = LESSONS.filter((lesson) => lesson.mode === state.mode)
      .map((lesson) => {
        const best = bestResults[bestKey(lesson)];
        const record = best ? `<small>${TEXT.best}: ${best.speed} WPM · ${formatTime(best.seconds)}</small>` : '';
        return `<button type="button" class="lesson" data-lesson="${lesson.id}"${lesson.id === current ? ' aria-current="true"' : ''}>
          <b>${escapeHtml(lesson.title)}</b><span class="tag">${escapeHtml(lesson.tag)}</span>${record}</button>`;
      })
      .join('');
    $('#side').innerHTML = `<h2>${TEXT.lessons}</h2>${note}${buttons}`;
  };

  /* ---- text that is being typed: green = right, red = wrong, amber block = next ---- */

  const renderTyped = (target, typed, indents) => {
    const indentSpan = (line) => (indents?.[line] ? `<span class="ind" style="width:${indents[line]}ch"></span>` : '');
    let html = indentSpan(0);
    let line = 0;
    const length = Math.max(target.length, typed.length);

    for (let i = 0; i < length; i++) {
      const expected = target[i];
      const got = typed[i];
      let cls;
      let char;
      if (i < typed.length) {
        cls = expected === undefined || got !== expected ? 'bad' : 'ok';
        char = expected === undefined ? got : expected;
      } else {
        cls = i === typed.length ? 'pend cur' : 'pend';
        char = expected;
      }
      if (char === '\n') {
        html += `<span class="c ${cls} nl">↵</span><br>`;
        line += 1;
        html += indentSpan(line);
      } else {
        html += `<span class="c ${cls}">${escapeHtml(char)}</span>`;
      }
    }
    if (typed.length >= target.length) html += '<span class="c cur"> </span>';
    return html;
  };

  /* ---- keycaps ---- */

  const renderKeycaps = (session, item) => {
    const visible = state.showKeys || session.revealed;
    const groups = item.combos.map((combo, index) => {
      const caps = visible
        ? combo.parts.map((part) => `<kbd>${escapeHtml(keyLabel(part))}</kbd>`).join('<b>+</b>')
        : '<kbd class="mask">?</kbd>';
      return `<span class="grp${index < session.chord ? ' done' : ''}">${caps}</span>`;
    });
    return `<div class="caps">${groups.join('<em>then</em>')}</div>`;
  };

  const renderStats = (session) => {
    const stats = calculateStats(session);
    const isDrill = session.lesson.kind === 'drill';
    return `
      <div class="stat"><span>${TEXT.time}</span><b>${formatTime(stats.seconds)}</b></div>
      <div class="stat"><span>${isDrill ? TEXT.rate : TEXT.speed}</span><b>${stats.speed}</b></div>
      <div class="stat"><span>${TEXT.accuracy}</span><b>${stats.accuracy}%</b></div>
      <div class="stat"><span>${TEXT.errors}</span><b>${stats.errors}</b></div>`;
  };

  const renderStepBar = (session, item) => `
    <div class="task">
      <span class="step">${TEXT.step} ${session.index + 1} ${TEXT.of} ${session.items.length}</span>
      <span class="hint">${escapeHtml(item.hint)}</span>
    </div>`;

  const shakeClass = (session) => (session.flash ? ' shake' : '');

  /* ---- terminal and SQL ---- */

  const renderTerminal = (session) => {
    const item = session.items[session.index];
    if (session.nano) return renderNano(session, item);

    const isSql = session.lesson.kind === 'sql';
    let intro = 'Microsoft Windows [Version 10.0.22631.4460]';
    if (isSql) intro = 'SQLite version 3.45.1\nEnter ".help" for usage hints.';
    else if (isMac()) intro = 'Last login: Sat Nov 21 13:49:02 on ttys001';

    const finishedLines = session.history
      .map(({ prompt, text, output }) => {
        const result = output ? `<div class="outp">${escapeHtml(output)}</div>` : '';
        return `<span class="ln"><span class="pr">${escapeHtml(prompt)}</span>${escapeHtml(text)}</span>${result}`;
      })
      .join('');
    const currentLine = `<span class="ln"><span class="pr">${escapeHtml(promptOf(session))}</span>${renderTyped(item.text, session.typed, null)}</span>`;

    let title = TEXT.terminal;
    if (isSql) title = 'sqlite3 shop.db';
    else if (isMac()) title = 'Terminal, zsh';

    return `${renderStepBar(session, item)}${renderStepKeys(session, item)}
      <div class="term${shakeClass(session)}">
        <div class="bar"><i></i><i></i><i></i><span>${title}</span></div>
        <div class="body" id="tbody"><div class="dim">${escapeHtml(intro)}</div>\n${finishedLines}${currentLine}</div>
      </div>`;
  };

  /** Keycaps for a shortcut step inside a terminal lesson (Ctrl+O, Enter, Ctrl+X in nano). */
  const renderStepKeys = (session, item) =>
    item.kind === 'keys' ? `<div class="panel keystep${shakeClass(session)}">${renderKeycaps(session, item)}</div>` : '';

  /* ---- nano ---- */

  const NANO_SHORTCUTS = [
    ['^G', 'Help'], ['^O', 'Write Out'], ['^W', 'Where Is'], ['^K', 'Cut'], ['^T', 'Execute'], ['^C', 'Location'],
    ['^X', 'Exit'], ['^R', 'Read File'], ['^\\', 'Replace'], ['^U', 'Paste'], ['^J', 'Justify'], ['^/', 'Go To Line'],
  ];

  const renderNano = (session, item) => {
    const { nano } = session;
    const body = item.kind === 'type' && item.nano
      ? `${escapeHtml(nano.text)}${renderTyped(item.text, session.typed, null)}`
      : `${escapeHtml(nano.text)}<span class="c cur"> </span>`;
    const status = nano.prompting ? `File Name to Write: ${nano.file}` : nano.message;
    const modified = nano.saved ? '' : 'Modified';
    const legend = NANO_SHORTCUTS.map(([keys, label]) => `<span><b>${escapeHtml(keys)}</b>${label}</span>`).join('');

    return `${renderStepBar(session, item)}${renderStepKeys(session, item)}
      <div class="nano${shakeClass(session)}">
        <div class="nano-top"><span>GNU nano 7.2</span><span>${escapeHtml(nano.file)}</span><span>${modified}</span></div>
        <div class="nano-text" id="tbody">${body}</div>
        <div class="nano-status">${escapeHtml(status)}</div>
        <div class="nano-keys">${legend}</div>
      </div>`;
  };

  /* ---- code snippets ---- */

  const renderCodeSnippet = (session) => {
    const item = session.items[0];
    const progress = `${Math.min(session.typed.length, item.text.length)} / ${item.text.length} ${TEXT.characters}`;
    return `<div class="term${shakeClass(session)}">
      <div class="bar"><i></i><i></i><i></i><span>${escapeHtml(session.lesson.tag)} · ${progress}</span></div>
      <div class="body" id="tbody">${renderTyped(item.text, session.typed, item.indents)}</div>
    </div>`;
  };

  /* ---- editor (Visual Studio lessons) ---- */

  /** The editor: line numbers, breakpoints, the current line and the caret. */
  const renderEditor = (session, item) => {
    const { base } = session;
    const caret = base.indexOf('|');
    const before = caret < 0 ? base : base.slice(0, caret);
    const after = caret < 0 ? '' : base.slice(caret + 1);

    // Text that is being typed right now is shown in colour, right at the caret.
    let live = '';
    if (item.kind === 'type' && caret >= 0) {
      const indent = before.slice(before.lastIndexOf('\n') + 1).match(/^ */)[0];
      for (let i = 0; i < session.typed.length; i++) {
        const char = session.typed[i];
        live += char === '\n' ? `\n${indent}` : `<span class="${char === item.text[i] ? 'ok' : 'bad'}">${escapeHtml(char)}</span>`;
      }
    }

    const lines = `${escapeHtml(before)}${live}${caret >= 0 ? '<span class="caret"></span>' : ''}${escapeHtml(after)}`.split('\n');
    const gutter = lines
      .map((_, index) => {
        const number = index + 1;
        const dot = session.breakpoints.includes(number) ? '<i class="bp"></i>' : '';
        const arrow = session.currentLine === number ? '<i class="arrow">&#9654;</i>' : '';
        return `<span class="gl">${dot}${arrow}${number}</span>`;
      })
      .join('');
    const code = lines
      .map((line, index) => `<span class="cl${session.currentLine === index + 1 ? ' cur' : ''}">${line || ' '}</span>`)
      .join('');
    return `<div class="vs-ed"><div class="gut">${gutter}</div><div class="code">${code}</div></div>`;
  };

  /** Live preview for the Emmet lessons: the page, the styled boxes, or the loaded files. */
  const renderPreview = (session) => {
    const { lesson } = session;
    const source = session.base.replace('|', '');
    let content;

    if (lesson.view === 'html') {
      const bodyMatch = source.match(/<body>([\s\S]*?)<\/body>/);
      const body = (bodyMatch ? bodyMatch[1] : source).replace(/<script[\s\S]*?<\/script>|<link[^>]*>/gi, '');
      content = `<div class="pv">${body.trim() ? body : '<span class="empty">Empty page: nothing to show yet</span>'}</div>`;
    } else if (lesson.view === 'css') {
      content = `<style>
        .pv .box{width:70%;min-height:130px;outline:1px dashed #9aa3b5;font-family:system-ui,sans-serif}
        .pv .box span{background:#cfd8ff;padding:10px 14px;margin:4px;border-radius:6px;color:#16204a;font-weight:600}
        ${source.replace(/\.box/g, '.pv .box')}
      </style><div class="pv"><div class="box"><span>A</span><span>B</span><span>C</span></div></div>`;
    } else {
      const files = [
        ...[...source.matchAll(/<link[^>]*href="([^"]*)"[^>]*>/g)].map((match) => ['stylesheet', match[1]]),
        ...[...source.matchAll(/<script[^>]*src="([^"]*)"[^>]*>/g)].map((match) => ['script', match[1]]),
      ];
      const rows = files.map(([type, name]) => `<div class="res"><b>${type}</b> ${escapeHtml(name || '(no file name yet)')}</div>`);
      content = `<div class="pv">${rows.length ? rows.join('') : '<span class="empty">The page loads nothing extra yet</span>'}</div>`;
    }

    const title = lesson.view === 'head' ? 'Files the browser loads' : 'Result in the browser';
    return `<div class="vs-out"><div class="h">${title}</div>${content}</div>`;
  };

  const renderEditorLesson = (session) => {
    const { lesson } = session;
    const item = session.items[session.index];
    const task =
      item.kind === 'type'
        ? `${renderStepBar(session, item)}<div class="term mini${shakeClass(session)}"><div class="body">${renderTyped(item.text, session.typed, null)}</div></div>`
        : `${renderStepBar(session, item)}<div class="panel keystep${shakeClass(session)}">${renderKeycaps(session, item)}</div>`;

    let panes = '';
    if (session.panel) {
      panes += `<div class="vs-out"><div class="h">${escapeHtml(session.panel.title)}</div><pre>${escapeHtml(session.panel.text)}</pre></div>`;
    }
    if (lesson.view) panes += renderPreview(session);
    else if (!lesson.noOutput) panes += `<div class="vs-out"><div class="h">${TEXT.output}</div><pre>${escapeHtml(session.output)}</pre></div>`;

    return `${task}<div class="vs">
      <div class="vs-bar"><span class="tab">${escapeHtml(lesson.file)}</span><span class="toast">${escapeHtml(session.toast)}</span></div>
      ${renderEditor(session, item)}${panes}</div>`;
  };

  /* ---- shortcut drill ---- */

  const renderDrill = (session) => {
    const item = session.items[session.index];
    const progress = Math.round((100 * session.index) / session.items.length);
    return `<div class="panel drill${shakeClass(session)}">
      <div class="prog"><i style="width:${progress}%"></i></div>
      <div class="dnote">${TEXT.shortcut} ${session.index + 1} ${TEXT.of} ${session.items.length}</div>
      <div class="ddesc">${escapeHtml(item.hint)}</div>
      ${renderKeycaps(session, item)}
      <div class="dnote">${TEXT.escSkips}</div>
    </div>`;
  };

  /* ---- results screen ---- */

  const renderResults = (session) => {
    const stats = calculateStats(session);
    const isDrill = session.lesson.kind === 'drill';
    let slowest = '';
    if (isDrill) {
      const rows = [...session.times]
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 3)
        .map(({ action, seconds }) => `<li><b>${escapeHtml(action)}</b> · ${seconds.toFixed(1)} s</li>`)
        .join('');
      slowest = `<div><b>${TEXT.slowest}</b><ol class="slow">${rows}</ol></div>`;
    }
    return `<div class="panel result">
      <h3>${TEXT.done}</h3>
      <div class="tiles">
        <div class="tile"><span>${TEXT.time}</span><b>${formatTime(stats.seconds)}</b></div>
        <div class="tile"><span>${isDrill ? TEXT.rate : 'WPM'}</span><b>${stats.speed}</b></div>
        <div class="tile"><span>${TEXT.accuracy}</span><b>${stats.accuracy}%</b></div>
        <div class="tile"><span>${TEXT.errors}</span><b>${stats.errors}</b></div>
      </div>
      <div class="dnote">${stats.accuracy < 95 ? TEXT.lowAccuracy : TEXT.goodAccuracy}</div>
      ${slowest}
      <div class="actions">
        <button type="button" class="btn main" data-action="restart">${TEXT.restart}</button>
        <button type="button" class="btn" data-action="next">${TEXT.next}</button>
      </div>
    </div>`;
  };

  /* ---- the main area ---- */

  const renderBody = (session) => {
    if (session.done) return renderResults(session);
    switch (session.lesson.kind) {
      case 'term':
      case 'sql':
        return renderTerminal(session);
      case 'code':
        return renderCodeSnippet(session);
      case 'vs':
        return renderEditorLesson(session);
      default:
        return renderDrill(session);
    }
  };

  const renderStage = () => {
    const session = state.session;
    if (!session) return;
    const { lesson } = session;
    const item = session.items[session.index];

    const hasShortcutSteps = lesson.kind === 'drill' || session.items.some((step) => step.kind === 'keys');
    const keysToggle = hasShortcutSteps
      ? `<label><input type="checkbox" id="show-keys"${state.showKeys ? ' checked' : ''}> ${TEXT.showKeys}</label>`
      : '';
    const skipButton = !session.done && item?.kind === 'keys' ? `<button type="button" data-action="skip">${TEXT.skip}</button>` : '';
    const focusNote = !session.startedAt && !session.done ? `<div class="focus-note">${TEXT.clickToFocus}</div>` : '';

    $('#stage').innerHTML = `
      <div class="head">
        <div><h2>${escapeHtml(lesson.title)}</h2><p>${escapeHtml(lesson.how)}</p></div>
        <div class="ctl">${keysToggle}${skipButton}<button type="button" data-action="restart">${TEXT.restart}</button></div>
      </div>
      <div class="stats" id="stats">${renderStats(session)}</div>
      ${focusNote}${renderBody(session)}`;

    const scrollArea = $('#tbody');
    if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
    session.flash = false;
  };

  /* ==========================================================================
     9. Events and start-up
     ========================================================================== */

  document.addEventListener('click', (event) => {
    // Links inside the HTML preview are only for show.
    if (event.target.closest('.pv')) {
      event.preventDefault();
      return;
    }
    const button = event.target.closest('button');
    if (!button) return;
    const { mode, lesson, platform, action } = button.dataset;

    if (mode) {
      selectLesson(state.lastLesson[mode] ?? LESSONS.find((candidate) => candidate.mode === mode).id);
    } else if (lesson) {
      selectLesson(lesson);
    } else if (platform) {
      state.platform = platform;
      storage.write('kk-prefs', { platform });
      selectLesson(state.session.lesson.id); // restart: commands and shortcuts differ per system
    } else if (action === 'restart') {
      selectLesson(state.session.lesson.id);
    } else if (action === 'next') {
      const sameMode = LESSONS.filter((candidate) => candidate.mode === state.mode);
      const position = sameMode.findIndex((candidate) => candidate.id === state.session.lesson.id);
      selectLesson(sameMode[(position + 1) % sameMode.length].id);
    } else if (action === 'skip') {
      const { session } = state;
      const item = session.items[session.index];
      if (item?.kind === 'keys') completeShortcut(session, item, true);
    }
    document.activeElement?.blur?.(); // keep Space and Enter from clicking the button again
  });

  document.addEventListener('change', (event) => {
    if (event.target.id !== 'show-keys') return;
    state.showKeys = event.target.checked;
    if (state.session) enterStep(state.session);
    renderStage();
    event.target.blur();
  });

  // The clock in the stats row keeps running between key presses.
  setInterval(() => {
    const session = state.session;
    const stats = $('#stats');
    if (session && stats && session.startedAt && !session.done) stats.innerHTML = renderStats(session);
  }, 500);

  selectLesson('t-py');
})();
