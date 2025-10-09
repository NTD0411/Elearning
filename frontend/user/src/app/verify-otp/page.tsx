"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Logo from "@/components/Layout/Header/Logo";
import Loader from "@/components/Common/Loader";

const VerifyOTP = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const userIdParam = searchParams.get("userId");
    const emailParam = searchParams.get("email");
    
    if (userIdParam && emailParam) {
      setUserId(userIdParam);
      setEmail(emailParam);
    } else {
      toast.error("Invalid verification link");
      router.push("/");
    }
  }, [searchParams, router]);

  const handleVerifyOTP = async (e: any) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5074/api'}/auth/confirm-register?userId=${userId}&otpCode=${otp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'OTP verification failed');
      }

      toast.success("Account verified successfully! Please sign in.");
      setLoading(false);
      router.push("/signin");
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "OTP verification failed");
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // Implement resend OTP logic if backend supports it
    toast("Resend OTP feature will be implemented");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-auto flex justify-center">
            <Logo />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification code to{" "}
            <span className="font-medium text-primary">{email}</span>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="otp" className="sr-only">
                Verification Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                maxLength={6}
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                  if (value.length <= 6) {
                    setOtp(value);
                  }
                }}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader /> : "Verify Account"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              Didn't receive the code? Resend
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              ← Back to homepage
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;