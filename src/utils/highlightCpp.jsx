// A small, single-pass regex tokenizer for C/C++ — not a real parser, just
// enough to color the 3 hardcoded starter-code snippets reasonably (this is
// a frontend demo; a real editor would use CodeMirror/Monaco).

const KEYWORDS = new Set([
  "return", "if", "else", "for", "while", "using", "namespace", "class", "struct",
  "public", "private", "protected", "static", "const", "break", "continue", "switch",
  "case", "default", "do", "new", "delete", "try", "catch", "throw", "sizeof",
  "typedef", "template", "operator", "this", "nullptr", "true", "false",
]);

const TYPES = new Set([
  "int", "long", "void", "bool", "char", "double", "float", "unsigned", "signed",
  "short", "auto", "string", "vector", "map", "set", "pair", "size_t",
]);

const TOKEN_REGEX =
  /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')|(#\s*include\b)|(<[^>\n]*>)|(#\s*\w+)|(\b\d+\.?\d*\b)|([A-Za-z_]\w*)|(\n)|([^\sA-Za-z0-9_\n]+)|( +)/g;

function tokenize(code) {
  const tokens = [];
  let match;
  TOKEN_REGEX.lastIndex = 0;
  while ((match = TOKEN_REGEX.exec(code))) {
    const [full, lineComment, blockComment, dstr, sstr, includeKw, angleStr, preproc, num, word, newline, punct, space] =
      match;
    if (lineComment || blockComment) tokens.push({ type: "comment", text: full });
    else if (dstr || sstr) tokens.push({ type: "string", text: full });
    else if (includeKw) tokens.push({ type: "preproc", text: full });
    else if (angleStr) tokens.push({ type: "string", text: full });
    else if (preproc) tokens.push({ type: "preproc", text: full });
    else if (num) tokens.push({ type: "number", text: full });
    else if (word) {
      if (KEYWORDS.has(word)) tokens.push({ type: "keyword", text: full });
      else if (TYPES.has(word)) tokens.push({ type: "type", text: full });
      else {
        const nextChar = code[TOKEN_REGEX.lastIndex];
        tokens.push({ type: nextChar === "(" ? "function" : "plain", text: full });
      }
    } else if (newline) tokens.push({ type: "newline", text: "\n" });
    else if (punct) tokens.push({ type: "punct", text: full });
    else if (space) tokens.push({ type: "plain", text: full });
  }
  return tokens;
}

export function highlightCpp(code) {
  return tokenize(code).map((t, i) =>
    t.type === "newline" || t.type === "plain" ? (
      t.text
    ) : (
      <span key={i} className={`hl-${t.type}`}>
        {t.text}
      </span>
    )
  );
}
