import skills from "../../../content/skills.json";

export interface SkillProcess {
  name: string;
  level: number;
  process: string;
}

export function loadSkills(): SkillProcess[] {
  return Object.entries(skills as Record<string, { level: number; process: string }>).map(
    ([name, data]) => ({
      name,
      level: data.level,
      process: data.process,
    }),
  );
}

export function formatTopOutput(skills: SkillProcess[]): string[] {
  const header = "  PID USER      PR  NI    VIRT    RES  %CPU COMMAND";
  const rows = skills.map((s, i) => {
    const pid = (1000 + i).toString().padStart(5);
    const cpu = s.level.toString().padStart(4);
    return `${pid} guest     20   0  ${cpu}00m  ${cpu}00m  ${cpu}.0 ${s.process}`;
  });
  return [header, ...rows];
}
