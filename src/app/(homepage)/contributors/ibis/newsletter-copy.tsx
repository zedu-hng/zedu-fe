"use client";

import { useEffect } from "react";

export function IbisNewsletterCopy() {
  useEffect(() => {
    const label = document
      .querySelector<HTMLInputElement>('input[name="newsletter"]')
      ?.closest("form")
      ?.querySelector("label");

    if (!label) {
      throw new Error(
        "Could not find the newsletter label in the page footer."
      );
    }

    const originalText = label.textContent;
    label.textContent = "Sign up to our Newsletter Today";

    return () => {
      label.textContent = originalText;
    };
  }, []);

  return null;
}
