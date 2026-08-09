// Add/remove/edit an arbitrary number of {name, questions} rows — feeds the
// "Test Format" section table shown later in the actual test flow.
export default function SectionsEditor({ sections, onChange }) {
  const updateSection = (index, patch) => {
    onChange(sections.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addSection = () => {
    onChange([...sections, { name: "", questions: 1 }]);
  };

  const removeSection = (index) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  return (
    <div className="sections-editor">
      {sections.map((section, i) => (
        <div className="sections-editor-row" key={i}>
          <span className="sections-editor-index">{i + 1}</span>

          <input
            className="text-input"
            type="text"
            placeholder="Section name (e.g. Problem Solving (Basic))"
            value={section.name}
            onChange={(e) => updateSection(i, { name: e.target.value })}
          />

          <input
            className="text-input sections-editor-qty"
            type="number"
            min="1"
            placeholder="Qs"
            value={section.questions}
            onChange={(e) => updateSection(i, { questions: Math.max(1, Number(e.target.value) || 1) })}
          />

          <button
            type="button"
            className="icon-btn sections-editor-remove"
            onClick={() => removeSection(i)}
            disabled={sections.length === 1}
            aria-label={`Remove section ${i + 1}`}
            title={sections.length === 1 ? "At least one section is required" : "Remove section"}
          >
            ✕
          </button>
        </div>
      ))}

      <button type="button" className="btn btn-outline sections-editor-add" onClick={addSection}>
        + Add Section
      </button>
    </div>
  );
}
