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
        {/* Shim for window.history — Office taskpane can restrict these; inline so it runs before Next.js */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if (typeof window === 'undefined') return;
                var h = window.history;
                if (!h) window.history = h = {};
                if (typeof h.replaceState !== 'function') h.replaceState = function() {};
                if (typeof h.pushState !== 'function') h.pushState = function() {};
                if (typeof h.go !== 'function') h.go = function() {};
                if (typeof h.back !== 'function') h.back = function() {};
                if (typeof h.forward !== 'function') h.forward = function() {};
              })();
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
