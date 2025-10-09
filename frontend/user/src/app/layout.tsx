import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { ThemeProvider } from "next-themes";
import ScrollToTop from "@/components/ScrollToTop";
import AuthProvider from "@/components/Auth/AuthProvider";
import { Toaster } from "react-hot-toast";

const font = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], });

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
            <main className="min-h-screen pt-[80px]">
              {children}
            </main>
            <Footer />
            <ScrollToTop />
            <Toaster position="top-right" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
