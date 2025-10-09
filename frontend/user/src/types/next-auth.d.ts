import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string;
    } & DefaultSession["user"];
  }
}
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string;
      name?: string;
      role?: string;
      fullName?: string;
      portraitUrl?: string;
      experience?: string;
      gender?: string;
      address?: string;
      dateOfBirth?: string;
    }
    accessToken?: string;
    refreshToken?: string;
    expires: string;
  }

  interface User {
    id: string;
    email?: string;
    name?: string;
    role?: string;
    fullName?: string;
    portraitUrl?: string;
    experience?: string;
    gender?: string;
    address?: string;
    dateOfBirth?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string;
    name?: string;
    role?: string;
    fullName?: string;
    portraitUrl?: string;
    experience?: string;
    gender?: string;
    address?: string;
    dateOfBirth?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}