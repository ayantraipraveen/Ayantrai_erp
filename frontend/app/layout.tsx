import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/redux/StoreProvider";
import { ThemeProvider } from "./Component/ThemeProvider";
import AppShell from "./Component/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sitesafe by AyantrAI — Smart PPE Compliance ERP",
  description: "Enterprise Resource Planning & Smart PPE Compliance Monitoring for Industrial Sites",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

const themeInitScript = `
  (function() {
    try {
      var saved = localStorage.getItem('ayantrai_theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = saved || 'dark';
      var isDark = theme === 'dark' || (theme === 'system' && prefersDark);
      var root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;900&family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&family=Merriweather:ital,wght@0,400;0,700;0,900;1,400&family=Montserrat:wght@400;600;700;800;900&family=Outfit:wght@400;600;700;800;900&family=Oswald:wght@500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&family=Roboto:wght@400;500;700;900&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
        <StoreProvider>
          <ThemeProvider defaultTheme="dark">
            <AppShell>
              {children}
            </AppShell>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
