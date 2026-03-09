import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AnimatedGradient } from "@/components/AnimatedGradient";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GlitterBomb } from "@/components/GlitterBomb";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sales Lead Qualifier",
  description: "Find out if we're the right fit for your business",
  keywords: ["sales", "lead", "qualification", "BANT"],
  openGraph: {
    title: "Sales Lead Qualifier",
    description: "Find out if we're the right fit for your business",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sales Lead Qualifier",
    description: "Find out if we're the right fit for your business",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-gray-50 transition-colors`}
      >
        <ThemeProvider>
          <AnimatedGradient />
          <GlitterBomb density={150} speed={0.8} />
          {children}
        </ThemeProvider>
        <noscript>
          <div className="fixed inset-0 flex items-center justify-center bg-red-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
              <h1 className="text-2xl font-bold text-red-900 mb-4">JavaScript Required</h1>
              <p className="text-red-700">
                This application requires JavaScript to be enabled. Please enable it in your browser
                settings.
              </p>
            </div>
          </div>
        </noscript>
      </body>
    </html>
  );
}
