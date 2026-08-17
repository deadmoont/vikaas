import { useState } from "react";
import Chevron from "../components/Chevron.jsx";

// Nav buttons (Continue) live in the page-level footer (see App.jsx) —
// this component only renders the instructions content.
export default function InstructionsPage({ config }) {
  const { instructions, sampleTestNote, sections } = config;
  const [sectionsOpen, setSectionsOpen] = useState(true);

  return (
    <div className="panel-content">
      <h2 className="panel-heading">Instructions</h2>

      <ol className="instructions-list">
        {instructions.map((line, i) => (
          <li key={i}>
            {Array.isArray(line)
              ? line.map((segment, j) =>
                  typeof segment === "string" ? (
                    <span key={j}>{segment}</span>
                  ) : (
                    <a key={j} href={segment.href} onClick={(e) => e.preventDefault()}>
                      {segment.text}
                    </a>
                  )
                )
              : line}
          </li>
        ))}
      </ol>

      <div className="sample-card">
        <span>{sampleTestNote}</span>
        <button className="btn btn-secondary">Sample Test</button>
      </div>

      <h2 className="panel-subheading">Test Format</h2>
      <div className="collapsible">
        <button className="collapsible-header" onClick={() => setSectionsOpen((o) => !o)}>
          <span>Section Details</span>
          <Chevron open={sectionsOpen} />
        </button>
        {sectionsOpen && (
          <table className="sections-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Section</th>
                <th>Questions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{section.name}</td>
                  <td>{section.questions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
