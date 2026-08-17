// One-time (per machine) local HTTPS setup via mkcert — installs a locally
// trusted CA (so the browser shows a real padlock, not a self-signed-cert
// warning) and issues a cert for hakarrrank.com, saved to certs/. Once
// those files exist, vite.config.js picks them up automatically and
// switches from http://hakarrrank.com/ to https://hakarrrank.com/ with no
// further config changes needed.
//
// Usage:
//   Windows (as Administrator): npm run setup-https
//   macOS/Linux:                sudo npm run setup-https
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { platform } from "node:os";

const CERT_DIR = "certs";
const CERT_FILE = `${CERT_DIR}/hakarrrank.com.pem`;
const KEY_FILE = `${CERT_DIR}/hakarrrank.com-key.pem`;

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function mkcertAvailable() {
  try {
    execSync(platform() === "win32" ? "where mkcert" : "which mkcert", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

if (!mkcertAvailable()) {
  console.error("mkcert isn't installed — it's what issues a locally-trusted certificate.");
  console.error("");
  if (platform() === "win32") {
    console.error("  Install it (from an Administrator terminal), then re-run this:");
    console.error("    choco install mkcert -y");
  } else if (platform() === "darwin") {
    console.error("  Install it, then re-run this:");
    console.error("    brew install mkcert");
  } else {
    console.error("  Install instructions: https://github.com/FiloSottile/mkcert#installation");
  }
  process.exit(1);
}

if (existsSync(CERT_FILE) && existsSync(KEY_FILE)) {
  console.log(`Certs already exist in ${CERT_DIR}/ — nothing to do. Delete that folder to regenerate.`);
  process.exit(0);
}

mkdirSync(CERT_DIR, { recursive: true });

try {
  // Installs (or confirms) mkcert's local CA into the system/browser trust
  // stores — this is what makes the browser show a real padlock instead of
  // "Not secure", since the cert generated below is signed by that CA.
  run("mkcert -install");
  run(`mkcert -cert-file "${CERT_FILE}" -key-file "${KEY_FILE}" hakarrrank.com`);
} catch (err) {
  console.error("");
  console.error(`mkcert failed: ${err.message}`);
  console.error("This step needs an elevated terminal (Administrator on Windows, sudo elsewhere) — re-run it from one.");
  process.exit(1);
}

console.log("");
console.log("Done — vite.config.js will now serve https://hakarrrank.com/ automatically.");
