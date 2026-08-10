import { useMemo, useState } from "react";
import defaultConfig from "../config/testConfig.js";
import SectionsEditor from "../components/SectionsEditor.jsx";
import { addMinutesToTime, formatDisplayDateTime } from "../utils/datetime.js";

const todayIso = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const blankFields = () => ({
  companyName: "Different",
  testLabel: "IIIT A - 6M - Campus Hiring'26",
  durationMinutes: 90,
  testDate: todayIso(),
  startTime: "19:00",
  timezoneLabel: "IST(+05:30)",
  candidateEmail: defaultConfig.candidateEmail,
  companyLogo: defaultConfig.companyLogo,
  sections: defaultConfig.sections.map((s) => ({ name: s.name, questions: s.questions })),
});

// Runs before the actual test-onboarding flow. Everything entered here
// becomes the live config the Instructions/Details/Permissions pages render
// — no code changes needed to stand up a differently-branded test.
// `initialFields` lets App.jsx re-open this pre-filled with the current
// setup when the user comes back to edit it, rather than resetting to blank.
export default function SetupPage({ initialFields, onComplete }) {
  const [fields, setFields] = useState(() => initialFields ?? blankFields());

  const set = (key, value) => setFields((prev) => ({ ...prev, [key]: value }));

  // Read in-memory only (a data URL held in React state) — never uploaded
  // anywhere, matching this app's no-backend/no-persistence approach.
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("companyLogo", reader.result);
    reader.readAsDataURL(file);
    e.target.value = ""; // allow re-selecting the same file later
  };

  const endTime = useMemo(
    () => addMinutesToTime(fields.startTime, Number(fields.durationMinutes) || 0),
    [fields.startTime, fields.durationMinutes]
  );
  const startDisplay = formatDisplayDateTime(fields.testDate, fields.startTime);
  const endDisplay = formatDisplayDateTime(fields.testDate, endTime);

  const isValid =
    fields.companyName.trim().length > 0 &&
    Number(fields.durationMinutes) > 0 &&
    fields.testDate &&
    fields.startTime &&
    fields.sections.length > 0 &&
    fields.sections.every((s) => s.name.trim().length > 0 && Number(s.questions) > 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    onComplete(fields);
  };

  return (
    <div className="setup-page">
      <form className="setup-card" onSubmit={handleSubmit}>
        <h1 className="setup-title">Set Up Your Test</h1>
        <p className="muted-text">
          Fill this in once — it drives everything on the pages that follow (title, duration,
          login window, and the section table). No backend, nothing saved anywhere but this
          browser.
        </p>

        <div className="setup-grid">
          <div>
            <label className="field-label" htmlFor="companyName">
              Company Name <span className="required">*</span>
            </label>
            <input
              id="companyName"
              className="text-input"
              type="text"
              placeholder="e.g. Acme Corp"
              value={fields.companyName}
              onChange={(e) => set("companyName", e.target.value)}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="testLabel">
              Test Label
            </label>
            <input
              id="testLabel"
              className="text-input"
              type="text"
              placeholder="e.g. IIIT A - 6M - Campus Hiring'26"
              value={fields.testLabel}
              onChange={(e) => set("testLabel", e.target.value)}
            />
          </div>
        </div>

        <p className="setup-title-preview muted-text">
          Title preview:{" "}
          <strong>
            {fields.testLabel.trim()
              ? `${fields.companyName || "…"} - ${fields.testLabel}`
              : fields.companyName || "…"}
          </strong>
        </p>

        <div className="setup-grid setup-grid--four">
          <div>
            <label className="field-label" htmlFor="durationMinutes">
              Duration (minutes) <span className="required">*</span>
            </label>
            <input
              id="durationMinutes"
              className="text-input"
              type="number"
              min="1"
              value={fields.durationMinutes}
              onChange={(e) => set("durationMinutes", e.target.value)}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="testDate">
              Date <span className="required">*</span>
            </label>
            <input
              id="testDate"
              className="text-input"
              type="date"
              value={fields.testDate}
              onChange={(e) => set("testDate", e.target.value)}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="startTime">
              Start Time <span className="required">*</span>
            </label>
            <input
              id="startTime"
              className="text-input"
              type="time"
              value={fields.startTime}
              onChange={(e) => set("startTime", e.target.value)}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="timezoneLabel">
              Timezone Label
            </label>
            <input
              id="timezoneLabel"
              className="text-input"
              type="text"
              placeholder="e.g. IST(+05:30)"
              value={fields.timezoneLabel}
              onChange={(e) => set("timezoneLabel", e.target.value)}
            />
          </div>
        </div>

        <p className="muted-text">
          Login window preview: <strong>{startDisplay || "…"}</strong> to{" "}
          <strong>{endDisplay || "…"}</strong> {fields.timezoneLabel} (end time is start +
          duration, computed automatically).
        </p>

        <div className="setup-grid">
          <div>
            <label className="field-label" htmlFor="candidateEmail">
              Candidate Email
            </label>
            <input
              id="candidateEmail"
              className="text-input"
              type="email"
              placeholder="e.g. iit2023131@iiita.ac.in"
              value={fields.candidateEmail}
              onChange={(e) => set("candidateEmail", e.target.value)}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="companyLogo">
              Company Logo
            </label>
            <div className="logo-upload-row">
              {fields.companyLogo && <img className="logo-upload-preview" src={fields.companyLogo} alt="" />}
              <input
                id="companyLogo"
                className="text-input"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
              />
              {fields.companyLogo && (
                <button
                  type="button"
                  className="logo-upload-remove"
                  onClick={() => set("companyLogo", null)}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="muted-text">
          Candidate email is stamped as a repeating watermark across the problem description on
          the Solve page. Uploading a logo shows it next to the countdown timer on the Test
          Dashboard and Solve pages — leave it blank to show just the timer, as now.
        </p>

        <label className="field-label">
          Sections <span className="required">*</span>
        </label>
        <SectionsEditor sections={fields.sections} onChange={(sections) => set("sections", sections)} />

        <div className="setup-footer">
          <button type="submit" className="btn btn-primary" disabled={!isValid}>
            Generate Test Page
          </button>
        </div>
      </form>
    </div>
  );
}
