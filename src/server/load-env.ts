/**
 * Loads a local `.env` into `process.env` for development.
 *
 * Production does not need this: Render injects real environment variables, and
 * there is no `.env` file in the deployed image — the ENOENT is expected and
 * ignored. `process.loadEnvFile` (Node >= 20.12, and this project requires 22)
 * does the parsing, so no dotenv dependency is needed.
 *
 * Precedence: variables already present in `process.env` WIN over the file.
 * That is Node's own behaviour and the one we want — a value set in the Render
 * dashboard or on the command line must never be silently overridden by a
 * stale local file.
 *
 * Call this before anything reads `process.env`. The data repositories read
 * their config lazily (per call, not at import time) precisely so that a
 * module-evaluation-order accident cannot leave them holding `undefined`.
 */
export function loadLocalEnv(envPath = '.env'): void {
  try {
    process.loadEnvFile(envPath);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException | null)?.code;
    // No .env file is the normal production case — stay quiet.
    if (code === 'ENOENT') return;
    // Anything else (unreadable, malformed) is worth surfacing: the site will
    // still run on bundled fallback content, which looks fine but silently
    // ignores the database.
    console.error('[load-env] failed to read env file:', err);
  }
}
