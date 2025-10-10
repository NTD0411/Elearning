import React from "react";
import Hero from "@/components/Home/Hero";
import Courses from "@/components/Home/Courses";
import Mentor from "@/components/Home/Mentor";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "eLearning",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Courses />
      <Mentor />
    </main>
  );
}