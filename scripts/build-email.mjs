#!/usr/bin/env node
/**
 * Builds a cabin-background email HTML file for a chronicle.
 *
 * Usage:
 *   node scripts/build-email.mjs geography-distance
 *   node scripts/build-email.mjs geography-distance --week 2026-11-17
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const SITE_URL = process.env.SITE_URL || 'https://jmaret.github.io/AThoughtfulHermit';
const BG_URL = `${SITE_URL}/images/AThoughtFulHermit.jpg`;
const LOGO_URL = `${SITE_URL}/images/TransparentMasterLogo.png`;

function loadChronicles() {
  const source = fs.readFileSync(path.join(root, 'chronicles.js'), 'utf8');
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${source}\nthis.CHRONICLES = CHRONICLES;`, context);
  return context.CHRONICLES;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function wrapCabinEmail(innerCardHtml, preheader = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AThoughtfulHermit</title>
</head>
<body style="margin:0;padding:0;background-color:#1c1612;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#1c1612;">
    <tr>
      <td align="center" background="${BG_URL}" bgcolor="#1c1612" style="background-color:#1c1612;background-image:url('${BG_URL}');background-size:cover;background-position:center;padding:28px 16px;">
        <!--[if gte mso 9]>
        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:640px;">
          <v:fill type="frame" src="${BG_URL}" color="#1c1612" />
          <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
        <![endif]-->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;margin:0 auto;">
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <img src="${LOGO_URL}" width="72" height="72" alt="AThoughtfulHermit" style="display:block;border:0;border-radius:50%;" />
            </td>
          </tr>
          <tr>
            <td style="background-color:#fcf6ec;border-radius:16px;padding:28px 24px;color:#1c1612;font-family:Georgia,'Times New Roman',serif;">
              ${innerCardHtml}
            </td>
          </tr>
        </table>
        <!--[if gte mso 9]>
          </v:textbox>
        </v:rect>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildArticleHtml(piece) {
  const excerpts = piece.excerpts
    .map(
      (text) =>
        `<p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#3a2f28;">${escapeHtml(text)}</p>`
    )
    .join('');

  const card = `
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b4a2e;font-weight:bold;">${escapeHtml(piece.series)}</p>
    <h1 style="margin:0 0 14px;font-size:26px;line-height:1.25;color:#1c1612;">${escapeHtml(piece.title)}</h1>
    ${excerpts}
    <p style="margin:20px 0 0;">
      <a href="${SITE_URL}/" style="display:inline-block;background:#3d2a1a;color:#fcf6ec;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px;">Read on the site</a>
    </p>
    <p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:#6b4a2e;">Unsubscribe link is personalized when the weekly send runs.</p>
    <p style="margin:14px 0 0;font-size:12px;color:#6b4a2e;">AThoughtfulHermit · reflective notes for the long walk home</p>
  `;

  return wrapCabinEmail(card, `${piece.series}: ${piece.title}`);
}

function mondayOfWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

const chronicleId = process.argv[2];
const weekFlag = process.argv.indexOf('--week');
const weekOf = weekFlag >= 0 ? process.argv[weekFlag + 1] : mondayOfWeek();

if (!chronicleId) {
  console.error('Usage: node scripts/build-email.mjs <chronicle-id> [--week YYYY-MM-DD]');
  process.exit(1);
}

const chronicles = loadChronicles();
const piece = chronicles.find((item) => item.id === chronicleId);
if (!piece) {
  console.error(`Unknown chronicle id: ${chronicleId}`);
  process.exit(1);
}

const html = buildArticleHtml(piece);
const outDir = path.join(root, 'editions');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `${piece.id}-${weekOf}.html`);
fs.writeFileSync(outFile, html);

const seed = {
  chronicle_id: piece.id,
  week_of: weekOf,
  subject: `Article of the week: ${piece.title}`,
  email_html_path: path.relative(root, outFile),
};

fs.writeFileSync(path.join(outDir, `${piece.id}-${weekOf}.json`), JSON.stringify(seed, null, 2) + '\n');

console.log(`Wrote ${outFile}`);
console.log(`Seed metadata: editions/${piece.id}-${weekOf}.json`);
console.log('Upsert into weekly_editions with the HTML contents when Supabase is configured.');
