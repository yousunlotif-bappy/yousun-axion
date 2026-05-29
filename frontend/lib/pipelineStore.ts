const PIPELINE_RESULT_KEY = "yousun_axion_pipeline_result";
const PIPELINE_INPUT_KEY = "yousun_axion_pipeline_input";

export type PipelineInput = {
  code: string;
  errorLog: string;
};

export function savePipelineInput(input: PipelineInput) {
  if (typeof window === "undefined") return;

  localStorage.setItem(PIPELINE_INPUT_KEY, JSON.stringify(input));
}

export function getPipelineInput(): PipelineInput | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(PIPELINE_INPUT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePipelineResult(result: any) {
  if (typeof window === "undefined") return;

  localStorage.setItem(PIPELINE_RESULT_KEY, JSON.stringify(result));
}

export function getPipelineResult() {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(PIPELINE_RESULT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPipelineState() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(PIPELINE_INPUT_KEY);
  localStorage.removeItem(PIPELINE_RESULT_KEY);
}


