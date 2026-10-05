import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Poppins } from "next/font/google";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const scriptFont = Great_Vibes({
  variable: "--font-script",
  weight: "400",
  subsets: ["latin"],
});

const serifFont = Poppins({
  variable: "--font-serif",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://undangandigitalferiayu.vercel.app"),
  title: "Undangan Digital Feri & Ayu",
  description: "Undangan pernikahan Feriman & Ayu Natasya",
  openGraph: {
    title: "Undangan Digital Feri & Ayu",
    description: "Undangan pernikahan Feriman & Ayu Natasya",
    images: ["/icon.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${displayFont.variable} ${scriptFont.variable} ${serifFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
