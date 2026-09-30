import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SchoolConnect CRM",
  description: "Multi-school SaaS School CRM",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}