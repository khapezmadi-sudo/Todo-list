import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={[
        "light",
        "dark",
        "system",
        "ocean",
        "sakura",
        "coffee",
        "lavender",
        "sunset",
        "nord",
        "retro",
        "cyberpunk",
        "forest",
        "monokai",
      ]}
    >
      {children}
    </NextThemesProvider>
  );
}
