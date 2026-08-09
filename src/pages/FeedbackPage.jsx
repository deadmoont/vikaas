import { useState } from "react";
import { StarIcon } from "../components/icons.jsx";

// The true final screen — reached after confirming "Submit Test". Its own
// wrapper (not .setup-page — that one deliberately top-aligns for tall
// scrolling forms) centered both ways, with no background override so the
// page's usual gradient glow still shows through — unlike the flat
// dashboard/solve screens.
export default function FeedbackPage({ config }) {
  const { submittedTitle, submittedMessage, feedbackPrompt } = config;
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="feedback-page">
      <div className="feedback-content">
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
          {rating > 0 && <p className="inline-note feedback-thanks">Thanks for your feedback!</p>}
        </div>
      </div>
    </div>
  );
}
