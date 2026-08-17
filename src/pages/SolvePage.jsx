import { useEffect, useMemo, useRef, useState } from "react";
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
  CheckIcon,
  XIcon,
  PanelToggleIcon,
  NotesIcon,
  SettingsIcon,
  SpinnerIcon,
  PlayIcon,
  DownloadIcon,
  DockIcon,
} from "../components/icons.jsx";
import { LANGUAGES } from "../data/problems.jsx";
import useCountdown from "../hooks/useCountdown.js";
import { buildWatermarkBackground } from "../utils/watermark.js";
import { formatCountdown, countdownUrgency } from "../utils/formatCountdown.js";
import { getProblemForQuestion } from "../utils/getProblemForQuestion.js";

const TOTAL_TEST_CASES = 15;

// The "Solve" screen: problem statement on the left, a real (if
// non-executing) code editor on the right, split by draggable dividers
// (horizontal between the two panels, vertical between the editor and Test
// Results). Reached from TestDashboardPage. Only 3 problems are hardcoded
// (this is a frontend demo — there's no backend to serve arbitrary
// questions or actually judge submitted code), but every question slot
// still gets real content: getProblemForQuestion cycles the fixed set
// round-robin across however many questions the Setup page's sections add
// up to, rather than leaving anything past question 3 blank.
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
  savedCode,
  onCodeChange,
  candidateEmail,
  companyLogo,
}) {
  const problem = getProblemForQuestion(questionId);
  // Tiled diagonal watermark stamped behind the problem description — only
  // ever recomputed if the email actually changes, not on every render.
  const watermarkBackground = useMemo(() => buildWatermarkBackground(candidateEmail), [candidateEmail]);
  const secondsLeft = useCountdown(testStartTime, durationMinutes);
  // Derived from props, not local state — savedCode (lifted to App.jsx)
  // is what actually survives this component remounting on every question
  // switch; falls back to the starter template the first time a question
  // is opened.
  const code = savedCode ?? problem?.starterCode ?? "// No starter code available.\n";

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
  // Brief loading transition whenever this mounts (i.e. every time a
  // question is opened or switched to, since App.jsx remounts this via
  // key={activeQuestionId}) — matches the reference platform's own
  // loading spinner before the editor content appears.
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

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
  const handleResetCode = () => onCodeChange(problem?.starterCode ?? "");

  // "Proceed" here means back to the dashboard — this demo doesn't chain
  // straight into the next question. Marks the question submitted first, so
  // the dashboard's "Solve" -> "Modify" and this rail's checkmark both
  // reflect it, whichever page you land on next.
  const handleSaveAndProceed = () => {
    onSubmitQuestion(questionId);
    onBack();
  };

  // Defensive only — getProblemForQuestion always returns one of the 3
  // hardcoded problems (round-robin) for any questionId >= 1, so this
  // shouldn't actually be reachable in normal use.
  if (!problem) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-body">
          <div className="dashboard-content">
            <h1 className="dashboard-title">Question not available</h1>
            <p className="muted-text">Something went wrong loading this question's content.</p>
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
        <div className="dashboard-topbar-left">
          {companyLogo && (
            <div className="dashboard-logo">
              <img src={companyLogo} alt="" />
            </div>
          )}
          <div className={`dashboard-timer dashboard-timer--${countdownUrgency(secondsLeft)}`}>
            <ClockIcon />
            {formatCountdown(secondsLeft)}
          </div>
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
            <PanelToggleIcon />
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

        {/* Second icon-only rail, parallel to the question-number one above —
            notes icon pinned to the top, settings pinned to the bottom.
            Purely decorative for now (no wired-up panel behind either), same
            as the Test Results header's dock button elsewhere on this page. */}
        <div className="solve-side-rail">
          <button className="solve-side-rail-btn" aria-label="Notes">
            <NotesIcon />
          </button>
          <button className="solve-side-rail-btn solve-side-rail-btn--bottom" aria-label="Settings">
            <SettingsIcon />
          </button>
        </div>

        {!expanded && (
          <div
            className="solve-panel solve-panel--problem"
            style={{
              width: `${leftWidth}%`,
              // A CSS custom property (not a direct backgroundImage here)
              // so it cascades down and every nested box with its own
              // solid background (Sample Case, the STDIN/FUNCTION table,
              // Sample Output) can redraw the same watermark over itself
              // via `background-image: var(--watermark-bg, none)` — see
              // index.css — instead of the pattern being fully hidden
              // wherever a child covers it with an opaque surface color.
              "--watermark-bg": watermarkBackground,
            }}
          >
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
              {isLoading ? (
                <div className="code-editor-loading">
                  {/* A real rotating 3D wireframe cube (6 faces + CSS 3D
                      transforms), not a flat rectangle. */}
                  <div className="loading-cube">
                    <div className="loading-cube-face loading-cube-face--front" />
                    <div className="loading-cube-face loading-cube-face--back" />
                    <div className="loading-cube-face loading-cube-face--right" />
                    <div className="loading-cube-face loading-cube-face--left" />
                    <div className="loading-cube-face loading-cube-face--top" />
                    <div className="loading-cube-face loading-cube-face--bottom" />
                  </div>
                </div>
              ) : (
                <CodeEditor value={code} onChange={onCodeChange} />
              )}
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
                  {/* Tabs and the status banner are frozen — they never scroll
                      away; only the dynamic content below them
                      (.solve-results-content) does. */}
                  <div className="solve-results-tabs">
                    <button className="solve-results-tab solve-results-tab--active">All Cases</button>
                    <button className="solve-results-tab">Custom</button>
                  </div>

                  {runStatus === "running" && (
                    <div className="test-status-banner test-status-banner--running">
                      <SpinnerIcon /> Started
                    </div>
                  )}

                  {runStatus === "done" &&
                    (() => {
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
                            {allPassed ? <CheckIcon /> : <XIcon />}
                          </span>
                          {passedCount}/{TOTAL_TEST_CASES} test cases passed successfully
                        </div>
                      );
                    })()}

                  <div className="solve-results-content">
                    {runStatus === "idle" && (
                      <p className="muted-text solve-results-placeholder">Click on "Run" to run the test cases.</p>
                    )}

                    {runStatus === "running" && (
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
                    )}

                    {runStatus === "done" && (
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
                                  {casePassed ? <CheckIcon /> : <XIcon />}
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
                          <div className="test-detail-box">
                            <span className="test-detail-box-title">Compiler Message</span>
                            <div className="test-detail-box-divider" />
                            <p className="test-detail-compiler">
                              {caseResults[selectedCase] ? "Success" : "Wrong Answer"}
                            </p>
                          </div>

                          {selectedCase >= unlockedCount ? (
                            <div className="hidden-test-case-box">
                              <div className="hidden-test-case-heading">
                                <LockIcon />
                                <span>Hidden Test Case</span>
                              </div>
                              <p className="hidden-test-case-desc">
                                Hidden test cases help evaluate whether your code handles different scenarios
                                correctly. You can use print or log statements to debug and understand their
                                behavior.
                              </p>
                            </div>
                          ) : (
                            <>
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
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
