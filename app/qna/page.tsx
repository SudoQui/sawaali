"use client";

import AskBox from "../../src/components/AskBox";
import QuestionList from "../../src/components/QuestionList";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSavedEmail } from "@/lib/session";
import Image from "next/image";

// fonts for the header
import { Style_Script, Alatsi } from "next/font/google";
const styleScript = Style_Script({ subsets: ["latin"], weight: "400" });
const alatsi = Alatsi({ subsets: ["latin"], weight: "400" });

export default function QnaPage() {
  const router = useRouter();
  useEffect(() => {
    if (!getSavedEmail()) router.replace("/");
  }, [router]);

  return (
    <main className="mx-auto w-full max-w-3xl p-4 md:p-6 space-y-4">
      {/* HERO HEADER (matches your screenshot) */}
      <div
        className="
          p-4 sm:p-6
        "
      >
        {/* logos row */}
        <div className="flex justify-center">
          <Image
            src="/img/MSAvsUCF.png"
            alt="MSA & FOCUS"
            width={1200}
            height={300}
            priority
            sizes="(max-width:768px) 92vw, 900px"
            className="w-full max-h-[180px] sm:max-h-[220px] object-contain"
          />
        </div>

        {/* Sawaali word + powered by */}
        <div className="text-center mt-1 sm:mt-2">
          <div
            className={[
              styleScript.className,
              "text-[#0e2a3d]",
              "leading-none tracking-wide",
              "drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]",
              "text-[clamp(30px,10vw,68px)]",
            ].join(" ")}
          >
            Sawaali
          </div>
          <div className="text-[11px] sm:text-xs text-slate-800/90 -mt-1">
            powered by SudoTech
          </div>
        </div>
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
          <h2 className={`${alatsi.className} text-sm font-medium text-neutral-50/90`}>
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
          <h3 className={`${alatsi.className} text-sm font-medium text-neutral-50/90`}>
            Questions
          </h3>
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
