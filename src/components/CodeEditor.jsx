import { useRef } from "react";
import { highlightCpp } from "../utils/highlightCpp.jsx";

// A line-numbered code editor with real (if lightweight, regex-based —
// see highlightCpp.jsx) syntax coloring: a transparent-text <textarea>
// sits on top of a colored <pre> overlay showing the same content, with
// scroll kept in sync between the two (plus the line-number gutter). The
// textarea is what's actually editable/focusable; the <pre> is purely
// decorative (pointer-events: none).
export default function CodeEditor({ value, onChange }) {
  const gutterRef = useRef(null);
  const highlightRef = useRef(null);
  const textareaRef = useRef(null);

  const lineCount = value.split("\n").length;

  const syncScroll = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = ta.scrollTop;
      highlightRef.current.scrollLeft = ta.scrollLeft;
    }
  };

  const handleKeyDown = (e) => {
    // Tab inserts spaces instead of moving focus away, like a real editor.
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const next = value.slice(0, selectionStart) + "    " + value.slice(selectionEnd);
      onChange(next);
      requestAnimationFrame(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 4;
      });
    }
  };

  return (
    <div className="code-editor">
      <div className="code-editor-gutter" ref={gutterRef}>
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div className="code-editor-stage">
        <pre className="code-editor-highlight" ref={highlightRef} aria-hidden="true">
          {highlightCpp(value)}
          {/* Trailing newline so the last empty line still reserves height. */}
          {"\n"}
        </pre>
        <textarea
          ref={textareaRef}
          className="code-editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
        />
      </div>
    </div>
  );
}
