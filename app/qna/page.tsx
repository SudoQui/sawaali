"use client";

import AskBox from "../../src/components/AskBox";
import QuestionList from "../../src/components/QuestionList";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSavedEmail } from "@/lib/session";

export default function QnaPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getSavedEmail()) router.replace("/");
  }, []);

  return (
    <main className="mx-auto max-w-md p-4 space-y-4">
      <header className="text-center space-y-1">
        <h1 className="text-xl font-semibold">Sawaali</h1>
        <p className="text-xs text-neutral-500">
          Ask anonymously
        </p>
      </header>

      <AskBox />
      <QuestionList />
    </main>
  );
}
