"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getSampleDemo, runPipeline } from "@/lib/api";
import { getPipelineInput, getPipelineResult } from "@/lib/pipelineStore";
import { CheckCircle2, Code2, Play } from "lucide-react";

export default function PatchGeneratorPage() {
  const [code, setCode] = useState("");
  const [errorLog, setErrorLog] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function loadSample() {
    try {
      const sample = await getSampleDemo();
      setCode(sample.code);
      setErrorLog(sample.error_log);
    } catch (error) {
      console.error(error);
    }
  }

  async function generatePatch() {
    setLoading(true);

    try {
      const data = await runPipeline(code, errorLog);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Patch generation failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const savedInput = getPipelineInput();
    const savedResult = getPipelineResult();

    if (savedInput) {
      setCode(savedInput.code);
      setErrorLog(savedInput.errorLog);
    } else {
      loadSample();
    }

    if (savedResult) {
      setResult(savedResult);
    }
  }, []);

  const changes = result?.patch_result?.applied_changes ?? [];

  return (
    <main className="min-h-screen">
      <Sidebar />

      <div className="ml-64">
        <Topbar />

        <section className="p-8">
          <p className="text-sm font-semibold text-amber-400">
            AI Code Fix Engine
          </p>
          <h1 className="mt-2 text-5xl font-bold">Patch Generator</h1>
          <p className="mt-3 max-w-3xl text-zinc-400">
            Generate AMD-ready code patches: BF16 conversion, batch tuning,
            device abstraction, inference mode, and model evaluation mode.
          </p>

          <div className="mt-8 flex gap-4">
            <button
              onClick={generatePatch}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-semibold text-black disabled:opacity-50"
            >
              <Play className="h-5 w-5" />
              {loading ? "Generating..." : "Generate Patch"}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-12 gap-6">
            <div className="col-span-6 glass-card rounded-2xl p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Code2 className="h-5 w-5 text-emerald-300" />
                Original Code
              </h2>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="scrollbar-thin h-[520px] w-full resize-none rounded-xl border border-emerald-400/10 bg-black/45 p-4 font-mono text-xs leading-6 text-zinc-300 outline-none"
                spellCheck={false}
              />
            </div>

            <div className="col-span-6 glass-card rounded-2xl p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                Generated Patch Diff
              </h2>

              {result ? (
                <pre className="scrollbar-thin h-[520px] overflow-auto rounded-xl border border-emerald-400/10 bg-black/50 p-4 text-xs leading-6 text-emerald-100">
                  {result.patch_result.diff}
                </pre>
              ) : (
                <p className="text-sm text-zinc-500">
                  Generated patch will appear here.
                </p>
              )}
            </div>
          </div>

          {changes.length > 0 && (
            <div className="mt-8 grid grid-cols-5 gap-4">
              {changes.map((change: any, index: number) => (
                <div key={index} className="glass-card rounded-2xl p-5">
                  <p className="font-semibold text-emerald-300">
                    {change.title}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-zinc-400">
                    {change.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}





