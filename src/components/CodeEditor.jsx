import { useRef, useState } from "react";
import { highlightCpp } from "../utils/highlightCpp.jsx";
import { FoldChevronIcon } from "./icons.jsx";

// Appended directly onto the region's *own* start line when folded (not a
// separate placeholder line) — e.g. "long getMaxProfit(...) {" becomes
// "long getMaxProfit(...) { ... }" on one line, matching how real editors
// collapse a block, rather than showing the opening delimiter twice.
const FOLD_SUFFIX_COMMENT = " ... */";
const FOLD_SUFFIX_BLOCK = " ... }";

// Finds foldable regions in the raw source: a block comment (/* ... */)
// spanning 2+ lines, or a brace block whose opening line ends with `{` and
// doesn't close until 2+ lines later. A heuristic over plain text (not a
// real parser — see highlightCpp.jsx for the same tradeoff on coloring),
// good enough for these hand-written starter files and normal editing.
function findFoldRegions(lines) {
  const regions = [];
  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (trimmed.startsWith("/*") && !trimmed.includes("*/")) {
      let j = i + 1;
      while (j < lines.length && !lines[j].includes("*/")) j++;
      if (j < lines.length && j > i) {
        regions.push({ start: i, end: j, suffix: FOLD_SUFFIX_COMMENT });
        i = j + 1;
        continue;
      }
    } else if (trimmed.endsWith("{") && !trimmed.startsWith("}")) {
      let depth = 1;
      let j = i + 1;
      while (j < lines.length && depth > 0) {
        for (const ch of lines[j]) {
          if (ch === "{") depth++;
          else if (ch === "}") depth--;
          if (depth === 0) break;
        }
        if (depth === 0) break;
        j++;
      }
      if (j < lines.length && j > i) {
        regions.push({ start: i, end: j, suffix: FOLD_SUFFIX_BLOCK });
        i = j + 1;
        continue;
      }
    }
    i++;
  }
  return regions;
}

// Content-based (not index-based) so a fold's collapsed/expanded state
// survives re-renders even if unrelated edits elsewhere shift line numbers.
const regionKey = (lines, r) => `${lines[r.start].trim()}::${lines[r.end].trim()}::${r.end - r.start}`;

