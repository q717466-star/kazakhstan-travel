import fs from 'node:fs';
import path from 'node:path';

/**
 * Loads the nearest monorepo `.env` file when running standalone CLI scripts
 * (`bot:telegram`, `bot:setup`). Next.js loads `.env` natively.
 */
export function loadLocalEnvFile(): string | null {
  let current = path.resolve(process.cwd());
  for (let i = 0; i < 4; i++) {
    const candidate = path.join(current, '.env');
    if (fs.existsSync(candidate)) {
      const proc = process as NodeJS.Process & { loadEnvFile?: (filePath?: string) => void };
      if (typeof proc.loadEnvFile === 'function') {
        try {
          proc.loadEnvFile(candidate);
          return candidate;
        } catch {
          // fall back to minimal key=value parser below
        }
      }
      try {
        const raw = fs.readFileSync(candidate, 'utf-8');
        for (const line of raw.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eq = trimmed.indexOf('=');
          if (eq <= 0) continue;
          const key = trimmed.slice(0, eq).trim();
          let val = trimmed.slice(eq + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
        return candidate;
      } catch {
        return null;
      }
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}
