import { useEffect, useMemo, useRef, useState } from "react";
import defaultConfig from "./config/testConfig.js";
import Sidebar from "./components/Sidebar.jsx";
import StepDots from "./components/StepDots.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import SetupPage from "./pages/SetupPage.jsx";
import InstructionsPage from "./pages/InstructionsPage.jsx";
import DetailsFormPage from "./pages/DetailsFormPage.jsx";
import PermissionsPage from "./pages/PermissionsPage.jsx";
import PhotoCapturePage from "./pages/PhotoCapturePage.jsx";
import TestDashboardPage from "./pages/TestDashboardPage.jsx";
import SolvePage from "./pages/SolvePage.jsx";
import FeedbackPage from "./pages/FeedbackPage.jsx";
import LoadingPage from "./components/LoadingPage.jsx";
import useCamera from "./hooks/useCamera.js";
import useFullscreen from "./hooks/useFullscreen.js";
import { isDetailsFormValid } from "./utils/validators.js";
import { buildConfigFromSetup } from "./utils/buildConfigFromSetup.js";

const STEPS = ["instructions", "details", "permissions"];

const initialFormData = {
  fullName: "",
  workExperience: "",
  agreeIntegrity: false,
  agreeTos: false,
};

export default function App() {
  // In-memory only, deliberately — no localStorage. Setup is a one-time
  // step per page load: once submitted there's no in-app way back to it,
  // and the only way to redo it is a real browser refresh (which remounts
  // this component from scratch and resets setupFields to null again).
  // stage flow: setup -> onboarding (3 steps) -> testDashboard (<-> solve).
  // Photo capture is NOT its own stage — it's an overlay rendered on top of
  // testDashboard (see showPhotoCapture below), matching the reference,
  // where the dashboard is already loaded and visible-but-blurred behind
  // the capture prompt rather than a blank page shown before it.
  const [setupFields, setSetupFields] = useState(null);
  const [stage, setStage] = useState("setup");
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  // Message shown by the brief "loading" stage inserted between Setup ->
  // Instructions and Start Test -> Test Dashboard (see transitionTo below).
  const [loadingMessage, setLoadingMessage] = useState(null);

  const [stepIndex, setStepIndex] = useState(0);
  // Tracks which way we just navigated so the incoming step's slide
  // direction matches: Continue slides in from the right, Back from the left.
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [theme, setTheme] = useState("dark");
  // Fixed once, when the actual test starts — both TestDashboardPage and
  // SolvePage derive the same live countdown from this instead of each
  // running their own independent (and driftable) timer.
  const [testStartTime, setTestStartTime] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  // Question ids the candidate has hit "Save & Proceed" on at least once —
  // drives "Solve" -> "Modify" on the dashboard and the checkmark badge on
  // SolvePage's rail. Not persisted; resets with the rest of the demo.
  const [submittedQuestions, setSubmittedQuestions] = useState(() => new Set());
  // Per-question code, keyed by questionId — lifted up here (not local state
  // inside SolvePage) specifically because SolvePage remounts on every
  // question switch (key={activeQuestionId}, so its own UI state like
  // language/run-status resets cleanly between questions). If code lived
  // there too, that same remount would wipe out whatever the candidate had
  // typed the moment they switched questions or went back to the dashboard.
  // This survives navigation and only ever clears on a real page refresh.
  const [codeByQuestion, setCodeByQuestion] = useState({});
  const scrollRef = useRef(null);

  // Lifted up (rather than living inside PermissionsPage) so the page-level
  // footer's "Start Test" button — and later PhotoCapturePage — can read
  // camera/fullscreen state too.
  const camera = useCamera();
  const fullscreen = useFullscreen();

  const config = useMemo(
    () => (setupFields ? buildConfigFromSetup(setupFields) : defaultConfig),
    [setupFields]
  );

  // Briefly shows the "Fetching test details" loading stage, then hands off
  // to `land` (which sets whatever stage/state the transition was actually
  // headed toward). Used at the two points that go somewhere new rather than
  // just stepping within onboarding: Setup -> Instructions, and
  // Start Test -> Test Dashboard.
  const transitionTo = (message, land) => {
    setLoadingMessage(message);
    setStage("loading");
    setTimeout(() => {
      land();
      setLoadingMessage(null);
    }, 1400);
  };

  const handleSetupComplete = (fields) => {
    setSetupFields(fields);
    setStepIndex(0);
    setDirection(1);
    transitionTo("Fetching test details", () => setStage("onboarding"));
  };

  const goTo = (index) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, index));
    setDirection(clamped >= stepIndex ? 1 : -1);
    setStepIndex(clamped);
  };

  // Each step change should land scrolled to the top, not wherever the
  // previous step's scroll position happened to be.
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [stepIndex]);

  const markQuestionSubmitted = (id) =>
    setSubmittedQuestions((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  const updateQuestionCode = (id, code) => setCodeByQuestion((prev) => ({ ...prev, [id]: code }));

  const canContinueDetails = isDetailsFormValid(formData);
  const canStartTest = camera.status === "granted" && fullscreen.isFullscreen;

  const handleToggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  if (stage === "loading") {
    return (
      <div className={`app app--${theme}`} data-theme={theme}>
        <LoadingPage message={loadingMessage} />
      </div>
    );
  }

  if (stage === "setup") {
    return (
      <div className={`app app--${theme}`} data-theme={theme}>
        <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
        <SetupPage onComplete={handleSetupComplete} />
      </div>
    );
  }

  if (stage === "testDashboard") {
    return (
      <div className={`app app--${theme}`} data-theme={theme}>
        {/* No standalone ThemeToggle here — TestDashboardPage renders it
            inline as part of its own fixed action-button group instead. */}
        <TestDashboardPage
          config={config}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onSubmit={() => setStage("feedback")}
          onSolve={(id) => {
            setActiveQuestionId(id);
            setStage("solve");
          }}
          testStartTime={testStartTime}
          submittedQuestions={submittedQuestions}
        />
        {/* Overlaid on top of the dashboard above (blurred backdrop), not a
            separate page shown before it — see the stage-flow note above. */}
        {showPhotoCapture && (
          <PhotoCapturePage camera={camera} onComplete={() => setShowPhotoCapture(false)} />
        )}
      </div>
    );
  }

  if (stage === "solve") {
    return (
      <div className={`app app--${theme}`} data-theme={theme}>
        <SolvePage
          key={activeQuestionId}
          questionId={activeQuestionId}
          sections={config.sections}
          onSelectQuestion={setActiveQuestionId}
          onBack={() => setStage("testDashboard")}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          testStartTime={testStartTime}
          durationMinutes={config.durationMinutes}
          submittedQuestions={submittedQuestions}
          onSubmitQuestion={markQuestionSubmitted}
          savedCode={codeByQuestion[activeQuestionId]}
          onCodeChange={(code) => updateQuestionCode(activeQuestionId, code)}
          candidateEmail={config.candidateEmail}
          companyLogo={config.companyLogo}
        />
      </div>
    );
  }

  if (stage === "feedback") {
    // The true terminal screen — no restart affordance here, matching the
    // reference and this app's "refresh to start over" philosophy used
    // everywhere else (see the Setup-page notes above).
    return (
      <div className={`app app--${theme}`} data-theme={theme}>
        <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
        <FeedbackPage config={config} />
      </div>
    );
  }

  return (
    <div className={`app app--${theme}`} data-theme={theme}>
      <ThemeToggle theme={theme} onToggle={handleToggleTheme} />

      <div className="app-shell">
        <Sidebar config={config} />

        <div className="content-column">
          <main className="panel">
            <div className="panel-scroll" ref={scrollRef}>
              {/* key={stepIndex} forces a remount on every step change, which
                  restarts the CSS slide-in animation from scratch each time. */}
              <div
                key={stepIndex}
                className={direction === 1 ? "step-slide-right" : "step-slide-left"}
              >
                {STEPS[stepIndex] === "instructions" && <InstructionsPage config={config} />}
                {STEPS[stepIndex] === "details" && (
                  <DetailsFormPage config={config} formData={formData} setFormData={setFormData} />
                )}
                {STEPS[stepIndex] === "permissions" && (
                  <PermissionsPage config={config} camera={camera} fullscreen={fullscreen} />
                )}
              </div>
            </div>
          </main>

          <div className="content-footer">
            <StepDots total={STEPS.length} current={stepIndex} />

            <div className="nav-buttons">
              {stepIndex > 0 && (
                <button className="btn btn-outline" onClick={() => goTo(stepIndex - 1)}>
                  {config.backLabel}
                </button>
              )}

              {stepIndex === 0 && (
                <button className="btn btn-primary" onClick={() => goTo(1)}>
                  {config.continueLabel}
                </button>
              )}

              {stepIndex === 1 && (
                <button className="btn btn-primary" disabled={!canContinueDetails} onClick={() => goTo(2)}>
                  {config.continueLabel}
                </button>
              )}

              {stepIndex === 2 && (
                <button
                  className="btn btn-primary"
                  disabled={!canStartTest}
                  onClick={() => {
                    // Timer starts once the dashboard actually lands (after
                    // the loading stage below), not before — the countdown
                    // shouldn't burn time while "Fetching test details" is
                    // still on screen. The dashboard (and its live countdown)
                    // is then visible immediately, just blurred behind the
                    // capture overlay, not gated behind a blank page.
                    transitionTo("Fetching test details", () => {
                      setTestStartTime(Date.now());
                      setShowPhotoCapture(true);
                      setStage("testDashboard");
                    });
                  }}
                >
                  {config.startTestLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
