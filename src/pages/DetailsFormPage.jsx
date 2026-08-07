import testConfig from "../config/testConfig.js";

// Nav buttons (Back/Continue) live in the page-level footer (see App.jsx) —
// this component only renders the form fields.
export default function DetailsFormPage({ formData, setFormData }) {
  const { workExperienceOptions, integrityAgreementText, tosAgreementPrefix, tosLabel, aiNoticeLabel } =
    testConfig;

  const update = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="panel-content">
      <h2 className="panel-heading">Please enter your details</h2>

      <label className="field-label" htmlFor="fullName">
        Full Name <span className="required">*</span>
      </label>
      <input
        id="fullName"
        className="text-input"
        type="text"
        placeholder="Enter your full name"
        value={formData.fullName}
        onChange={(e) => update("fullName", e.target.value)}
      />

      <label className="field-label" htmlFor="workExperience">
        Work Experience <span className="required">*</span>
      </label>
      <select
        id="workExperience"
        className="select-input"
        value={formData.workExperience}
        onChange={(e) => update("workExperience", e.target.value)}
      >
        <option value="" disabled>
          Select your work experience
        </option>
        {workExperienceOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <label className="checkbox-card">
        <input
          type="checkbox"
          checked={formData.agreeIntegrity}
          onChange={(e) => update("agreeIntegrity", e.target.checked)}
        />
        <span>
          {integrityAgreementText} <span className="required">*</span>
        </span>
      </label>

      <label className="checkbox-card">
        <input
          type="checkbox"
          checked={formData.agreeTos}
          onChange={(e) => update("agreeTos", e.target.checked)}
        />
        <span>
          {tosAgreementPrefix}{" "}
          <a href="#" onClick={(e) => e.preventDefault()}>
            {tosLabel}
          </a>{" "}
          and{" "}
          <a href="#" onClick={(e) => e.preventDefault()}>
            {aiNoticeLabel}
          </a>
          . <span className="required">*</span>
        </span>
      </label>
    </div>
  );
}
