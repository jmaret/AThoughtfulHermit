#!/usr/bin/env node
/** Prints SQL to upsert a built edition HTML into weekly_editions. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const metaPath = process.argv[2];
const markSent = process.argv.includes('--mark-sent');

if (!metaPath) {
  console.error(
    'Usage: node scripts/print-edition-upsert.mjs editions/<id>-<week>.json [--mark-sent]'
  );
  process.exit(1);
}

const meta = JSON.parse(fs.readFileSync(path.resolve(root, metaPath), 'utf8'));
const html = fs.readFileSync(path.resolve(root, meta.email_html_path), 'utf8');
const escaped = html.replaceAll("'", "''");
const sentAtInsert = markSent ? 'now()' : 'null';
const sentAtUpdate = markSent
  ? 'sent_at = coalesce(public.weekly_editions.sent_at, now())'
  : 'sent_at = public.weekly_editions.sent_at';

console.log(`insert into public.weekly_editions (chronicle_id, week_of, subject, email_html, sent_at)
values (
  '${meta.chronicle_id}',
  '${meta.week_of}',
  '${meta.subject.replaceAll("'", "''")}',
  '${escaped}',
  ${sentAtInsert}
)
on conflict (week_of) do update set
  chronicle_id = excluded.chronicle_id,
  subject = excluded.subject,
  email_html = excluded.email_html,
  ${sentAtUpdate};
`);
console.log(
  markSent
    ? '-- marked sent_at so weekly cron will not pick this archival/send-now edition.'
    : '-- sent_at left null for weekly blast; use --mark-sent for archival/send-now-only editions.'
);
