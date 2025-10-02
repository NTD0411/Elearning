"use client";

import { useSession } from "next-auth/react";

export const useAuth = () => {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user,
    accessToken: (session as any)?.accessToken,
    refreshToken: (session as any)?.refreshToken,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",
  };
};