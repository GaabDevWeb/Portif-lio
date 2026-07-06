import processData from "../../../content/process.json";
import type { ProcessStep } from "@/types/root-os";

export function loadProcessSteps(): ProcessStep[] {
  return (processData as { steps: ProcessStep[] }).steps;
}
