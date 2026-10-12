import React from "react";

export function AuthHeroBanner({
  title,
  subtitle,
}: {
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <section
      aria-label="Product preview"
      className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#2D1664] via-[#241155] to-[#150738] p-6 lg:p-8 xl:p-12 h-full max-h-screen text-white select-none"
    >
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-[#8B5CF6]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-72 h-72 rounded-full bg-[#635BFF]/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md">
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-white leading-[1.15]">
          {title}
        </h1>
        <p className="mt-1.5 xl:mt-2 text-purple-200/80 text-xs lg:text-sm leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="relative z-10 my-auto py-2 w-full max-w-sm xl:max-w-md">
        <div className="relative rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md p-3.5 lg:p-4 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-1.5 mb-3 border-b border-white/10 pb-2">
            <div className="w-2 h-2 rounded-full bg-red-400/80" />
            <div className="w-2 h-2 rounded-full bg-yellow-400/80" />
            <div className="w-2 h-2 rounded-full bg-green-400/80" />
            <div className="ml-2.5 h-1.5 w-20 rounded-full bg-white/20" />
          </div>
          <div className="space-y-2.5">
            {[
              ["bg-purple-500/30", "w-3/4"],
              ["bg-teal-500/30", "w-4/5"],
              ["bg-rose-500/30", "w-2/3"],
              ["bg-blue-500/30", "w-5/6"],
            ].map(([c, w], i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-md ${c} flex items-center justify-center shrink-0`}
                />
                <div className="space-y-1 flex-1">
                  <div className={`h-1.5 ${w} rounded-full bg-white/20`} />
                  <div className="h-1 w-1/2 rounded-full bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="-mt-14 relative z-20 space-y-2 pl-3 sm:pl-4">
          {[
            {
              a: "A",
              n: "Amara",
              ch: "#team-flamingo",
              m: "Good morning everyone",
              bg: "bg-[#7C3AED]",
            },
            {
              a: "T",
              n: "Tolu",
              ch: "#general",
              m: "Anyone active?",
              bg: "bg-[#F43F5E]",
            },
          ].map((c, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-xl shadow-purple-950/20 border border-black/[0.04] p-2.5 flex items-center gap-2.5 max-w-[300px]"
            >
              <div
                className={`w-7 h-7 rounded-lg ${c.bg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}
              >
                {c.a}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-gray-400 font-normal leading-tight">
                  <span className="font-semibold text-gray-900 text-xs mr-1">
                    {c.n}
                  </span>
                  in {c.ch}
                </div>
                <p className="text-gray-600 text-xs font-normal mt-0.5 truncate">
                  {c.m}
                </p>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-xl shadow-xl shadow-purple-950/20 border border-black/[0.04] px-3 py-1.5 flex items-center gap-2 w-fit">
            <div className="w-6 h-6 rounded-md bg-[#10B981] text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm">
              D
            </div>
            <div className="flex items-center gap-1 px-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
