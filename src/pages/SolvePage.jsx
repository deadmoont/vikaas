import { useEffect, useRef, useState } from "react";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Dropdown from "../components/Dropdown.jsx";
import CodeEditor from "../components/CodeEditor.jsx";
import Chevron from "../components/Chevron.jsx";
import SampleCase from "../components/SampleCase.jsx";
import {
  ClockIcon,
  HelpCircleIcon,
  BookmarkIcon,
  InfoIcon,
  HistoryIcon,
  FullscreenIcon,
  LockIcon,
  CheckCircleIcon,
  XCircleIcon,
  SpinnerIcon,
  PlayIcon,
  DownloadIcon,
  DockIcon,
} from "../components/icons.jsx";
import problems, { LANGUAGES } from "../data/problems.jsx";
import useCountdown from "../hooks/useCountdown.js";

const TOTAL_TEST_CASES = 15;

function formatCountdown(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h} hr ${mm} min ${ss} sec` : `${mm} min ${ss} sec`;
}

// The "Solve" screen: problem statement on the left, a real (if
// non-executing) code editor on the right, split by draggable dividers
// (horizontal between the two panels, vertical between the editor and Test
// Results). Reached from TestDashboardPage; only questionIds 1/2/3 have
// real content (this is a frontend demo — there's no backend to serve
// arbitrary questions or actually judge submitted code).
export default function SolvePage({
  questionId,
  sections,
  onSelectQuestion,
  onBack,
  theme,
  onToggleTheme,
  testStartTime,
  durationMinutes,
  submittedQuestions,
  onSubmitQuestion,
}) {
  const problem = problems[questionId];
  const secondsLeft = useCountdown(testStartTime, durationMinutes);

  // Rail groups question badges under their section's label (S1/S2/S3...),
  // numbered globally across sections — same numbering TestDashboardPage
  // uses (S2's question is "2", not "1", if S1 has one question before it).
  let idCounter = 0;
  const railGroups = sections.map((section, i) => ({
    label: `S${i + 1}`,
    ids: Array.from({ length: section.questions }, () => {
      idCounter += 1;
      return idCounter;
    }),
  }));

  const [language, setLanguage] = useState(LANGUAGES[2]); // "C++23"
  const [code, setCode] = useState(problem?.starterCode ?? "// No starter code available.\n");
  const [leftWidth, setLeftWidth] = useState(42); // percent, horizontal split
  const [editorHeight, setEditorHeight] = useState(62); // percent, vertical split
  const [expanded, setExpanded] = useState(false); // editor-only fullscreen toggle
  const [resultsOpen, setResultsOpen] = useState(true);
  const [runStatus, setRunStatus] = useState("idle"); // idle | running | done
  const [selectedCase, setSelectedCase] = useState(0);
  // One random pass/fail per case, rolled fresh each run — this is a demo
  // with no real judge, so outcomes are simulated rather than always "all
  // passed".
  const [caseResults, setCaseResults] = useState([]);
  const hDrag = useRef(null);
  const vDrag = useRef(null);
  const runTimer = useRef(null);

  useEffect(() => () => clearTimeout(runTimer.current), []);

  const startHDrag = (e) => {
    hDrag.current = { startX: e.clientX, startWidth: leftWidth };
    document.addEventListener("mousemove", onHDrag);
    document.addEventListener("mouseup", stopHDrag);
  };
  const onHDrag = (e) => {
    if (!hDrag.current) return;
    const deltaPercent = ((e.clientX - hDrag.current.startX) / window.innerWidth) * 100;
    setLeftWidth(Math.min(70, Math.max(25, hDrag.current.startWidth + deltaPercent)));
  };
  const stopHDrag = () => {
    hDrag.current = null;
    document.removeEventListener("mousemove", onHDrag);
    document.removeEventListener("mouseup", stopHDrag);
  };

  const startVDrag = (e) => {
    const containerHeight = e.currentTarget.parentElement.getBoundingClientRect().height;
    vDrag.current = { startY: e.clientY, startHeight: editorHeight, containerHeight };
    document.addEventListener("mousemove", onVDrag);
    document.addEventListener("mouseup", stopVDrag);
  };
  const onVDrag = (e) => {
    if (!vDrag.current) return;
    const deltaPercent = ((e.clientY - vDrag.current.startY) / vDrag.current.containerHeight) * 100;
    setEditorHeight(Math.min(80, Math.max(20, vDrag.current.startHeight + deltaPercent)));
  };
  const stopVDrag = () => {
    vDrag.current = null;
    document.removeEventListener("mousemove", onVDrag);
    document.removeEventListener("mouseup", stopVDrag);
  };

  const handleRun = () => {
    setRunStatus("running");
    setSelectedCase(0);
    setResultsOpen(true); // auto-expand if the panel was collapsed
    const delay = 5000 + Math.random() * 2000; // 5-7s, per spec
    runTimer.current = setTimeout(() => {
      setCaseResults(Array.from({ length: TOTAL_TEST_CASES }, () => Math.random() < 0.5));
      setRunStatus("done");
    }, delay);
  };
  const handleAbort = () => {
    clearTimeout(runTimer.current);
    setRunStatus("idle");
  };
  const handleResetCode = () => setCode(problem?.starterCode ?? "");

  // "Proceed" here means back to the dashboard — this demo doesn't chain
  // straight into the next question. Marks the question submitted first, so
  // the dashboard's "Solve" -> "Modify" and this rail's checkmark both
  // reflect it, whichever page you land on next.
  const handleSaveAndProceed = () => {
    onSubmitQuestion(questionId);
    onBack();
  };

  if (!problem) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-body">
          <div className="dashboard-content">
            <h1 className="dashboard-title">Question not available</h1>
            <p className="muted-text">This is a frontend demo with content for only 3 questions.</p>
            <button className="btn btn-primary" onClick={onBack}>
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const unlockedCount = problem.sampleCases.length;

  return (
    <div className="solve-page">
      <div className="dashboard-topbar">
        <div className="dashboard-timer">
          <ClockIcon />
          {formatCountdown(secondsLeft)}
        </div>

        <div className="dashboard-actions">
          <button className="solve-layout-btn" onClick={() => setLeftWidth(42)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="8" height="16" rx="1" />
              <rect x="13" y="4" width="8" height="16" rx="1" />
            </svg>
            Layout
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} className="theme-toggle theme-toggle--inline" />
          <button className="icon-help-btn" aria-label="Help">
            <HelpCircleIcon />
          </button>
          <button className="btn btn-white" onClick={handleSaveAndProceed}>
            Save &amp; Proceed
          </button>
        </div>
      </div>

      <div className="solve-body">
        <div className="solve-rail">
          <div className="solve-rail-toggle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="9" y1="4" x2="9" y2="20" />
            </svg>
          </div>
          {railGroups.map((group) => (
            <div className="solve-rail-group" key={group.label}>
              <div className="solve-rail-section">{group.label}</div>
              {group.ids.map((id) => {
                const submitted = submittedQuestions.has(id);
                return (
                  <button
                    key={id}
                    className={`solve-rail-question ${id === questionId ? "solve-rail-question--active" : ""} ${
                      submitted ? "solve-rail-question--submitted" : ""
                    }`}
                    onClick={() => onSelectQuestion(id)}
                    aria-label={submitted ? `Question ${id}, submitted` : `Question ${id}`}
                  >
                    {submitted ? <CheckCircleIcon /> : id}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {!expanded && (
          <div className="solve-panel solve-panel--problem" style={{ width: `${leftWidth}%` }}>
            <div className="solve-problem-header">
              <BookmarkIcon />
              <h1>{problem.title}</h1>
            </div>

            <div className="problem-statement">{problem.statement}</div>

            <h2 className="solve-subheading">Constraints</h2>
            <ul className="problem-constraints">
              {problem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>

            <h2 className="solve-subheading">Test Cases</h2>
            {problem.sampleCases.map((sc, i) => (
              <SampleCase
                key={i}
                index={i}
                stdinGroups={sc.stdinGroups}
                output={sc.output}
                explanation={sc.explanation}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        )}

        {!expanded && <div className="solve-divider" onMouseDown={startHDrag} />}

        <div className="solve-panel solve-panel--editor" style={{ width: expanded ? "100%" : `${100 - leftWidth}%` }}>
          <div className="solve-editor-toolbar">
            <div className="solve-toolbar-left">
              <span className="solve-toolbar-label">Language</span>
              <Dropdown value={language} onChange={setLanguage} options={LANGUAGES} placeholder="Language" />
              <button
                className="icon-help-btn"
                aria-label="Language info"
                title="Only C/C++ starter code is provided in this demo — other languages keep the same template."
              >
                <InfoIcon />
              </button>
            </div>
            <div className="solve-toolbar-right">
              <button className="icon-help-btn" aria-label="Reset code" title="Reset to starter code" onClick={handleResetCode}>
                <HistoryIcon />
              </button>
              <button
                className="icon-help-btn"
                aria-label={expanded ? "Restore split view" : "Expand editor"}
                title={expanded ? "Restore split view" : "Expand editor"}
                onClick={() => setExpanded((e) => !e)}
              >
                <FullscreenIcon />
              </button>
            </div>
          </div>

          <div className="solve-editor-split">
            <div className="solve-editor-area" style={{ height: resultsOpen ? `${editorHeight}%` : "100%" }}>
              <CodeEditor value={code} onChange={setCode} />
              <div className="solve-status-bar">
                <span>Ln 1, Col 1</span>
                <span className="solve-status-dot" /> <span>Autocomplete</span>
                <span>Spaces: 4</span>
                <span>Mode: Normal</span>
              </div>
            </div>

            {resultsOpen && (
              <div className="solve-vertical-resizer" onMouseDown={startVDrag}>
                <span className="solve-vertical-handle">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="7 10 12 5 17 10" />
                    <polyline points="7 14 12 19 17 14" />
                  </svg>
                </span>
              </div>
            )}

            <div className="solve-results" style={{ height: resultsOpen ? `${100 - editorHeight}%` : "auto" }}>
              <div className="solve-results-header">
                <div className="solve-results-toggle-group">
                  <button
                    className="solve-results-toggle-btn"
                    onClick={() => setResultsOpen((o) => !o)}
                    aria-label={resultsOpen ? "Collapse Test Results" : "Expand Test Results"}
                  >
                    <Chevron open={resultsOpen} />
                  </button>
                  <span className="solve-results-label">Test Results</span>
                </div>

                <div className="solve-results-header-actions">
                  {runStatus === "running" ? (
                    <button className="btn solve-abort-btn" onClick={handleAbort}>
                      <SpinnerIcon /> Abort
                    </button>
                  ) : (
                    <button className="btn btn-run-outline solve-run-btn" onClick={handleRun}>
                      <PlayIcon /> Run Code
                    </button>
                  )}
                  <button className="solve-results-dock-btn" aria-label="Dock panel">
                    <DockIcon />
                  </button>
                </div>
              </div>

              {resultsOpen && (
                <div className="solve-results-body">
                  <div className="solve-results-tabs">
                    <button className="solve-results-tab solve-results-tab--active">All Cases</button>
                    <button className="solve-results-tab">Custom</button>
                  </div>

                  {runStatus === "idle" && (
                    <p className="muted-text solve-results-placeholder">Click on "Run" to run the test cases.</p>
                  )}

                  {runStatus === "running" && (
                    <>
                      <div className="test-status-banner test-status-banner--running">
                        <SpinnerIcon /> Started
                      </div>
                      <div className="test-case-grid">
                        {Array.from({ length: TOTAL_TEST_CASES }).map((_, i) => {
                          const locked = i >= unlockedCount;
                          return (
                            <div key={i} className="test-case-pill">
                              <SpinnerIcon />
                              Test Case {i + 1}
                              {locked && (
                                <span className="test-case-pill-lock">
                                  <LockIcon />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {runStatus === "done" && (
                    <>
                      {(() => {
                        const passedCount = caseResults.filter(Boolean).length;
                        const allPassed = passedCount === TOTAL_TEST_CASES;
                        return (
                          <div
                            className={`test-status-banner ${
                              allPassed ? "test-status-banner--passed" : "test-status-banner--failed"
                            }`}
                          >
                            <span
                              className={allPassed ? "test-status-banner-icon" : "test-status-banner-icon--failed"}
                            >
                              {allPassed ? <CheckCircleIcon /> : <XCircleIcon />}
                            </span>
                            {passedCount}/{TOTAL_TEST_CASES} test cases passed successfully
                          </div>
                        );
                      })()}

                      <div className="test-results-columns">
                        <div className="test-case-list">
                          {Array.from({ length: TOTAL_TEST_CASES }).map((_, i) => {
                            const locked = i >= unlockedCount;
                            const casePassed = caseResults[i];
                            return (
                              <button
                                key={i}
                                className={`test-case-row ${
                                  i === selectedCase ? "test-case-row--selected" : ""
                                }`}
                                onClick={() => setSelectedCase(i)}
                              >
                                <span
                                  className={
                                    casePassed ? "test-case-row-status--passed" : "test-case-row-status--failed"
                                  }
                                >
                                  {casePassed ? <CheckCircleIcon /> : <XCircleIcon />}
                                </span>
                                Test Case {i + 1}
                                {locked && (
                                  <span className="test-case-row-lock">
                                    <LockIcon />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="test-case-detail">
                          {selectedCase >= unlockedCount ? (
                            <p className="muted-text">
                              This is a hidden test case — its input and expected output aren't shown to
                              candidates, only whether it passed.
                            </p>
                          ) : (
                            <>
                              <div className="test-detail-section">
                                <span className="field-label">Compiler Message</span>
                                <p
                                  className={`test-detail-compiler ${
                                    caseResults[selectedCase] ? "success-text" : "error-text"
                                  }`}
                                >
                                  {caseResults[selectedCase] ? "Success" : "Wrong Answer"}
                                </p>
                              </div>

                              <div className="test-detail-section">
                                <div className="test-detail-heading">
                                  <span className="field-label">Input (stdin)</span>
                                  <span className="test-detail-actions">
                                    <button className="icon-help-btn" aria-label="Run with this input">
                                      <PlayIcon />
                                    </button>
                                    <button className="icon-help-btn" aria-label="Download input">
                                      <DownloadIcon />
                                    </button>
                                  </span>
                                </div>
                                <pre className="sample-case-block">
                                  {problem.sampleCases[selectedCase].stdinGroups
                                    .flatMap((g) => g.rows)
                                    .join("\n")}
                                </pre>
                              </div>

                              <div className="test-detail-section">
                                <div className="test-detail-heading">
                                  <span className="field-label">Output (stdout)</span>
                                  <button className="icon-help-btn" aria-label="Download output">
                                    <DownloadIcon />
                                  </button>
                                </div>
                                {caseResults[selectedCase] ? (
                                  // Simulated — passed, so the "produced" output matches Expected
                                  // Output. There's no real execution behind this.
                                  <pre className="sample-case-block">{problem.sampleCases[selectedCase].output}</pre>
                                ) : (
                                  <p className="muted-text sample-case-block sample-case-block--note">
                                    Output did not match Expected Output (simulated failure — no real code was
                                    executed).
                                  </p>
                                )}
                              </div>

                              <div className="test-detail-section">
                                <div className="test-detail-heading">
                                  <span className="field-label">Expected Output</span>
                                  <button className="icon-help-btn" aria-label="Download expected output">
                                    <DownloadIcon />
                                  </button>
                                </div>
                                <pre className="sample-case-block">{problem.sampleCases[selectedCase].output}</pre>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
