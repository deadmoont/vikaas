import problems from "../data/problems.jsx";

// Only 3 problems are hardcoded (see data/problems.jsx), but the Setup
// page's sections can add up to any number of questions. Rather than
// leaving question slots beyond 3 blank/unsolvable, the fixed set cycles
// round-robin across however many questions actually exist — e.g. with 5
// total questions, global question 4 reuses problem 1's content, question 5
// reuses problem 2's, and so on. Every question slot keeps its own
// independent code/submission state (keyed by questionId in App.jsx); only
// the problem statement/starter code/sample cases are shared when reused.
const PROBLEM_IDS = Object.keys(problems)
  .map(Number)
  .sort((a, b) => a - b);

export function getProblemForQuestion(questionId) {
  if (PROBLEM_IDS.length === 0) return undefined;
  const index = (questionId - 1) % PROBLEM_IDS.length;
  return problems[PROBLEM_IDS[index]];
}
