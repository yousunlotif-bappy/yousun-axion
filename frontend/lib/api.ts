import {
  savePipelineInput,
  savePipelineResult,
} from "@/lib/pipelineStore";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function getSampleDemo() {
  const res = await fetch(`${API_BASE}/sample-demo`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch sample demo");
  }

  return res.json();
}

export async function runPipeline(code: string, errorLog?: string) {
  const res = await fetch(`${API_BASE}/run-pipeline`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      error_log: errorLog || "",
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to run pipeline");
  }

  const data = await res.json();

  savePipelineInput({
    code,
    errorLog: errorLog || "",
  });

  savePipelineResult(data);

  return data;
}

export async function runDoctor(errorLog: string) {
  const res = await fetch(`${API_BASE}/doctor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      error_log: errorLog,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to run ROCm Doctor");
  }

  return res.json();
}

export async function getApiInfo() {
  const res = await fetch(`${API_BASE}/api-info`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch API info");
  }

  return res.json();
}



