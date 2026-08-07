export function isDetailsFormValid(formData) {
  return (
    formData.fullName.trim().length > 0 &&
    formData.workExperience !== "" &&
    formData.agreeIntegrity &&
    formData.agreeTos
  );
}
