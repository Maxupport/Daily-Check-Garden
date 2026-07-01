import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import Toast from "@/components/Toast";
import OnboardingCheck from "@/components/OnboardingCheck";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "日更の花圃 | Daily Check Garden",
  description: "紀錄每日任務、種下習慣的種子，並獲得三色花獎勵的社群花圃。",
  openGraph: {
    title: "日更の花圃 | Daily Check Garden",
    description: "紀錄每日任務、種下習慣的種子，並獲得三色花獎勵的社群花圃。",
    siteName: "日更の花圃",
    locale: "zh_TW",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="bg-gray-100 flex items-center justify-center min-h-screen selection:bg-brand-purple selection:text-white">
        <Providers>
          <AppProvider>
          {/* Mobile-First Container */}
          <div id="app-container" className="w-full max-w-md bg-slate-900 h-[100dvh] md:h-[850px] md:max-h-[100dvh] md:rounded-[3rem] md:border-[8px] border-black shadow-2xl relative overflow-hidden flex flex-col text-slate-100">
            <OnboardingCheck />
            <Header />
            
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-24 px-6 relative z-10 scrollbar-hide">
              {children}
            </main>

            <BottomNav />
            <Toast />
          </div>
        </AppProvider>
        </Providers>
      </body>
    </html>
  );
}
