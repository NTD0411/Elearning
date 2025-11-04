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

type Requirement = {
  text: string;
  test: (password: string) => boolean;
};

const requirements: Requirement[] = [
  { text: "At least 8 characters", test: (p) => p.length >= 8 },
  { text: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { text: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { text: "One number", test: (p) => /\d/.test(p) },
  { text: "One special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) }
];

export const getPasswordStrengthColor = (password: string): string => {
  const passedTests = requirements.filter(req => req.test(password)).length;
  
  if (passedTests === 0) return "bg-red-500";
  if (passedTests <= 2) return "bg-red-400";
  if (passedTests <= 3) return "bg-yellow-400";
  if (passedTests <= 4) return "bg-green-400";
  return "bg-green-500";
};

export const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const passedRequirements = requirements.filter(req => req.test(password));
  const progress = (passedRequirements.length / requirements.length) * 100;

  return (
    <div className="mt-2">
      <div className="h-1 w-full bg-gray-200 rounded-full">
        <div
          className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor(password)}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <ul className="mt-2 space-y-1 text-xs">
        {requirements.map((req, index) => (
          <li
            key={index}
            className={`flex items-center ${
              req.test(password) ? "text-green-600" : "text-gray-500"
            }`}
          >
            <svg
              className={`mr-2 h-4 w-4 ${
                req.test(password) ? "text-green-500" : "text-gray-400"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {req.test(password) ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              )}
            </svg>
            {req.text}
          </li>
        ))}
      </ul>
    </div>
  );
};