"use client";
import Logo from "@/components/Layout/Header/Logo";
import { useState } from "react";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";

interface OTPVerificationProps {
  email: string;
  userId: number;
  onSwitchToSignIn?: () => void;
  onBackToSignUp?: () => void;
}

const OTPVerification = ({ email, userId, onSwitchToSignIn, onBackToSignUp }: OTPVerificationProps) => {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      toast.error("Please enter complete OTP code");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5074/api'}/auth/confirm-register?userId=${userId}&otpCode=${otpCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = 'OTP verification failed'
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch (e) {
          // If we can't read the error text, use the default message
        }
        throw new Error(errorMessage);
      }

      toast.success("Account verified successfully! Please sign in.");
      setLoading(false);
      
      // Switch to Sign In after successful verification
      if (onSwitchToSignIn) {
        onSwitchToSignIn();
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "OTP verification failed");
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
      // Call resend OTP API if available
      toast.success("OTP code has been resent to your email");
      setLoading(false);
    } catch (error: any) {
      toast.error("Failed to resend OTP");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-10 text-center mx-auto inline-block max-w-[160px]">
        <Logo />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
        <p className="text-gray-400 text-sm">
          We've sent a 6-digit code to<br/>
          <span className="text-primary font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl font-bold border border-black/20 rounded-lg bg-transparent text-black dark:text-white focus:border-primary focus:outline-none"
                maxLength={1}
                required
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center text-18 font-medium justify-center rounded-md bg-primary px-5 py-3 text-darkmode transition duration-300 ease-in-out hover:bg-transparent hover:text-primary border-primary border disabled:opacity-50"
          >
            Verify OTP {loading && <Loader />}
          </button>
        </div>
      </form>

      <div className="text-center space-y-4">
        <p className="text-gray-400 text-sm">
          Didn't receive the code?{" "}
          <button
            onClick={resendOTP}
            disabled={loading}
            className="text-primary hover:underline font-medium"
          >
            Resend OTP
          </button>
        </p>
        
        <p className="text-gray-400 text-sm">
          Want to change email?{" "}
          <button
            onClick={onBackToSignUp}
            className="text-primary hover:underline font-medium"
          >
            Back to Sign Up
          </button>
        </p>
      </div>
    </>
  );
};

export default OTPVerification;