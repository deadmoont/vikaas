import { useEffect, useState } from "react";
import { StarIcon, SpinnerIcon } from "../components/icons.jsx";

// The true final screen — reached after confirming "Submit Test". Its own
// wrapper (not .setup-page — that one deliberately top-aligns for tall
// scrolling forms) centered both ways, with no background override so the
// page's usual gradient glow still shows through — unlike the flat
// dashboard/solve screens.
export default function FeedbackPage({ config }) {
  const {
    submittedTitle,
    submittedMessage,
    feedbackPrompt,
    feedbackPlaceholder,
    feedbackSubmitLabel,
    feedbackThanksTitle,
    feedbackThanksMessage,
    mockInterviewLabel,
  } = config;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 900);
  };

  // The test is genuinely over once the "Thank you" screen shows — no
  // reason to keep the browser pinned in fullscreen past this point.
  useEffect(() => {
    if (submitted && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }, [submitted]);

  return (
    <div className="feedback-page">
      <div className="feedback-content">
        {!submitted ? (
          <>
            <h1 className="feedback-title">{submittedTitle}</h1>
            <p className="muted-text feedback-message">{submittedMessage}</p>

            <div className="feedback-box">
              <p className="feedback-box-title">{feedbackPrompt}</p>
              <div className="feedback-stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className="feedback-star"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                  >
                    <StarIcon filled={n <= (hoverRating || rating)} />
                  </button>
                ))}
              </div>

              {rating > 0 && (
                <>
                  <textarea
                    className="feedback-textarea"
                    placeholder={feedbackPlaceholder}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                  <button
                    className="btn btn-primary feedback-submit-btn"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <SpinnerIcon />}
                    {feedbackSubmitLabel}
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className="feedback-title">{feedbackThanksTitle}</h1>
            <p className="muted-text feedback-message">{feedbackThanksMessage}</p>
            <button className="btn btn-primary feedback-mock-btn">{mockInterviewLabel}</button>
          </>
        )}
      </div>
    </div>
  );
}
