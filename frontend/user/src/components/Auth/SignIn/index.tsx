"use client";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import SocialSignIn from "../SocialSignIn";
import Logo from "@/components/Layout/Header/Logo"
import Loader from "@/components/Common/Loader";

interface SignInProps {
  onSwitchToForgotPassword?: () => void;
  onLoginSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

const Signin = ({ onSwitchToForgotPassword, onLoginSuccess, onSwitchToSignUp }: SignInProps) => {
  const router = useRouter();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    checkboxToggle: false,
  });
  const [loading, setLoading] = useState(false);

  const loginUser = async (e: any) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    
    try {
      const result = await signIn("credentials", {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        console.log(result.error);
        setLoading(false);
        return;
      }

      if (result?.ok && !result?.error) {
        const session = await getSession();
        console.log("Login successful, session:", session);
        toast.success("Login successful");
        setLoading(false);

        // Close the modal
        if (onLoginSuccess) onLoginSuccess();

        const role = (session?.user as any)?.role?.toLowerCase?.();
        if (role === 'admin') {
          window.location.href = 'http://localhost:5173/';
          return;
        }
        router.push("/");
      }
    } catch (error: any) {
      setLoading(false);
      console.error("Login error:", error);
      toast.error(error.message || "Login failed");
    }
  };

  return (
    <>
      <div className="mb-10 text-center mx-auto inline-block max-w-[160px]">
        <Logo />
      </div>

      <SocialSignIn />

      <span className="z-1 relative my-8 block text-center before:content-[''] before:absolute before:h-px before:w-40% before:bg-black/15 before:left-0 before:top-3 after:content-[''] after:absolute after:h-px after:w-40% after:bg-black/15 after:top-3 after:right-0">
        <span className="text-body-secondary relative z-10 inline-block px-3 text-base text-black">
          OR
        </span>
      </span>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-[22px]">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            className="w-full rounded-md border border-black/20 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-grey focus:border-primary focus-visible:shadow-none text-black dark:text-white dark:focus:border-primary"
          />
        </div>
        <div className="mb-[22px]">
          <input
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            className="w-full rounded-md border border-black/20 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-grey focus:border-primary focus-visible:shadow-none text-black dark:text-white dark:focus:border-primary"
          />
        </div>
        <div className="mb-9">
          <button
            onClick={loginUser}
            type="submit"
            className="bg-primary w-full py-3 rounded-lg text-18 font-medium border border-primary hover:text-primary hover:bg-transparent"
          >
            Sign In {loading && <Loader />}
          </button>
        </div>
      </form>

      <button
        onClick={onSwitchToForgotPassword}
        className="mb-2 inline-block text-base text-dark hover:text-primary text-black dark:text-white dark:hover:text-primary"
      >
        Forgot Password?
      </button>
      <p className="text-body-secondary text-black dark:text-white text-base">
        Not a member yet?{" "}
        <button 
          onClick={onSwitchToSignUp}
          className="text-primary hover:underline bg-transparent border-none cursor-pointer"
        >
          Sign Up
        </button>
      </p>
    </>
  );
};

export default Signin;