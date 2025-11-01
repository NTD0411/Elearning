"use client";

import React from 'react';
import { AuthFormValidator } from '@/utils/validators';

export const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const { strength, color, message } = AuthFormValidator.getPasswordStrength(password);
  const validation = AuthFormValidator.validatePassword(password);

  return (
    <div className="mt-2 space-y-2">
      <div className="space-y-1">
        <div className="flex h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`transition-all duration-300 ${color}`}
            style={{
              width: strength === 'weak' ? '33.33%' : strength === 'medium' ? '66.66%' : '100%'
            }}
          />
        </div>
        <p className={`text-sm ${
          strength === 'weak' ? 'text-red-500' : 
          strength === 'medium' ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {message}
        </p>
      </div>

      {!validation.isValid && (
        <ul className="text-sm space-y-1 text-red-500">
          {!password.length ? (
            <li>• Vui lòng nhập mật khẩu</li>
          ) : (
            <>
              {password.length < 8 && (
                <li>• Mật khẩu phải có ít nhất 8 ký tự</li>
              )}
              {!/[A-Z]/.test(password) && (
                <li>• Phải chứa ít nhất 1 chữ in hoa</li>
              )}
              {!/[a-z]/.test(password) && (
                <li>• Phải chứa ít nhất 1 chữ thường</li>
              )}
              {!/\d/.test(password) && (
                <li>• Phải chứa ít nhất 1 số</li>
              )}
              {!/[!@#$%^&*(),.?":{}|<>]/.test(password) && (
                <li>• Phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*,...)</li>
              )}
            </>
          )}
        </ul>
      )}
    </div>
  );
};