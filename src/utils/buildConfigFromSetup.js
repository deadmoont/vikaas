import defaultConfig from "../config/testConfig.js";
import { addMinutesToTime, formatDisplayDateTime } from "./datetime.js";

/**
 * Turns the raw SetupPage fields into a full testConfig-shaped object:
 * everything the setup form doesn't cover (instructions text, integrity
 * guidelines, work-experience options, button labels, ...) still comes
 * from the static defaults in config/testConfig.js.
 */
export function buildConfigFromSetup(fields) {
  const { companyName, testLabel, durationMinutes, testDate, startTime, timezoneLabel, candidateEmail, sections } =
    fields;
  const endTime = addMinutesToTime(startTime, Number(durationMinutes) || 0);

  return {
    ...defaultConfig,
    testTitle: testLabel.trim() ? `${companyName.trim()} - ${testLabel.trim()}` : companyName.trim(),
    durationMinutes: Number(durationMinutes),
    loginWindow: {
      start: formatDisplayDateTime(testDate, startTime),
      end: formatDisplayDateTime(testDate, endTime),
      timezone: timezoneLabel,
    },
    candidateEmail: candidateEmail?.trim() ? candidateEmail.trim() : defaultConfig.candidateEmail,
    sections: sections.map((s) => ({ name: s.name.trim(), questions: Number(s.questions) })),
  };
}
