import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeApplier } from "@/components/ThemeApplier";
import { DataProvider } from "@/components/DataProvider";
import { asset } from "@/lib/utils";

export const metadata: Metadata = {
  title: { default: "GradeFlow", template: "%s · GradeFlow" },
  description:
    "A cooler, fully customizable StudentVUE grade viewer — with a built-in student agenda book.",
  applicationName: "GradeFlow",
  manifest: asset("/manifest.webmanifest"),
  appleWebApp: { capable: true, title: "GradeFlow", statusBarStyle: "black-translucent" },
  icons: { icon: asset("/icon.svg"), apple: asset("/icon.svg") },
};

export const viewport: Viewport = {
  themeColor: "#08141f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Applies the saved theme before first paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{
var s=(JSON.parse(localStorage.getItem('gm-settings')||'{}').state)||{};
var d=document.documentElement;
var t=s.theme||'dark';
if(t==='system'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}
d.setAttribute('data-theme',t);
d.setAttribute('data-density',s.density||'cozy');
d.setAttribute('data-glass',s.glass===false?'off':'on');
d.setAttribute('data-animations',s.animations===false?'off':'on');
if(s.accent){d.style.setProperty('--accent',s.accent);d.style.setProperty('--accent-soft','color-mix(in srgb, '+s.accent+' 15%, transparent)');}
var rmap={sharp:'6px',soft:'18px',round:'28px'};if(s.radius){d.style.setProperty('--radius',rmap[s.radius]||'18px');}
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div className="app-backdrop" />
        <ThemeApplier />
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
