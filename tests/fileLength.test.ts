import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

function countLines(filePath: string): number {
  const content = fs.readFileSync(filePath, 'utf8');
  const text = content.endsWith('\n') ? content.slice(0, -1) : content;
  return text.split('\n').length;
}

function walk(dir: string): string[] {
  let results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'coverage', '.git'].includes(entry.name)) continue;
      results = results.concat(walk(fullPath));
    } else if (entry.isFile()) {
      if (/\.(ts|tsx|js|cjs|mjs|css)$/.test(entry.name)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

describe('fileLength enforcement', () => {
  it('ensures all src, tests, and root config files are 220 lines or fewer', () => {
    const repoRoot = process.cwd();
    const files: string[] = [];

    for (const item of fs.readdirSync(repoRoot, { withFileTypes: true })) {
      if (item.isFile() && /\.(ts|tsx|js|cjs|mjs|css)$/.test(item.name)) {
        files.push(path.join(repoRoot, item.name));
      }
    }

    files.push(...walk(path.join(repoRoot, 'src')));
    files.push(...walk(path.join(repoRoot, 'tests')));

    const violations: { file: string; lines: number }[] = [];
    for (const file of files) {
      const lines = countLines(file);
      if (lines > 220) {
        violations.push({
          file: path.relative(repoRoot, file).replace(/\\/g, '/'),
          lines,
        });
      }
    }

    const message = violations.map((v) => `${v.file}: ${v.lines} lines`).join('\n');
    expect(violations, `Files exceeding 220 lines:\n${message}`).toEqual([]);
  });
});
