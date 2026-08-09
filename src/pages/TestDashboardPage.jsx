import { useState } from "react";
import Chevron from "../components/Chevron.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Modal from "../components/Modal.jsx";
import { HelpCircleIcon, ClockIcon, BookmarkIcon } from "../components/icons.jsx";
import problems from "../data/problems.jsx";
import useCountdown from "../hooks/useCountdown.js";

function formatCountdown(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h} hr ${mm} min ${ss} sec` : `${mm} min ${ss} sec`;
}

// Shown after identity verification — lists the sections/questions exactly
// as configured on the Setup page. Only the first 3 questions (global
// numbering across sections) have real content behind "Solve" — see
// data/problems.jsx — anything beyond that shows an inline demo note
// instead, since there's no backend to serve arbitrary question content.
export default function TestDashboardPage({
  config,
  theme,
  onToggleTheme,
  onSubmit,
  onSolve,
  testStartTime,
  submittedQuestions,
}) {
  const {
    testTitle,
    sections,
    durationMinutes,
    confirmSubmitTitle,
    confirmSubmitMessage,
    confirmSubmitNoLabel,
    confirmSubmitYesLabel,
  } = config;
  const [demoNote, setDemoNote] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const secondsLeft = useCountdown(testStartTime, durationMinutes);

  const showDemoNote = () => {
    setDemoNote(true);
    setTimeout(() => setDemoNote(false), 3000);
  };

  let questionCounter = 0;

  return (
    <div className="dashboard-page">
      {/* In-flow top bar (not fixed) — the border-bottom + normal document
          flow is what guarantees the title below can never look like part
          of the header, rather than tuning padding to clear a floating bar. */}
      <div className="dashboard-topbar">
        <div className="dashboard-timer">
          <ClockIcon />
          {formatCountdown(secondsLeft)}
        </div>

        {/* Theme toggle, help, then Submit Test — in that order. ThemeToggle
            renders inline here (not independently fixed) so it shares this
            one flex group. */}
        <div className="dashboard-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} className="theme-toggle theme-toggle--inline" />
          <button className="icon-help-btn" aria-label="Help">
            <HelpCircleIcon />
          </button>
          <button className="btn btn-white" onClick={() => setShowConfirmSubmit(true)}>
            Submit Test
          </button>
        </div>
      </div>

      <div className="dashboard-body">
        {/* Centered as one block (equal margins left/right) — text within it
            stays left-aligned. */}
        <div className="dashboard-content">
          <h1 className="dashboard-title">{testTitle}</h1>

          {demoNote && (
            <p className="inline-note dashboard-note">
              This is a demo — only the first 3 questions have real content behind "Solve".
            </p>
          )}

          <div className="dashboard-sections">
            {sections.map((section) => (
              <div className="collapsible dashboard-section" key={section.name}>
                <div className="collapsible-header">
                  <span>{section.name}</span>
                  <Chevron open />
                </div>
                <table className="sections-table">
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Type</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: section.questions }).map(() => {
                      questionCounter += 1;
                      const n = questionCounter;
                      const problem = problems[n];
                      return (
                        <tr key={n}>
                          <td>
                            {/* flex lives on this inner span, not the <td>
                                itself — display:flex directly on a table
                                cell breaks border-collapse, which is why the
                                row divider line had a gap under this column. */}
                            <span className="dashboard-question-cell">
                              <BookmarkIcon />
                              {n}. {problem ? problem.title : `Question ${n}`}
                            </span>
                          </td>
                          <td>Coding</td>
                          <td>
                            <button
                              className="btn btn-primary dashboard-solve-btn"
                              onClick={() => (problem ? onSolve(n) : showDemoNote())}
                            >
                              {submittedQuestions.has(n) ? "Modify" : "Solve"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showConfirmSubmit && (
        <Modal
          title={confirmSubmitTitle}
          onClose={() => setShowConfirmSubmit(false)}
          footer={
            <div className="confirm-submit-actions">
              <button className="btn btn-primary" onClick={() => setShowConfirmSubmit(false)}>
                {confirmSubmitNoLabel}
              </button>
              <button className="btn btn-outline" onClick={onSubmit}>
                {confirmSubmitYesLabel}
              </button>
            </div>
          }
        >
          <p className="muted-text">{confirmSubmitMessage}</p>
        </Modal>
      )}
    </div>
  );
}
