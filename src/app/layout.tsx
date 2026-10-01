import type { Metadata, Viewport } from "next";
import { Great_Vibes, Poppins } from "next/font/google";
import "./globals.css";

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
  title: "Undangan Digital Feri & Ayu",
  description: "Undangan pernikahan Feriman & Ayu Natasya",
  openGraph: {
    title: "Undangan Digital Feri & Ayu",
    description: "Undangan pernikahan Feriman & Ayu Natasya",
    images: ["/images/bg-beach.jpg"],
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
      className={`${scriptFont.variable} ${serifFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
