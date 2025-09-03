"use client";

import AskBox from "../../src/components/AskBox";
import QuestionList from "../../src/components/QuestionList";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSavedEmail } from "@/lib/session";
import Image from "next/image";

export default function QnaPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getSavedEmail()) router.replace("/");
  }, [router]);

  return (
    <main className="mx-auto w-full max-w-3xl p-4 md:p-6 space-y-4">
      {/* Banner */}
      <div className="w-full">
        <div className="flex justify-center">
          <Image
            src="/img/MSAvsUCF.png"
            alt="Sawaali Banner"
            width={1200}
            height={400}
            className="w-full max-h-[400px] rounded-2xl  object-contain"
            priority
          />
        </div>

        {/* Header */}
        <header className="text-center mt-2">
          <h1 className="text-4xl font-bold tracking-wide text-white">
            Sawaali
          </h1>
          <p className="text-base text-neutral-300 italic">Ask anonymously</p>
        </header>
      </div>

      {/* Ask box card */}
      <section
        className="
          rounded-2xl
          bg-black/20
          backdrop-blur-sm
          p-4 md:p-6
          shadow-[0_8px_24px_rgba(0,0,0,0.18)]
          ring-1 ring-white/10
        "
      >
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-neutral-50/90">
            Ask Anonymously
          </h2>
          <AskBox />
        </div>
      </section>

      {/* Questions list card */}
      <section
        className="
          rounded-2xl
          bg-black/30
          p-3 md:p-5
          shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_28px_rgba(0,0,0,0.22)]
          ring-1 ring-white/10
          space-y-3
        "
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-neutral-50/90">Questions</h3>
          <div className="h-px flex-1 mx-3 bg-white/10" />
        </div>

        <div className="rounded-xl overflow-hidden">
          <QuestionList />
        </div>
      </section>

      <div className="h-2" />
    </main>
  );
}