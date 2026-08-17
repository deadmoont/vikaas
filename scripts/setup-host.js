// One-time local setup: maps the custom dev hostname (http://hakarrrank.com —
// a made-up name, not a real domain) to 127.0.0.1 in the OS hosts file, so
// `npm run dev` opens that instead of localhost. Anyone cloning this repo
// needs to run this once (with elevated privileges — the hosts file is a
// protected system file) before `npm run dev` will resolve that hostname.
//
// Usage:
//   Windows (as Administrator): npm run setup-host
//   macOS/Linux:                sudo npm run setup-host
import { readFileSync, appendFileSync } from "node:fs";
import { platform } from "node:os";

const HOST = "hakarrrank.com";
const HOSTS_FILE =
  platform() === "win32" ? `${process.env.SystemRoot || "C:\\Windows"}\\System32\\drivers\\etc\\hosts` : "/etc/hosts";

function alreadyMapped(contents) {
  return contents
    .split("\n")
    .some((line) => !line.trim().startsWith("#") && line.split(/\s+/).includes(HOST));
}

try {
  const contents = readFileSync(HOSTS_FILE, "utf8");

  if (alreadyMapped(contents)) {
    console.log(`✓ ${HOST} is already mapped to 127.0.0.1 in ${HOSTS_FILE} — nothing to do.`);
    process.exit(0);
  }

  const needsLeadingNewline = contents.length > 0 && !contents.endsWith("\n");
  appendFileSync(HOSTS_FILE, `${needsLeadingNewline ? "\n" : ""}127.0.0.1\t${HOST}\n`);
  console.log(`✓ Added "127.0.0.1 ${HOST}" to ${HOSTS_FILE}.`);
  console.log(`  Run "npm run dev" — it'll open http://${HOST}/ automatically.`);
} catch (err) {
  console.error(`✗ Couldn't write to ${HOSTS_FILE}: ${err.message}`);
  console.error("");
  if (platform() === "win32") {
    console.error("  Re-run this from an Administrator terminal:");
    console.error("    npm run setup-host");
  } else {
    console.error("  Re-run with sudo:");
    console.error("    sudo npm run setup-host");
  }
  console.error("");
  console.error(`  Or edit ${HOSTS_FILE} by hand and add this line:`);
  console.error(`    127.0.0.1  ${HOST}`);
  process.exit(1);
}
