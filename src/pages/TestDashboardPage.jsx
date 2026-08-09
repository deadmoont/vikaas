import { useState } from "react";
import Chevron from "../components/Chevron.jsx";

// Shown after identity verification — lists the sections/questions exactly
// as configured on the Setup page. "Solve" doesn't open a real editor (this
// is a frontend onboarding-flow demo, no backend to serve question content).
export default function TestDashboardPage({ config, onSubmit }) {
  const { testTitle, sections } = config;
  const [demoNote, setDemoNote] = useState(false);

  const showDemoNote = () => {
    setDemoNote(true);
    setTimeout(() => setDemoNote(false), 3000);
  };

  let questionCounter = 0;

  return (
    <div className="dashboard-page">
      <div className="dashboard-topbar">
        <h1 className="dashboard-title">{testTitle}</h1>
        <button className="btn btn-primary" onClick={onSubmit}>
          Submit Test
        </button>
      </div>

      {demoNote && (
        <p className="inline-note dashboard-note">
          This is a demo — there's no real coding environment behind "Solve".
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
                  return (
                    <tr key={n}>
                      <td>
                        {n}. Question {n}
                      </td>
                      <td>Coding</td>
                      <td>
                        <button className="btn btn-primary dashboard-solve-btn" onClick={showDemoNote}>
                          Solve
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
  );
}
