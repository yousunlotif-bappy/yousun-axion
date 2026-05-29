"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getSampleDemo, runPipeline } from "@/lib/api";
import { getPipelineInput, getPipelineResult } from "@/lib/pipelineStore";
import {
  BarChart3,
  CheckCircle2,
  Cpu,
  FileText,
  FlaskConical,
  Gauge,
  MemoryStick,
  Play,
  ShieldAlert,
  Sparkles,
  Timer,
  TrendingUp,
  UploadCloud,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Home() {
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

  async function handleRunPipeline() {
    setLoading(true);

    try {
      const data = await runPipeline(code, errorLog);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Pipeline failed. Make sure your FastAPI backend is running.");
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

  const summary = result?.pipeline_summary;
  const scanIssues = result?.scan_result?.issues_detected ?? [];
  const optimizationPlan = result?.optimization_result?.plan ?? [];
  const patchChanges = result?.patch_result?.applied_changes ?? [];
  const benchmark = result?.benchmark_result;

  return (
    <main className="min-h-screen">
      <Sidebar />

      <div className="ml-64">
        <Topbar />

        <section className="p-8">
          <HeroSection />
          <WorkflowSteps />

          <div className="mt-8 grid grid-cols-12 gap-6">
            <div className="col-span-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <CodeInputCard code={code} setCode={setCode} />
                <ErrorLogCard errorLog={errorLog} setErrorLog={setErrorLog} />
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleRunPipeline}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-semibold text-black gold-glow transition hover:bg-amber-300 disabled:opacity-50"
                >
                  <Play className="h-5 w-5" />
                  {loading ? "Running Axion Pipeline..." : "Run Full Axion Pipeline"}
                </button>

                <button
                  onClick={loadSample}
                  className="flex items-center gap-2 rounded-xl border border-emerald-400/20 px-6 py-3 text-emerald-300 transition hover:bg-emerald-400/10"
                >
                  <UploadCloud className="h-5 w-5" />
                  Load Sample Workload
                </button>
              </div>
            </div>

            <div className="col-span-4 space-y-6">
              <ReadinessCard summary={summary} />
              <OutcomesCard summary={summary} />
            </div>
          </div>

          {result && (
            <>
              <div className="mt-8 grid grid-cols-4 gap-6">
                <MetricPanel
                  icon={<ShieldAlert />}
                  title="Issues Detected"
                  value={scanIssues.length}
                  subtitle="ROCm/CUDA risks found"
                />
                <MetricPanel
                  icon={<Sparkles />}
                  title="Optimization Steps"
                  value={optimizationPlan.length}
                  subtitle="AI-generated plan"
                />
                <MetricPanel
                  icon={<Cpu />}
                  title="Patch Changes"
                  value={result.patch_result.summary.changes_count}
                  subtitle="Code fixes generated"
                />
                <MetricPanel
                  icon={<FileText />}
                  title="Report Status"
                  value="Ready"
                  subtitle="AMD Readiness Report"
                />
              </div>

              <div className="mt-8">
                <BenchmarkChartPanel benchmark={benchmark} />
              </div>

              <div className="mt-8 grid grid-cols-12 gap-6">
                <IssuesPanel issues={scanIssues} />
                <OptimizationPanel plan={optimizationPlan} />
                <PatchSummaryPanel changes={patchChanges} />
              </div>

              <div className="mt-8 grid grid-cols-12 gap-6">
                <PatchDiffPanel diff={result.patch_result.diff} />
                <BenchmarkPanel benchmark={benchmark} />
              </div>

              <div className="mt-8 grid grid-cols-12 gap-6">
                <ReportSummaryPanel result={result} />
                <KernelLabPreview />
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function HeroSection() {
  return (
    <div className="mb-8 grid grid-cols-12 gap-6">
      <div className="col-span-8">
        <p className="text-sm font-semibold text-amber-400">
          Autonomous GPU Intelligence
        </p>
        <h2 className="mt-2 text-5xl font-bold tracking-tight">
          Build AMD-ready AI workloads.
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-400">
          Upload code or an error log. YOUSUN Axion scans, diagnoses, optimizes,
          patches, benchmarks, and generates an AMD Readiness Report.
        </p>
      </div>

      <div className="col-span-4 glass-card rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <Cpu className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Target System</p>
            <p className="mt-1 text-xl font-bold">AMD MI300X · ROCm 6.1.2</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <SmallHeroStat label="GPU" value="8x" />
          <SmallHeroStat label="Mode" value="BF16" />
          <SmallHeroStat label="Cloud" value="Ready" />
        </div>
      </div>
    </div>
  );
}

function SmallHeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="font-semibold text-emerald-300">{value}</p>
    </div>
  );
}

function WorkflowSteps() {
  const steps = [
    ["1", "Upload", "Code / Repo / Log"],
    ["2", "Project Scan", "Detect ROCm risks"],
    ["3", "ROCm Doctor", "Root cause analysis"],
    ["4", "Optimizer", "Generate fixes"],
    ["5", "Patch", "Create code changes"],
    ["6", "Benchmark", "Measure gains"],
    ["7", "Report", "Export readiness"],
  ];

  return (
    <div className="grid grid-cols-7 gap-3">
      {steps.map((step) => (
        <div key={step[0]} className="glass-card rounded-2xl p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
            {step[0]}
          </div>
          <p className="text-sm font-semibold">{step[1]}</p>
          <p className="mt-1 text-xs text-zinc-500">{step[2]}</p>
        </div>
      ))}
    </div>
  );
}

function CodeInputCard({
  code,
  setCode,
}: {
  code: string;
  setCode: (value: string) => void;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Input Code</h3>
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
          sample workload
        </span>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="scrollbar-thin h-80 w-full resize-none rounded-xl border border-emerald-400/10 bg-black/45 p-4 font-mono text-xs leading-6 text-zinc-300 outline-none transition focus:border-emerald-400/40"
        spellCheck={false}
      />
    </div>
  );
}

function ErrorLogCard({
  errorLog,
  setErrorLog,
}: {
  errorLog: string;
  setErrorLog: (value: string) => void;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Error Log</h3>
        <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
          ROCm Doctor
        </span>
      </div>

      <textarea
        value={errorLog}
        onChange={(e) => setErrorLog(e.target.value)}
        className="scrollbar-thin h-80 w-full resize-none rounded-xl border border-amber-400/10 bg-black/45 p-4 font-mono text-xs leading-6 text-zinc-300 outline-none transition focus:border-amber-400/40"
        spellCheck={false}
      />
    </div>
  );
}

function ReadinessCard({ summary }: { summary: any }) {
  const score = summary?.final_readiness_score ?? 0;

  return (
    <div className="glass-card rounded-2xl p-6">
      <p className="text-sm text-zinc-400">AMD Readiness Score</p>

      <div className="mt-4 flex items-end gap-3">
        <span className="text-7xl font-bold text-emerald-300">
          {summary?.final_readiness_score ?? "--"}
        </span>
        <span className="mb-3 text-zinc-500">/100</span>
      </div>

      <p className="mt-3 text-xl text-emerald-300">
        {summary?.status ?? "Run pipeline to calculate"}
      </p>

      <div className="mt-6 h-3 rounded-full bg-white/10">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function OutcomesCard({ summary }: { summary: any }) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="mb-4 font-semibold">Workflow Outcomes</h3>

      <div className="space-y-4 text-sm">
        <Outcome
          icon={<Timer className="h-4 w-4" />}
          label="Latency"
          value={
            summary ? `${summary.latency_before}s → ${summary.latency_after}s` : "--"
          }
        />
        <Outcome
          icon={<TrendingUp className="h-4 w-4" />}
          label="Tokens/sec"
          value={
            summary
              ? `${summary.tokens_per_second_before} → ${summary.tokens_per_second_after}`
              : "--"
          }
        />
        <Outcome
          icon={<MemoryStick className="h-4 w-4" />}
          label="Memory"
          value={
            summary ? `${summary.memory_before}GB → ${summary.memory_after}GB` : "--"
          }
        />
        <Outcome
          icon={<Gauge className="h-4 w-4" />}
          label="Readiness"
          value={
            summary
              ? `${summary.initial_readiness_score} → ${summary.final_readiness_score}`
              : "--"
          }
        />
      </div>
    </div>
  );
}

function Outcome({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3">
      <div className="flex items-center gap-2 text-zinc-400">
        <span className="text-emerald-300">{icon}</span>
        <span>{label}</span>
      </div>
      <span className="font-semibold text-emerald-300">{value}</span>
    </div>
  );
}

function MetricPanel({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
        {icon}
      </div>
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-zinc-500">{subtitle}</p>
    </div>
  );
}

function BenchmarkChartPanel({ benchmark }: { benchmark: any }) {
  const data = useMemo(() => {
    if (!benchmark) return [];

    return [
      {
        metric: "Latency",
        before: benchmark.before.latency_seconds,
        after: benchmark.after.latency_seconds,
      },
      {
        metric: "Tokens/sec",
        before: benchmark.before.tokens_per_second,
        after: benchmark.after.tokens_per_second,
      },
      {
        metric: "Memory",
        before: benchmark.before.gpu_memory_gb,
        after: benchmark.after.gpu_memory_gb,
      },
      {
        metric: "Readiness",
        before: benchmark.before.readiness_score,
        after: benchmark.after.readiness_score,
      },
    ];
  }, [benchmark]);

  if (!benchmark) return null;

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-semibold">
            <BarChart3 className="h-5 w-5 text-emerald-300" />
            Before vs After Benchmark
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Visual proof that Axion improved the workload after optimization.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
          Best Profile: BF16 + Batch 4 + Inference Mode
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 h-80 rounded-2xl border border-white/5 bg-black/20 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={6}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="metric"
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#06120f",
                  border: "1px solid rgba(52,211,153,0.2)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="before" radius={[8, 8, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={`before-${index}`} fill="#ef4444" />
                ))}
              </Bar>
              <Bar dataKey="after" radius={[8, 8, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={`after-${index}`} fill="#34d399" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-4 space-y-3">
          <ChartInsight
            label="Latency Reduction"
            value={`${benchmark.improvements.latency_reduction_percent}%`}
            note="Lower response time"
          />
          <ChartInsight
            label="Throughput Gain"
            value={`${benchmark.improvements.tokens_per_second_gain_percent}%`}
            note="More tokens per second"
          />
          <ChartInsight
            label="Memory Reduction"
            value={`${benchmark.improvements.memory_reduction_percent}%`}
            note="Lower GPU memory usage"
          />
          <ChartInsight
            label="Readiness Gain"
            value={`+${benchmark.improvements.readiness_gain_points}`}
            note="AMD readiness points"
          />
        </div>
      </div>
    </div>
  );
}

function ChartInsight({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-emerald-300">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{note}</p>
    </div>
  );
}

function IssuesPanel({ issues }: { issues: any[] }) {
  return (
    <div className="col-span-4 glass-card rounded-2xl p-6">
      <h3 className="mb-4 flex items-center gap-2 font-semibold">
        <ShieldAlert className="h-5 w-5 text-amber-400" />
        Issues Detected
      </h3>

      <div className="space-y-3">
        {issues.map((issue, index) => (
          <div
            key={index}
            className="rounded-xl border border-red-400/10 bg-red-400/5 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{issue.title}</p>
              <span className="rounded-full bg-red-400/10 px-2 py-1 text-xs text-red-300">
                {issue.severity}
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">{issue.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OptimizationPanel({ plan }: { plan: any[] }) {
  return (
    <div className="col-span-4 glass-card rounded-2xl p-6">
      <h3 className="mb-4 flex items-center gap-2 font-semibold">
        <Zap className="h-5 w-5 text-emerald-300" />
        Optimization Plan
      </h3>

      <div className="space-y-3">
        {plan.slice(0, 5).map((step) => (
          <div
            key={step.step}
            className="rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/10 text-sm text-emerald-300">
                {step.step}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {step.impact} impact · {step.effort} effort
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatchSummaryPanel({ changes }: { changes: any[] }) {
  return (
    <div className="col-span-4 glass-card rounded-2xl p-6">
      <h3 className="mb-4 flex items-center gap-2 font-semibold">
        <CheckCircle2 className="h-5 w-5 text-emerald-300" />
        Patch Summary
      </h3>

      <div className="space-y-3">
        {changes.slice(0, 5).map((change, index) => (
          <div
            key={index}
            className="rounded-xl border border-emerald-400/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{change.title}</p>
              <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">
                {change.impact}
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">{change.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatchDiffPanel({ diff }: { diff: string }) {
  return (
    <div className="col-span-7 glass-card rounded-2xl p-6">
      <h3 className="mb-4 font-semibold">Generated Patch Diff</h3>
      <pre className="scrollbar-thin max-h-96 overflow-auto rounded-xl border border-emerald-400/10 bg-black/50 p-4 text-xs leading-6 text-emerald-100">
        {diff}
      </pre>
    </div>
  );
}

function BenchmarkPanel({ benchmark }: { benchmark: any }) {
  if (!benchmark) return null;

  return (
    <div className="col-span-5 glass-card rounded-2xl p-6">
      <h3 className="mb-4 flex items-center gap-2 font-semibold">
        <BarChart3 className="h-5 w-5 text-emerald-300" />
        Benchmark Table
      </h3>

      <div className="space-y-4">
        <BenchmarkRow
          label="Latency"
          before={`${benchmark.before.latency_seconds}s`}
          after={`${benchmark.after.latency_seconds}s`}
          improvement={`${benchmark.improvements.latency_reduction_percent}% faster`}
        />
        <BenchmarkRow
          label="Tokens/sec"
          before={benchmark.before.tokens_per_second}
          after={benchmark.after.tokens_per_second}
          improvement={`${benchmark.improvements.tokens_per_second_gain_percent}% higher`}
        />
        <BenchmarkRow
          label="GPU Memory"
          before={`${benchmark.before.gpu_memory_gb}GB`}
          after={`${benchmark.after.gpu_memory_gb}GB`}
          improvement={`${benchmark.improvements.memory_reduction_percent}% lower`}
        />
        <BenchmarkRow
          label="Readiness"
          before={`${benchmark.before.readiness_score}/100`}
          after={`${benchmark.after.readiness_score}/100`}
          improvement={`+${benchmark.improvements.readiness_gain_points} points`}
        />
      </div>
    </div>
  );
}

function BenchmarkRow({
  label,
  before,
  after,
  improvement,
}: {
  label: string;
  before: string | number;
  after: string | number;
  improvement: string;
}) {
  return (
    <div className="grid grid-cols-4 items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm">
      <p className="text-zinc-300">{label}</p>
      <p className="text-red-300">{before}</p>
      <p className="text-emerald-300">{after}</p>
      <p className="text-right text-amber-300">{improvement}</p>
    </div>
  );
}

function ReportSummaryPanel({ result }: { result: any }) {
  return (
    <div className="col-span-8 glass-card rounded-2xl p-6">
      <h3 className="mb-4 font-semibold">Executive Report Summary</h3>

      <p className="text-sm leading-7 text-zinc-300">
        {result.report_result.executive_summary.summary}
      </p>

      <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">
        {result.report_result.executive_summary.recommendation}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <SmallReportStat
          label="Final Status"
          value={result.report_result.final_verdict.status}
        />
        <SmallReportStat
          label="Final Score"
          value={`${result.report_result.final_verdict.score}/100`}
        />
        <SmallReportStat label="Report" value="Ready" />
      </div>
    </div>
  );
}

function SmallReportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-emerald-300">{value}</p>
    </div>
  );
}

function KernelLabPreview() {
  return (
    <div className="col-span-4 glass-card rounded-2xl p-6">
      <h3 className="mb-4 flex items-center gap-2 font-semibold">
        <FlaskConical className="h-5 w-5 text-amber-400" />
        Kernel Lab Preview
      </h3>

      <p className="text-5xl font-bold text-emerald-300">1.82x</p>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Estimated kernel-level speedup opportunity through attention and memory
        transfer optimization.
      </p>

      <button className="mt-6 w-full rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/15">
        Open Kernel Lab
      </button>
    </div>
  );
}



