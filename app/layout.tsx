import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdaptIQ",
  description: "Presentation Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Shim for window.history which can be restricted in Office taskpanes */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                if (!window.history) window.history = {};
                if (!window.history.replaceState) window.history.replaceState = function() {};
                if (!window.history.pushState) window.history.pushState = function() {};
              }
            `,
          }}
        />
        <Script
          src="https://appsforoffice.microsoft.com/lib/1/hosted/office.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
