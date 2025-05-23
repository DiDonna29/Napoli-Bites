"use client";

import * as React from "react";
import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// In a real app, you'd use a library like next-intl and get the current locale
// For now, this is a visual placeholder.
export function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = React.useState("En");

  const selectLanguage = (lang: string, displayLang: string) => {
    // Here you would change the language, e.g., by redirecting to /es/pathname or using a context
    console.log(`Language selected: ${lang}`);
    setCurrentLanguage(displayLang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Select language">
          <Languages className="h-5 w-5" />
          <span className="sr-only">{currentLanguage}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => selectLanguage("en", "En")}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => selectLanguage("es", "Es")}>
          Español
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => selectLanguage("it", "It")}>
          Italiano
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
