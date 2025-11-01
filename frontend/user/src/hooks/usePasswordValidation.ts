import { useState, useEffect } from 'react';
import { isStrongPassword } from '../components/PasswordStrength';

export const usePasswordValidation = (password: string) => {
  const [validLength, setValidLength] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [upperCase, setUpperCase] = useState(false);
  const [lowerCase, setLowerCase] = useState(false);
  const [specialChar, setSpecialChar] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setValidLength(password.length >= 8);
    setUpperCase(/[A-Z]/.test(password));
    setLowerCase(/[a-z]/.test(password));
    setHasNumber(/\d/.test(password));
    setSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password));
    
    setIsValid(isStrongPassword(password));
  }, [password]);

  return {
    validLength,
    hasNumber,
    upperCase,
    lowerCase,
    specialChar,
    isValid
  };
};