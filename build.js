#!/usr/bin/env node
/*
 * build.js — assembles the single-file, zero-dependency log-viewer.html
 * from the editable sources in src/.
 *
 *   node build.js
 *
 * It inlines src/styles.css and concatenates every src/js/*.js fragment (in
 * filename order) into the IIFE inside src/index.html. No npm dependencies,
 * no transpiling — the output stays byte-for-byte a hand-written single file
 * that opens straight from file://.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const JS_DIR = path.join(SRC, 'js');
const OUT = path.join(ROOT, 'log-viewer.html');

function read(p) { return fs.readFileSync(p, 'utf8'); }

const tpl = read(path.join(SRC, 'index.html'));
const nl = tpl.indexOf('\r\n') >= 0 ? '\r\n' : '\n';

const css = read(path.join(SRC, 'styles.css')).replace(/\r?\n$/, '');

const fragments = fs.readdirSync(JS_DIR)
  .filter(f => f.endsWith('.js'))
  .sort();
if (!fragments.length) throw new Error('no js fragments found in ' + JS_DIR);

const script = fragments
  .map(f => read(path.join(JS_DIR, f)).replace(/\r?\n$/, ''))
  .join(nl + nl);

const STYLE_MARK = '/*@build:styles@*/';
const SCRIPT_MARK = '/*@build:script@*/';
if (tpl.indexOf(STYLE_MARK) < 0) throw new Error('missing ' + STYLE_MARK + ' in src/index.html');
if (tpl.indexOf(SCRIPT_MARK) < 0) throw new Error('missing ' + SCRIPT_MARK + ' in src/index.html');

const out = tpl
  .replace(STYLE_MARK, () => css)
  .replace(SCRIPT_MARK, () => script);

fs.writeFileSync(OUT, out);

const kb = (Buffer.byteLength(out, 'utf8') / 1024).toFixed(1);
console.log('built log-viewer.html  (' + fragments.length + ' js fragments, ' + kb + ' KB)');
