"use client";
import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";
import Logo from "@/components/Layout/Header/Logo";
import { AuthService } from "@/services/authService";

interface ForgotPasswordProps {
  onSwitchToSignIn?: () => void;
  onSwitchToResetPassword?: (email: string) => void;
}

const ForgotPassword = ({ onSwitchToSignIn, onSwitchToResetPassword }: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoader(true);

    try {
      await AuthService.forgotPassword(email);
      toast.success("Reset OTP has been sent to your email");
      setLoader(false);
      
      // Switch to reset password form
      if (onSwitchToResetPassword) {
        onSwitchToResetPassword(email);
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast.error(error.message || "Failed to send reset email");
      setLoader(false);
    }
  };

  return (
    <>
      <div className="mb-10 text-center mx-auto inline-block max-w-[160px]">
        <Logo />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black mb-2">Forgot Password?</h2>
        <p className="text-gray-600 text-sm">
          Enter your email address and we'll send you an OTP to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-[22px]">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-black/20 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-grey focus:border-primary focus-visible:shadow-none text-black dark:text-white dark:focus:border-primary"
          />
        </div>
        
        <div className="mb-9">
          <button
            type="submit"
            disabled={loader}
            className="flex w-full items-center text-18 font-medium justify-center rounded-md bg-primary px-5 py-3 text-darkmode transition duration-300 ease-in-out hover:bg-transparent hover:text-primary border-primary border disabled:opacity-50"
          >
            Send Reset OTP {loader && <Loader />}
          </button>
        </div>
      </form>

      <div className="text-center space-y-4">
        <p className="text-gray-600 text-base">
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

export default ForgotPassword;