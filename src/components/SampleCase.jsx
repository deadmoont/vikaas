import { useState } from "react";
import Chevron from "./Chevron.jsx";

// A collapsible "Sample Case N" block: a two-column STDIN/FUNCTION table
// (the label only appears on the first row of each field's group of raw
// input lines — e.g. an array's size line, then its values — matching the
// reference platform's layout), followed by Sample Output and Explanation.
export default function SampleCase({ index, stdinGroups, output, explanation, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="sample-case">
      <button className="sample-case-toggle" onClick={() => setOpen((o) => !o)}>
        <Chevron open={open} />
        Sample Case {index}
      </button>

      {open && (
        <div className="sample-case-content">
          <p className="field-label sample-case-io-heading">Sample Input For Custom Testing</p>
          <table className="sample-case-io-table">
            <thead>
              <tr>
                <th>STDIN</th>
                <th>FUNCTION</th>
              </tr>
            </thead>
            <tbody>
              {stdinGroups.map((group, gi) =>
                group.rows.map((value, ri) => (
                  <tr key={`${gi}-${ri}`}>
                    <td>{value}</td>
                    <td className="sample-case-io-label">{ri === 0 ? <>&rarr; {group.label}</> : ""}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <p className="field-label sample-case-io-heading">Sample Output</p>
          <pre className="sample-case-block">{output}</pre>

          <p className="field-label sample-case-io-heading">Explanation</p>
          <p className="muted-text sample-case-explanation">{explanation}</p>
        </div>
      )}
    </div>
  );
}
