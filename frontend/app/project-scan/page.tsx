"use client";

/*
  This page is a client component because it uses React hooks:
  - useState
  - useEffect
  It also handles button clicks and textarea input changes.
*/
import { useEffect, useState } from "react";

/* Layout components used across the dashboard */
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

/*
  Backend API helper functions.

  getSampleDemo:
  - Loads sample code and sample error log from the backend.

  runPipeline:
  - Sends code and error log to the backend full pipeline.
  - The backend returns scan, doctor, optimizer, patch, benchmark, and report results.
*/
import { getSampleDemo, runPipeline } from "@/lib/api";

/* Icons used in this page */
import { Bot, Play, Search, ShieldAlert } from "lucide-react";

export default function ProjectScanPage() {
  /*
    code:
    Stores the source code shown in the textarea.
  */
  const [code, setCode] = useState("");

  /*
    errorLog:
    Stores the error log loaded from sample demo.
    It is also sent to the backend pipeline.
  */
  const [errorLog, setErrorLog] = useState("");

  /*
    result:
    Stores the complete backend pipeline response.
    Before running the scan, this value is null.
  */
  const [result, setResult] = useState<any>(null);

  /*
    loading:
    Controls loading state while the scan is running.
    It disables the button and changes button text.
  */
  const [loading, setLoading] = useState(false);

  /*
    Load sample project code and sample error log from backend.

    This helps the page start with demo data,
    so the user can test the scanner quickly.
  */
  async function loadSample() {
    const sample = await getSampleDemo();
    setCode(sample.code);
    setErrorLog(sample.error_log);
  }

  /*
    Run the project scan.

    This function sends the current code and error log
    to the backend pipeline and stores the returned result.
  */
  async function runScan() {
    setLoading(true);

    try {
      const data = await runPipeline(code, errorLog);
      setResult(data);
    } catch {
      alert("Project scan failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  /*
    Automatically load sample code once when this page opens.
  */
  useEffect(() => {
    loadSample();
  }, []);

  /*
    Extract only the scan_result part from the full pipeline result.

    Optional chaining is used because result is null before scan runs.
  */
  const scan = result?.scan_result;

  return (
    <main className="min-h-screen">
      {/* Fixed sidebar on the left */}
      <Sidebar />

      {/* Main content area starts after sidebar width */}
      <div className="ml-64">
        {/* Top navigation/status bar */}
        <Topbar />

        <section className="p-8">
          {/* Page heading section */}
          <p className="text-sm font-semibold text-amber-400">
            AI Codebase Scanner
          </p>

          <h1 className="mt-2 text-5xl font-bold">Project Scan</h1>

          <p className="mt-3 max-w-3xl text-zinc-400">
            AI assistance scans your workload, detects framework, precision,
            CUDA/ROCm risks, memory problems, and AMD readiness score.
          </p>

          {/* Main grid layout: code input on left, assistant/results on right */}
          <div className="mt-8 grid grid-cols-12 gap-6">
            
            {/* Left panel: source code input */}
            <div className="col-span-7 glass-card rounded-2xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <Search className="h-5 w-5 text-emerald-300" />
                  Source Code
                </h2>

                {/* Button to run AI project scan */}
                <button
                  onClick={runScan}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2 font-semibold text-black disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  {loading ? "Scanning..." : "Run AI Scan"}
                </button>
              </div>

              {/* Editable source code textarea */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="scrollbar-thin h-[520px] w-full resize-none rounded-xl border border-emerald-400/10 bg-black/45 p-4 font-mono text-xs leading-6 text-zinc-300 outline-none"
              />
            </div>

            {/* Right panel: AI assistant and detected issues */}
            <div className="col-span-5 space-y-6">
              
              {/* AI Scan Assistant card */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <Bot className="h-5 w-5 text-emerald-300" />
                  AI Scan Assistant
                </h2>

                {/* Show guidance before scan, show scan summary after scan */}
                {!scan ? (
                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    Run the scan to let Axion analyze your code. The assistant
                    will explain what is wrong, why it matters, and how it
                    affects AMD GPU readiness.
                  </p>
                ) : (
                  <div className="mt-5 space-y-4">
                    {/* Basic scan metadata */}
                    <AssistantLine label="Framework" value={scan.framework} />
                    <AssistantLine label="Workload" value={scan.workload_type} />
                    <AssistantLine label="Precision" value={scan.precision} />
                    <AssistantLine
                      label="Readiness"
                      value={`${scan.readiness_score}/100`}
                    />

                    {/* Human-readable AI summary */}
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-7 text-emerald-100">
                      Axion found {scan.issues_detected.length} important
                      readiness issues. Fixing precision, batch size, and
                      CUDA-specific usage can significantly improve AMD GPU
                      performance.
                    </div>
                  </div>
                )}
              </div>

              {/* Issues detected card */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <ShieldAlert className="h-5 w-5 text-amber-400" />
                  Issues Detected
                </h2>

                <div className="mt-5 space-y-3">
                  {/*
                    If scan exists, show all detected issues.
                    If scan does not exist yet, show "No scan result yet."
                  */}
                  {scan?.issues_detected?.map((issue: any, index: number) => (
                    <div
                      key={index}
                      className="rounded-xl border border-red-400/10 bg-red-400/5 p-4"
                    >
                      <div className="flex justify-between">
                        <p className="font-semibold">{issue.title}</p>

                        {/* Issue severity badge */}
                        <span className="text-xs text-red-300">
                          {issue.severity}
                        </span>
                      </div>

                      {/* Issue explanation */}
                      <p className="mt-2 text-sm text-zinc-400">
                        {issue.description}
                      </p>
                    </div>
                  )) ?? (
                    <p className="text-sm text-zinc-500">
                      No scan result yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/*
  AssistantLine component.

  Small reusable row for showing scan metadata such as:
  - Framework
  - Workload
  - Precision
  - Readiness score
*/
function AssistantLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-white/5 pb-3 text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className="font-semibold text-emerald-300">{value}</span>
    </div>
  );
}


