import "./globals.css";
import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Sans,
  Syne,
} from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "RootLink — Find Your Community",
  description:
    "Connecting immigrants and newcomers in Canada through local events and community services.",
};

type RootLayoutProps = {
  children: ReactNode;
};

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-ui",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${syne.variable} ${dmSans.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
