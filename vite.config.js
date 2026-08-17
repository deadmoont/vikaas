import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CERT_FILE = resolve(__dirname, "certs/hackerrrank.com.pem");
const KEY_FILE = resolve(__dirname, "certs/hackerrrank.com-key.pem");
// Certs are generated locally via `npm run setup-https` (mkcert) — see
// README's "Local domain setup" section. Not committed (see .gitignore),
// so a fresh clone falls back to plain http:// on port 80 automatically
// until that's run, rather than crashing on missing cert files.
const hasCerts = existsSync(CERT_FILE) && existsSync(KEY_FILE);

if (!hasCerts) {
  console.log(
    'No local HTTPS cert found — run "npm run setup-https" for https://hackerrrank.com/ with no browser warning.',
  );
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // HTTPS's default port is 443 and HTTP's is 80 — either way, browsers
    // omit the default port from the address bar entirely (no ":port").
    // Binding either requires an elevated terminal (Administrator on
    // Windows, sudo on macOS/Linux) — see README's "Local domain setup".
    // strictPort so a busy port fails loudly instead of Vite silently
    // falling back to some other port (which would break the no-port URL).
    port: hasCerts ? 443 : 80,
    strictPort: true,
    // Opens the custom hostname (see hosts-file entry, set up via
    // `npm run setup-host`) instead of the default localhost — requires
    // that entry to exist locally, otherwise this just won't resolve and
    // you'd fall back to http://localhost/ manually.
    open: hasCerts ? "https://hackerrrank.com/" : "http://hackerrrank.com/",
    // Lets the dev server answer to that hostname at all — Vite 5 rejects
    // unrecognized Host headers by default as a DNS-rebinding safeguard, so
    // it has to be listed explicitly here for every clone of this repo.
    host: true,
    allowedHosts: ["hackerrrank.com"],
    https: hasCerts
      ? { cert: readFileSync(CERT_FILE), key: readFileSync(KEY_FILE) }
      : undefined,
  },
});
