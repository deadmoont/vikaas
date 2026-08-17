// One-time (per machine) local HTTPS setup via mkcert — installs a locally
// trusted CA (so the browser shows a real padlock, not a self-signed-cert
// warning) and issues a cert for hakarrrank.com, saved to certs/. Once
// those files exist, vite.config.js picks them up automatically and
// switches from http://hakarrrank.com/ to https://hakarrrank.com/ with no
// further config changes needed.
//
// Fully self-installing on Windows: bootstraps Chocolatey itself (via its
// own official installer) if missing, then mkcert via Chocolatey if that's
// missing too — so a machine that has neither still ends up fully set up
// from a single `npm run setup-https` (or `npm start`, which calls this
// automatically). Everything here is idempotent: already-installed tools
// and already-generated certs are detected and skipped.
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

function commandExists(cmd) {
  try {
    execSync(platform() === "win32" ? `where ${cmd}` : `which ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Installs mkcert if it's missing, including bootstrapping Chocolatey
// itself first if that's ALSO missing. Returns true if mkcert ends up
// available either way (already present, or just installed).
function ensureMkcert() {
  if (commandExists("mkcert")) return true;

  if (platform() === "win32") {
    if (!commandExists("choco")) {
      console.log("Chocolatey isn't installed either — bootstrapping it first (official installer script)...");
      run(
        'powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; ' +
          "[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; " +
          "iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))\""
      );
    }
    console.log("Installing mkcert via Chocolatey...");
    run("choco install mkcert -y");
  } else if (platform() === "darwin") {
    if (!commandExists("brew")) {
      console.error("Homebrew isn't installed — install it first: https://brew.sh");
      return false;
    }
    console.log("Installing mkcert via Homebrew...");
    run("brew install mkcert");
  } else {
    console.error("Auto-install isn't wired up for this OS.");
    console.error("Install instructions: https://github.com/FiloSottile/mkcert#installation");
    return false;
  }

  return commandExists("mkcert");
}

if (existsSync(CERT_FILE) && existsSync(KEY_FILE)) {
  console.log(`Certs already exist in ${CERT_DIR}/ — nothing to do. Delete that folder to regenerate.`);
  process.exit(0);
}

try {
  if (!ensureMkcert()) {
    console.error("");
    console.error("Couldn't get mkcert installed automatically — see the errors above.");
    process.exit(1);
  }

  mkdirSync(CERT_DIR, { recursive: true });

  // Installs (or confirms) mkcert's local CA into the system/browser trust
  // stores — this is what makes the browser show a real padlock instead of
  // "Not secure", since the cert generated below is signed by that CA.
  run("mkcert -install");
  run(`mkcert -cert-file "${CERT_FILE}" -key-file "${KEY_FILE}" hakarrrank.com`);
} catch (err) {
  console.error("");
  console.error(`Setup failed: ${err.message}`);
  console.error("This needs an elevated terminal (Administrator on Windows, sudo elsewhere) — re-run from one.");
  process.exit(1);
}

console.log("");
console.log("Done — vite.config.js will now serve https://hakarrrank.com/ automatically.");
