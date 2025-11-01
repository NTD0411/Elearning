"use client";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { ThemeProvider } from "next-themes";
import ScrollToTop from "@/components/ScrollToTop";
import AuthProvider from "@/components/Auth/AuthProvider";
import { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";

const font = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], });

function MainContent({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  
  // Header có chiều cao tương tự giữa đăng nhập và chưa đăng nhập
  // (do đã giảm kích cỡ nút Sign In/Sign Up)
  // Dùng padding-top cố định cho cả 2 trường hợp
  const paddingTop = "pt-[100px]";
  
  return (
    <main className={`min-h-screen ${paddingTop}`}>
      {children}
    </main>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className}`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            enableSystem={true}
            defaultTheme="light"
          >
            <Header />
            <MainContent>{children}</MainContent>
            <Footer />
            <ScrollToTop />
            <Toaster position="top-right" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
