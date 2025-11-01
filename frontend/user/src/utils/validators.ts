export class AuthFormValidator {
  static validatePassword(password: string): { isValid: boolean; message: string; failedChecks: string[] } {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const requirements = [
      { check: password.length >= minLength, message: "Mật khẩu phải có ít nhất 8 ký tự" },
      { check: hasUpperCase, message: "Mật khẩu phải chứa ít nhất 1 chữ in hoa" },
      { check: hasLowerCase, message: "Mật khẩu phải chứa ít nhất 1 chữ thường" },
      { check: hasNumbers, message: "Mật khẩu phải chứa ít nhất 1 số" },
      { check: hasSpecialChar, message: "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*,...)" }
    ];

    if (password.length < minLength) {
      return { isValid: false, message: "Mật khẩu phải có ít nhất 8 ký tự" };
    }
    if (!hasUpperCase) {
      return { isValid: false, message: "Mật khẩu phải chứa ít nhất 1 chữ in hoa" };
    }
    if (!hasLowerCase) {
      return { isValid: false, message: "Mật khẩu phải chứa ít nhất 1 chữ thường" };
    }
    if (!hasNumbers) {
      return { isValid: false, message: "Mật khẩu phải chứa ít nhất 1 số" };
    }
    if (!hasSpecialChar) {
      return { isValid: false, message: "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*,...)" };
    }

    return { isValid: true, message: "Mật khẩu hợp lệ" };
  }

  static getPasswordStrength(password: string): {
    strength: 'weak' | 'medium' | 'strong';
    color: string;
    message: string;
  } {
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ];

    const passedChecks = checks.filter(Boolean).length;

    if (passedChecks <= 2) {
      return {
        strength: 'weak',
        color: 'bg-red-500',
        message: 'Mật khẩu yếu'
      };
    } else if (passedChecks <= 4) {
      return {
        strength: 'medium',
        color: 'bg-yellow-500',
        message: 'Mật khẩu trung bình'
      };
    } else {
      return {
        strength: 'strong',
        color: 'bg-green-500',
        message: 'Mật khẩu mạnh'
      };
    }
  }

  static validateEmail(email: string): { isValid: boolean; message: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Email không hợp lệ" };
    }
    return { isValid: true, message: "Email hợp lệ" };
  }
}