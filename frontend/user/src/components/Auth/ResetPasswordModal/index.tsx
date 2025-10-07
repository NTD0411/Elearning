"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";
import Logo from "@/components/Layout/Header/Logo";
import { AuthService } from "@/services/authService";

interface ResetPasswordProps {
  email: string;
  onSwitchToSignIn?: () => void;
  onBackToForgotPassword?: () => void;
}

const ResetPasswordModal = ({ email, onSwitchToSignIn, onBackToForgotPassword }: ResetPasswordProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    otpCode: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.otpCode.trim()) {
      toast.error("Please enter the OTP code");
      return;
    }

    if (!formData.newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      // Call reset password API (you'll need to add this to AuthService)
      await AuthService.resetPassword({
        email: email,
        otpCode: formData.otpCode,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      toast.success("Password reset successfully! Please sign in with your new password.");
      setLoading(false);
      
      // Switch to sign in
      if (onSwitchToSignIn) {
        onSwitchToSignIn();
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to reset password");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-10 text-center mx-auto inline-block max-w-[160px]">
        <Logo />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black mb-2">Reset Password</h2>
        <p className="text-gray-600 text-sm">
          Enter the OTP sent to <span className="text-primary font-medium">{email}</span><br/>
          and your new password.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-[22px]">
          <input
            type="text"
            name="otpCode"
            placeholder="Enter OTP Code"
            value={formData.otpCode}
            onChange={handleInputChange}
            required
            className="w-full rounded-md border border-black/20 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-grey focus:border-primary focus-visible:shadow-none text-black dark:text-white dark:focus:border-primary"
          />
        </div>
        
        <div className="mb-[22px]">
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={handleInputChange}
            required
            className="w-full rounded-md border border-black/20 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-grey focus:border-primary focus-visible:shadow-none text-black dark:text-white dark:focus:border-primary"
          />
        </div>
        
        <div className="mb-[22px]">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            className="w-full rounded-md border border-black/20 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-grey focus:border-primary focus-visible:shadow-none text-black dark:text-white dark:focus:border-primary"
          />
        </div>
        
        <div className="mb-9">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center text-18 font-medium justify-center rounded-md bg-primary px-5 py-3 text-darkmode transition duration-300 ease-in-out hover:bg-transparent hover:text-primary border-primary border disabled:opacity-50"
          >
            Reset Password {loading && <Loader />}
          </button>
        </div>
      </form>

      <div className="text-center space-y-4">
        <p className="text-gray-600 text-sm">
          Didn't receive the OTP?{" "}
          <button
            onClick={onBackToForgotPassword}
            className="text-primary hover:underline font-medium"
          >
            Back to Forgot Password
          </button>
        </p>
        
        <p className="text-gray-600 text-sm">
          Remember your password?{" "}
          <button
            onClick={onSwitchToSignIn}
            className="text-primary hover:underline font-medium"
          >
            Back to Sign In
          </button>
        </p>
      </div>
    </>
  );
};

export default ResetPasswordModal;