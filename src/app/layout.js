import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Exon Dashboard",
  description: "Knowledge Base for Exon Team",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-white text-zinc-900 dark:bg-black dark:text-zinc-50 antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
