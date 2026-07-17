import { STRESS_MULTIPLIERS } from "@/studio/test-sources";

export interface StressTestProps {
  multiplier: number;
  onChange: (multiplier: number) => void;
}

export function StressTest({ multiplier, onChange }: StressTestProps) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-widest text-[#5a8a5a]">
        Stress Test
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STRESS_MULTIPLIERS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={[
              "rounded border px-2 py-1 font-mono text-[10px] transition-colors",
              multiplier === m
                ? "border-[#7dff7d] bg-[#7dff7d]/15 text-[#c8ffc8]"
                : "border-[#2a4a2a] text-[#7dff7d] hover:border-[#3d6b3d]",
            ].join(" ")}
          >
            {m === 1 ? "1×" : `${m}×`}
          </button>
        ))}
      </div>
      <p className="text-[9px] leading-relaxed text-[#5a8a5a]">
        Multiplica a arte ASCII em grade para testar limites de performance.
      </p>
    </div>
  );
}
