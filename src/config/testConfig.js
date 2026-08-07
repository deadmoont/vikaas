/**
 * ============================================================================
 *  TEST CONFIGURATION — edit this file to customize everything about the test.
 *  Nothing in the components below has hard-coded text; it all flows from here.
 * ============================================================================
 */

const testConfig = {
  // ---- Branding / title shown on the left panel -----------------------
  // Shown big at the top-left of every screen. Use " - " as a separator,
  // it wraps naturally the same way HackerRank-style titles do.
  testTitle: "Different - IIIT A - 6M - Campus Hiring'26",

  // Small text at the very bottom of the left panel.
  poweredBy: "HackerRank",

  // Footer links (left panel, bottom). Set href to "#" for placeholders.
  footerLinks: [
    { label: "Platform Help", href: "#" },
    { label: "Execution Environment", href: "#" },
    { label: "FAQ", href: "#" },
  ],

  // ---- Timing / login window -------------------------------------------
  durationMinutes: 90,
  loginWindow: {
    start: "5 Aug 2026, 7:00 PM",
    end: "5 Aug 2026, 7:30 PM",
    timezone: "IST(+05:30)",
  },

  // ---- Step 1: Instructions ---------------------------------------------
  instructions: [
    "This is a timed test. Please make sure you are not interrupted during the test, as the timer cannot be paused once started.",
    "Please ensure you have a stable internet connection.",
    "We recommend you to try the sample test for a couple of minutes, before taking the main test.",
    "Before taking the test, please go through the FAQs to resolve your queries related to the test or the platform.",
  ],

  sampleTestNote: "Try a sample test to get familiar with the format and environment",

  // Test format / section table. "questions" can be a number or a string.
  sections: [
    { name: "Problem Solving (Basic)", questions: 1 },
    { name: "Problem Solving (Intermediate)", questions: 1 },
    { name: "Problem Solving (Advanced)", questions: 1 },
  ],

  // ---- Step 2: Candidate details form ------------------------------------
  workExperienceOptions: [
    "Fresher / No experience",
    "0 - 1 years",
    "1 - 3 years",
    "3 - 5 years",
    "5+ years",
  ],

  integrityAgreementText:
    "I agree not to copy code from any source, including colleagues, and will refrain from accessing websites or AI tools for assistance. I further agree not to copy or share any content or questions from this assessment with any other medium or forum.",

  tosAgreementPrefix: "I agree to the",
  tosLabel: "Terms of Service",
  aiNoticeLabel: "AI Notice",

  // ---- Step 3: Integrity guidelines & permissions ------------------------
  integrityGuidelinesIntro:
    "Please review these Integrity Guidelines to ensure compliance and avoid unintended violations. Any suspicious activity may be flagged and reported to the hiring team.",

  integrityGuidelines: [
    "Do not use another person, website, or AI tool to answer questions for you.",
    "Do not switch tabs, windows, or applications during the test.",
    "Do not use a virtual background or allow other people into the room.",
    "Keep your face clearly visible in the webcam at all times.",
    "Use only a single monitor for the duration of the test.",
  ],

  permissionsIntro: "A few permissions are needed to run the test environment properly.",

  webcamPermission: {
    title: "Allow Webcam Access",
    description: "Please allow webcam access for identity verification and photo capture during the test.",
    grantLabel: "Grant Access",
    modalTitle: "For best results make sure",
    modalChecklist: [
      "Avoid virtual background",
      "Find a private place",
      "Use proper light source",
      "Your face visible in the webcam",
    ],
  },

  monitorPermission: {
    title: "Check for Multiple Monitors",
    description: "This ensures you're using only one screen during the test, maintaining a fair environment for all test-takers.",
    checkLabel: "Check Now",
  },

  fullscreenPermission: {
    title: "Enter Fullscreen Mode",
    description: "This helps maintain focus on the test and prevents access to other applications or browser tabs.",
    enterLabel: "Enter Fullscreen",
  },

  startTestLabel: "Start Test",
  backLabel: "Back",
  continueLabel: "Continue",

  completionTitle: "You're all set! \u{1F389}",
  completionMessage:
    "This is a frontend-only demo, so the actual coding environment isn't wired up. In a real deployment, the test would launch here.",
};

export default testConfig;