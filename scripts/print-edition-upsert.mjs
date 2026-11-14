#!/usr/bin/env node
/** Prints SQL to upsert a built edition HTML into weekly_editions. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const metaPath = process.argv[2];

if (!metaPath) {
  console.error('Usage: node scripts/print-edition-upsert.mjs editions/<id>-<week>.json');
  process.exit(1);
}

const meta = JSON.parse(fs.readFileSync(path.resolve(root, metaPath), 'utf8'));
const html = fs.readFileSync(path.resolve(root, meta.email_html_path), 'utf8');
const escaped = html.replaceAll("'", "''");

console.log(`insert into public.weekly_editions (chronicle_id, week_of, subject, email_html)
values (
  '${meta.chronicle_id}',
  '${meta.week_of}',
  '${meta.subject.replaceAll("'", "''")}',
  '${escaped}'
)
on conflict (week_of) do update set
  chronicle_id = excluded.chronicle_id,
  subject = excluded.subject,
  email_html = excluded.email_html,
  sent_at = null;`);
