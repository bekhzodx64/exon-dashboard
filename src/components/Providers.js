"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";

function BrandColorManager({ children }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.brandColor) {
      document.documentElement.style.setProperty('--brand-color', session.user.brandColor);
    }
  }, [session]);

  return children;
}

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <BrandColorManager>
          {children}
        </BrandColorManager>
      </SessionProvider>
    </ThemeProvider>
  );
}