// A line-numbered code editor with real (if lightweight, regex-based —
// see highlightCpp.jsx) syntax coloring and real (if heuristic) code
// folding: a transparent-text <textarea> sits on top of a colored <pre>
// overlay showing the same *displayed* (possibly folded) content, with
// scroll kept in sync between the two (plus the line-number gutter). The
// textarea is what's actually editable/focusable; the <pre> is purely
// decorative (pointer-events: none). `value`/`onChange` (from the parent)
// always carry the full, real, unfolded source — folding never touches
// them; it's purely a rendering-layer concept reconciled back to the real
// text on every keystroke (see applyDisplayChange below).
export default function CodeEditor({ value, onChange }) {
  const gutterRef = useRef(null);
  const highlightRef = useRef(null);
  const textareaRef = useRef(null);
  const [foldedKeys, setFoldedKeys] = useState(() => new Set());

  const rawLines = value.split("\n");
  const regions = findFoldRegions(rawLines);
  const regionByStart = new Map(regions.map((r) => [r.start, r]));

  // Build the displayed (possibly folded) lines, plus a parallel map back
  // to raw-line positions so edits can be reconciled back to `value`. A
  // folded region collapses entirely into its own start line (with the
  // suffix appended) — no separate placeholder line — so `rawIndex` always
  // means "the raw line this display row's number/edits map to".
  const displayLines = [];
  const lineMap = [];
  {
    let i = 0;
    while (i < rawLines.length) {
      const region = regionByStart.get(i);
      if (region) {
        const key = regionKey(rawLines, region);
        const folded = foldedKeys.has(key);
        if (folded) {
          displayLines.push(rawLines[i] + region.suffix);
          lineMap.push({ rawIndex: i, foldKey: key, folded: true });
          i = region.end + 1;
          continue;
        }
        displayLines.push(rawLines[i]);
        lineMap.push({ rawIndex: i, foldKey: key, folded: false });
      } else {
        displayLines.push(rawLines[i]);
        lineMap.push({ rawIndex: i });
      }
      i += 1;
    }
  }
  const displayText = displayLines.join("\n");

  const toggleFold = (key) => {
    setFoldedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Reconciles an edited *display* string back into the real raw source.
  // Diffs old vs. new display lines by common prefix/suffix; if the
  // changed span touches a folded line, that fold is expanded instead of
  // risking corrupting the hidden content — the keystroke itself is
  // dropped, and the user can retype once expanded, matching how real
  // editors auto-expand folds you type into.
  const applyDisplayChange = (newText) => {
    if (newText === displayText) return;

    const newLines = newText.split("\n");
    const oldLines = displayLines;

    let p = 0;
    while (p < oldLines.length && p < newLines.length && oldLines[p] === newLines[p]) p++;
    let s = 0;
    while (
      s < oldLines.length - p &&
      s < newLines.length - p &&
      oldLines[oldLines.length - 1 - s] === newLines[newLines.length - 1 - s]
    ) {
      s++;
    }

    const oldMiddle = lineMap.slice(p, oldLines.length - s);
    const touchedFold = oldMiddle.some((m) => m.folded);

    if (touchedFold) {
      setFoldedKeys((prev) => {
        const next = new Set(prev);
        for (const m of oldMiddle) {
          if (m.folded) next.delete(m.foldKey);
        }
        return next;
      });
      return;
    }

    const newMiddle = newLines.slice(p, newLines.length - s);
    const rawStart = p < lineMap.length ? lineMap[p].rawIndex : rawLines.length;
    const boundaryIdx = oldLines.length - s;
    // A boundary entry that's itself a (untouched) fold-start line needs
    // its *whole* raw range preserved, not just its start line — using
    // rawIndex here (== region.start) is correct either way since the
    // slice below keeps everything from that raw index onward as-is.
    const rawEndExclusive = boundaryIdx < lineMap.length ? lineMap[boundaryIdx].rawIndex : rawLines.length;

    const nextRawLines = [...rawLines.slice(0, rawStart), ...newMiddle, ...rawLines.slice(rawEndExclusive)];
    onChange(nextRawLines.join("\n"));
  };

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
      const ta = e.target;
      const { selectionStart, selectionEnd } = ta;
      const next = displayText.slice(0, selectionStart) + "    " + displayText.slice(selectionEnd);
      applyDisplayChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = selectionStart + 4;
      });
    }
  };

  return (
    <div className="code-editor">
      <div className="code-editor-gutter" ref={gutterRef}>
        {lineMap.map((entry, i) => {
          const region = regionByStart.get(entry.rawIndex);
          return (
            <div key={i} className="code-editor-gutter-row">
              {region ? (
                <button
                  type="button"
                  className="code-editor-fold-toggle"
                  onClick={() => toggleFold(entry.foldKey)}
                  aria-label={entry.folded ? "Expand" : "Collapse"}
                  style={{ transform: entry.folded ? "rotate(-90deg)" : "rotate(0deg)" }}
                >
                  <FoldChevronIcon />
                </button>
              ) : (
                <span className="code-editor-fold-spacer" />
              )}
              <span className="code-editor-line-no">{entry.rawIndex + 1}</span>
            </div>
          );
        })}
      </div>
      <div className="code-editor-stage">
        <pre className="code-editor-highlight" ref={highlightRef} aria-hidden="true">
          {highlightCpp(displayText)}
          {/* Trailing newline so the last empty line still reserves height. */}
          {"\n"}
        </pre>
        <textarea
          ref={textareaRef}
          className="code-editor-textarea"
          value={displayText}
          onChange={(e) => applyDisplayChange(e.target.value)}
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
