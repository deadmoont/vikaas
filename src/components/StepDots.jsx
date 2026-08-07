export default function StepDots({ total, current }) {
  return (
    <div className="step-dots" role="tablist" aria-label="Onboarding progress">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`step-dot ${i === current ? "step-dot--active" : ""}`}
          role="tab"
          aria-selected={i === current}
        />
      ))}
    </div>
  );
}
