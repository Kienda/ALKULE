"use client";

import TypingGame from "@/components/TypingGame";
import { useLocale } from "@/lib/LocaleProvider";

export default function TypingPage() {
  const { t } = useLocale();
  return (
    <div className="py-6">
      <h1 className="text-center font-display text-2xl font-bold text-ink">
        {t.typing.heading}
      </h1>
      <TypingGame />
    </div>
  );
}
