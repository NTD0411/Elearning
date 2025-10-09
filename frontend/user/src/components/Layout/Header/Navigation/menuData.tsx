import { HeaderItem } from "@/types/menu";

export const getHeaderData = (role?: string): HeaderItem[] => [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: role === "mentor" ? "Grade" : "History", href: role === "mentor" ? "/grade" : "/history" },
  { label: "Mentor", href: "/#mentor" },
  { label: "Tips", href: "/tips" },
];
