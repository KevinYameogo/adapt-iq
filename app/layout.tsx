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
        {/* Blocking shim for window.history which is restricted in some Office environments */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var noop = function() {};
                if (typeof window !== 'undefined') {
                  if (!window.history) window.history = {};
                  if (!window.history.replaceState) {
                    try {
                      Object.defineProperty(window.history, 'replaceState', { value: noop, writable: true, configurable: true });
                    } catch (e) { window.history.replaceState = noop; }
                  }
                  if (!window.history.pushState) {
                    try {
                      Object.defineProperty(window.history, 'pushState', { value: noop, writable: true, configurable: true });
                    } catch (e) { window.history.pushState = noop; }
                  }
                }
              })();
            `,
          }}
        />
        <script src="/shim.js" />
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
