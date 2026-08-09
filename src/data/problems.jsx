// The 3 hardcoded problems behind the Test Dashboard's "Solve" buttons.
// Mapped by *global* question number (1, 2, 3 — same numbering
// TestDashboardPage already uses across sections): 1 = Easy, 2 = Medium,
// 3 = Hard. This is a frontend demo — there's no real judge, so
// "Run Code" only ever shows the sample cases' expected output, never
// actually executes anything.

// Only the C++ entries have real starter code (see each problem's
// starterCode below) — picking anything else just keeps the C++ template
// with a hint that it's the only language actually provided in this demo.
const LANGUAGES = [
  "C",
  "Clojure",
  "C++23",
  "C++20",
  "C++14",
  "C++11",
  "C#",
  "Go",
  "Java",
  "JavaScript",
  "Kotlin",
  "PHP",
  "Python3",
  "Ruby",
  "Rust",
  "Swift",
  "TypeScript",
  "Bash",
];

const problems = {
  1: {
    difficulty: "Easy",
    title: "Bit Profit",
    functionName: "getMaxProfit",
    statement: (
      <>
        <p>
          Given two arrays of equal length <code>n</code>: <code>indicators</code> and{" "}
          <code>profit</code>, find the maximum possible sum of profits when selecting a subset
          of indicators such that their bitwise OR is less than or equal to a given integer{" "}
          <code>k</code>.
        </p>
        <p>
          Each element in the <code>indicators</code> array represents a trading indicator, and
          the corresponding element in the <code>profit</code> array represents the estimated
          profit for that indicator.
        </p>
        <p>
          <strong>Example</strong>
        </p>
        <p className="problem-mono">
          n = 3
          <br />
          k = 6
          <br />
          indicators = [3, 4, 2]
          <br />
          profit = [3, 4, 5]
        </p>
        <p>The optimal selection is indicators 4 and 2:</p>
        <ul>
          <li>Bitwise OR: 4 OR 2 = 6 (&le; k)</li>
          <li>Total profit: 4 + 5 = 9</li>
        </ul>
        <p>This gives the maximum possible profit while satisfying the constraint.</p>
        <p>
          <strong>Function Description</strong>
        </p>
        <p>
          Complete the function <code>getMaxProfit</code> in the editor with the following
          parameter(s):
        </p>
        <ul>
          <li>
            <code>int indicators[n]</code>: the indicators
          </li>
          <li>
            <code>int profit[n]</code>: the estimated profits
          </li>
          <li>
            <code>int k</code>: the maximum OR value of the indicators selected
          </li>
        </ul>
        <p>
          <strong>Returns</strong>
        </p>
        <ul>
          <li>
            <code>long</code>: the maximum possible sum of profits given the constraints
          </li>
        </ul>
      </>
    ),
    constraints: [
      "1 ≤ n ≤ 10^5",
      "0 ≤ indicators[i] < 2^30",
      "1 ≤ profit[i] ≤ 10^9",
      "0 ≤ k < 2^30",
    ],
    sampleCases: [
      {
        stdinGroups: [
          { rows: ["5"], label: "indicators[] size n = 5" },
          { rows: ["2", "3", "1", "5", "9"], label: "indicators = [2, 3, 1, 5, 9]" },
          { rows: ["5"], label: "profit[] size n = 5" },
          { rows: ["1", "2", "6", "1", "5"], label: "profit = [1, 2, 6, 1, 5]" },
          { rows: ["3"], label: "k = 3" },
        ],
        output: "9",
        explanation:
          "The optimal subset is indicators {2, 3, 1} with the bitwise OR 3, and the sum of profits 1 + 2 + 6 = 9.",
      },
      {
        stdinGroups: [
          { rows: ["4"], label: "indicators[] size n = 4" },
          { rows: ["1", "2", "3", "4"], label: "indicators = [1, 2, 3, 4]" },
          { rows: ["4"], label: "profit[] size n = 4" },
          { rows: ["4", "3", "2", "1"], label: "profit = [4, 3, 2, 1]" },
          { rows: ["1"], label: "k = 1" },
        ],
        output: "4",
        explanation: "The optimal subset is to choose indicator 1 alone, with the bitwise OR 1.",
      },
    ],
    starterCode: `#include <bits/stdc++.h>
using namespace std;

/*
 * Complete the 'getMaxProfit' function below.
 *
 * The function is expected to return a LONG_INTEGER.
 * The function accepts following parameters:
 *  1. INTEGER_ARRAY indicators
 *  2. INTEGER_ARRAY profit
 *  3. INTEGER k
 */

long getMaxProfit(vector<int> indicators, vector<int> profit, int k) {

}

int main() {
    // Reads STDIN in the format shown under Test Cases and calls getMaxProfit.
    return 0;
}
`,
  },

  2: {
    difficulty: "Medium",
    title: "Global Maximum",
    functionName: "findMaximum",
    statement: (
      <>
        <p>
          Given a sorted array of distinct positive integers, generate all possible subsequences
          that contain exactly <code>m</code> elements.
        </p>
        <p>For each subsequence:</p>
        <ul>
          <li>Compute the minimum absolute difference between any pair of its elements.</li>
          <li>Track the maximum value among all these minimum differences.</li>
        </ul>
        <p>
          Your task is to return the largest possible minimum absolute difference that can occur
          between any two elements in an <code>m</code>-element subsequence of the array.
        </p>
        <p>
          <strong>Example</strong>
        </p>
        <p className="problem-mono">
          arr = [2, 3, 5, 9]
          <br />
          m = 3
          <br />
          Output: 3
        </p>
        <p>
          <strong>Subsequences:</strong>
        </p>
        <ul>
          <li>[2, 3, 5]: Min difference = 1 (between 2 and 3)</li>
          <li>[2, 3, 9]: Min difference = 1 (between 2 and 3)</li>
          <li>[2, 5, 9]: Min difference = 3 (between 2 and 5)</li>
          <li>[3, 5, 9]: Min difference = 2 (between 3 and 5)</li>
        </ul>
        <p>The global maximum of these minimum differences is 3.</p>
      </>
    ),
    constraints: [
      "2 ≤ n ≤ 10^5",
      "1 ≤ arr[i] ≤ 10^9",
      "The array consists of distinct positive integers sorted in ascending order.",
      "2 ≤ m ≤ n",
    ],
    sampleCases: [
      {
        stdinGroups: [
          { rows: ["4"], label: "arr[] size n = 4" },
          { rows: ["2", "3", "5", "9"], label: "arr = [2, 3, 5, 9]" },
          { rows: ["3"], label: "m = 3" },
        ],
        output: "3",
        explanation: "The 3-element subsequence {2, 5, 9} has the largest minimum pairwise difference, 3.",
      },
    ],
    starterCode: `#include <bits/stdc++.h>
using namespace std;

/*
 * Complete the 'findMaximum' function below.
 *
 * The function is expected to return an INTEGER.
 * The function accepts following parameters:
 *  1. INTEGER_ARRAY arr
 *  2. INTEGER m
 */

int findMaximum(vector<int> arr, int m) {

}

int main() {
    // Reads STDIN in the format shown under Test Cases and calls findMaximum.
    return 0;
}
`,
  },

  3: {
    difficulty: "Hard",
    title: "Autocorrect Prototype",
    functionName: "getSearchResults",
    statement: (
      <>
        <p>
          Implement an autocorrect function that finds all anagrams of a given search query.
        </p>
        <p>Two strings are anagrams if they contain the same characters with the same frequencies.</p>
        <p>
          <strong>You are given:</strong>
        </p>
        <ul>
          <li>
            An array <code>words</code> of length <code>n</code>
          </li>
          <li>
            An array <code>queries</code> of length <code>q</code>
          </li>
        </ul>
        <p>
          <strong>For each query string:</strong>
        </p>
        <ul>
          <li>Return all words in <code>words</code> that are anagrams of the query</li>
          <li>Sort the matching words in alphabetical order</li>
          <li>Collect the results into an array (one list per query)</li>
        </ul>
        <p>Return a list of all these per-query results.</p>
        <p>
          <strong>Example</strong>
        </p>
        <p className="problem-mono">
          words = [&quot;duel&quot;, &quot;speed&quot;, &quot;dule&quot;, &quot;cars&quot;]
          <br />
          queries = [&quot;spede&quot;, &quot;deul&quot;]
          <br />
          Output: [[&quot;speed&quot;], [&quot;duel&quot;, &quot;dule&quot;]]
        </p>
        <p>
          <strong>Explanation:</strong>
        </p>
        <ul>
          <li>For &quot;spede&quot;, the only anagram is &quot;speed&quot;</li>
          <li>For &quot;deul&quot;, the anagrams are &quot;duel&quot; and &quot;dule&quot;</li>
        </ul>
      </>
    ),
    constraints: [
      "1 ≤ n, q ≤ 5000",
      "1 ≤ length of words[i], queries[i] ≤ 100",
      "It is guaranteed that each query word has at least one anagram in words.",
      "All strings consist of lowercase English letters only.",
    ],
    sampleCases: [
      {
        stdinGroups: [
          { rows: ["4"], label: "words[] size n = 4" },
          { rows: ["duel", "speed", "dule", "cars"], label: 'words = ["duel", "speed", "dule", "cars"]' },
          { rows: ["2"], label: "queries[] size q = 2" },
          { rows: ["spede", "deul"], label: 'queries = ["spede", "deul"]' },
        ],
        output: '[["speed"], ["duel", "dule"]]',
        explanation:
          '"spede" is an anagram of "speed". "deul" is an anagram of both "duel" and "dule" (alphabetical order).',
      },
    ],
    starterCode: `#include <bits/stdc++.h>
using namespace std;

/*
 * Complete the 'getSearchResults' function below.
 *
 * The function is expected to return a 2D_STRING_ARRAY.
 * The function accepts following parameters:
 *  1. STRING_ARRAY words
 *  2. STRING_ARRAY queries
 */

vector<vector<string>> getSearchResults(vector<string> words, vector<string> queries) {
    vector<vector<string>> ans;

    return ans;
}

int main() {
    // Reads STDIN in the format shown under Test Cases and calls getSearchResults.
    return 0;
}
`,
  },
};

export { LANGUAGES };
export default problems;
