import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Class joiner for the admin kit. tailwind-merge has to be told about the
 * custom font-size, shadow and radius tokens in tailwind.config.ts, otherwise
 * it reads `text-body` as a colour and drops it next to `text-ink`.
 */
const merge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "page-title",
            "page-title-m",
            "dialog-title",
            "card-title",
            "card-title-m",
            "stat",
            "stat-m",
            "body",
            "body-m",
            "label",
            "overline",
            "public-h1",
            "public-h1-m",
          ],
        },
      ],
      shadow: [
        { shadow: ["card", "pop", "dialog", "toast", "bar", "focus", "input-focus", "pressed", "thumb"] },
      ],
      rounded: [{ rounded: ["card", "control", "thumb", "dialog", "sheet"] }],
    },
  },
});

export function cx(...inputs: ClassValue[]): string {
  return merge(clsx(inputs));
}
