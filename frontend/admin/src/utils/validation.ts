export const isStrongPassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && !/[<>{}[\]"'`]/.test(name);
};

export const getPasswordStrengthMessage = (password: string): string => {
  const checks = [
    { test: (p: string) => p.length >= 8, message: "At least 8 characters" },
    { test: (p: string) => /[A-Z]/.test(p), message: "One uppercase letter" },
    { test: (p: string) => /[a-z]/.test(p), message: "One lowercase letter" },
    { test: (p: string) => /\d/.test(p), message: "One number" },
    { test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p), message: "One special character" }
  ];

  const failedChecks = checks
    .filter(check => !check.test(password))
    .map(check => check.message);

  return failedChecks.length > 0 
    ? `Password must contain: ${failedChecks.join(", ")}`
    : "";
};

export const isToxic = async (text: string): Promise<boolean> => {
  // Here you would integrate with a content moderation API
  // For now, we'll do basic checks
  const toxicWords = ["fuck", "shit", "ass", "bitch", "dick"];
  const lowerText = text.toLowerCase();
  return toxicWords.some(word => lowerText.includes(word));
};