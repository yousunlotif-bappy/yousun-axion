"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getSampleDemo, runPipeline } from "@/lib/api";
import { getPipelineInput, getPipelineResult } from "@/lib/pipelineStore";
import { Download, FileText, Play } from "lucide-react";
import jsPDF from "jspdf";

export default function ReportsPage() {
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

  async function generateReport() {
    setLoading(true);

    try {
      const data = await runPipeline(code, errorLog);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Report generation failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  function downloadPdf() {
    if (!result) return;

    const report = result.report_result;
    const benchmark = result.benchmark_result;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("YOUSUN Axion", 20, 20);

    doc.setFontSize(14);
    doc.text("AMD Readiness Report", 20, 32);

    doc.setFontSize(10);
    doc.text(`Project: ${report.project_summary.project_name}`, 20, 45);
    doc.text(`Framework: ${report.project_summary.framework}`, 20, 53);
    doc.text(`Workload: ${report.project_summary.workload_type}`, 20, 61);
    doc.text(`Target GPU: ${report.project_summary.target_gpu}`, 20, 69);
    doc.text(`Environment: ${report.project_summary.environment}`, 20, 77);

    doc.setFontSize(13);
    doc.text("Executive Summary", 20, 92);

    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(
      report.executive_summary.summary,
      170
    );
    doc.text(summaryLines, 20, 102);

    doc.setFontSize(13);
    doc.text("Benchmark Results", 20, 138);

    doc.setFontSize(10);
    doc.text(
      `Readiness: ${benchmark.before.readiness_score}/100 -> ${benchmark.after.readiness_score}/100`,
      20,
      148
    );
    doc.text(
      `Latency: ${benchmark.before.latency_seconds}s -> ${benchmark.after.latency_seconds}s`,
      20,
      156
    );
    doc.text(
      `Tokens/sec: ${benchmark.before.tokens_per_second} -> ${benchmark.after.tokens_per_second}`,
      20,
      164
    );
    doc.text(
      `Memory: ${benchmark.before.gpu_memory_gb}GB -> ${benchmark.after.gpu_memory_gb}GB`,
      20,
      172
    );

    doc.setFontSize(13);
    doc.text("Final Verdict", 20, 190);

    doc.setFontSize(10);
    doc.text(`Score: ${report.final_verdict.score}/100`, 20, 200);
    doc.text(`Status: ${report.final_verdict.status}`, 20, 208);

    const recommendationLines = doc.splitTextToSize(
      report.final_verdict.recommendation,
      170
    );
    doc.text(recommendationLines, 20, 218);

    doc.save("YOUSUN-Axion-AMD-Readiness-Report.pdf");
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

  const report = result?.report_result;
  const benchmark = result?.benchmark_result;

  return (
    <main className="min-h-screen">
      <Sidebar />

      <div className="ml-64">
        <Topbar />

        <section className="p-8">
          <p className="text-sm font-semibold text-amber-400">
            Exportable AMD Readiness Report
          </p>
          <h1 className="mt-2 text-5xl font-bold">Reports</h1>
          <p className="mt-3 max-w-3xl text-zinc-400">
            Generate professional AMD readiness reports with benchmark results,
            optimization summary, business impact, and final verdict.
          </p>

          <div className="mt-8 flex gap-4">
            <button
              onClick={generateReport}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-semibold text-black disabled:opacity-50"
            >
              <Play className="h-5 w-5" />
              {loading ? "Generating..." : "Generate Report"}
            </button>

            <button
              onClick={downloadPdf}
              disabled={!result}
              className="flex items-center gap-2 rounded-xl border border-emerald-400/20 px-6 py-3 font-semibold text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-5 w-5" />
              Download PDF
            </button>
          </div>

          <div className="mt-8 grid grid-cols-12 gap-6">
            <div className="col-span-8 glass-card rounded-2xl p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <FileText className="h-5 w-5 text-emerald-300" />
                Report Preview
              </h2>

              {report ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-zinc-500">Report Title</p>
                    <p className="text-3xl font-bold">{report.report_title}</p>
                  </div>

                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm leading-7 text-emerald-100">
                    {report.executive_summary.summary}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <SmallStat
                      label="Initial Score"
                      value={`${report.project_summary.initial_readiness_score}/100`}
                    />
                    <SmallStat
                      label="Final Score"
                      value={`${report.project_summary.final_readiness_score}/100`}
                    />
                    <SmallStat
                      label="Status"
                      value={report.project_summary.final_status}
                    />
                  </div>

                  <div>
                    <h3 className="mb-3 font-semibold">Recommendation</h3>
                    <p className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-300">
                      {report.final_verdict.recommendation}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  Click Generate Report to create report preview.
                </p>
              )}
            </div>

            <div className="col-span-4 glass-card rounded-2xl p-6">
              <h2 className="mb-4 text-xl font-semibold">Benchmark Summary</h2>

              {benchmark ? (
                <div className="space-y-4">
                  <SmallStat
                    label="Latency"
                    value={`${benchmark.before.latency_seconds}s → ${benchmark.after.latency_seconds}s`}
                  />
                  <SmallStat
                    label="Tokens/sec"
                    value={`${benchmark.before.tokens_per_second} → ${benchmark.after.tokens_per_second}`}
                  />
                  <SmallStat
                    label="Memory"
                    value={`${benchmark.before.gpu_memory_gb}GB → ${benchmark.after.gpu_memory_gb}GB`}
                  />
                  <SmallStat label="Best Profile" value={benchmark.best_profile} />
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  Benchmark summary will appear here.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-emerald-300">{value}</p>
    </div>
  );
}



