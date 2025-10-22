import { HeaderItem } from "@/types/menu";

export const getHeaderData = (role?: string): HeaderItem[] => {
  const commonItems: HeaderItem[] = [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "Packages", href: "/packages" },
  ];

  const roleSpecificItems: HeaderItem[] = role === "mentor" 
    ? [{ label: "Grade", href: "/grade" }]
    : [
        { label: "History", href: "/history" },
        { label: "Request Mentor", href: "/mentor-request" }
      ];

  const remainingItems: HeaderItem[] = [
    { label: "Mentor", href: "/mentor" },
    { label: "Tips", href: "/tips" },
  ];

  return [...commonItems, ...roleSpecificItems, ...remainingItems];
};
