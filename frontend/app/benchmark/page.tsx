"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getSampleDemo, runPipeline } from "@/lib/api";
import { getPipelineInput, getPipelineResult } from "@/lib/pipelineStore";
import { BarChart3, Play } from "lucide-react";
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

export default function BenchmarkPage() {
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

  async function runBenchmark() {
    setLoading(true);

    try {
      const data = await runPipeline(code, errorLog);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Benchmark failed. Make sure backend is running.");
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

  const benchmark = result?.benchmark_result;

  const chartData = benchmark
    ? [
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
      ]
    : [];

  return (
    <main className="min-h-screen">
      <Sidebar />

      <div className="ml-64">
        <Topbar />

        <section className="p-8">
          <p className="text-sm font-semibold text-amber-400">
            Performance Proof Engine
          </p>
          <h1 className="mt-2 text-5xl font-bold">Benchmark</h1>
          <p className="mt-3 max-w-3xl text-zinc-400">
            Compare before and after performance with latency, throughput,
            memory, GPU utilization, and readiness score.
          </p>

          <button
            onClick={runBenchmark}
            disabled={loading}
            className="mt-8 flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-semibold text-black disabled:opacity-50"
          >
            <Play className="h-5 w-5" />
            {loading ? "Benchmarking..." : "Run Benchmark"}
          </button>

          <div className="mt-8 grid grid-cols-12 gap-6">
            <div className="col-span-8 glass-card rounded-2xl p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <BarChart3 className="h-5 w-5 text-emerald-300" />
                Before vs After
              </h2>

              {benchmark ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid
                        stroke="rgba(255,255,255,0.06)"
                        vertical={false}
                      />
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
                        {chartData.map((_, i) => (
                          <Cell key={`before-${i}`} fill="#ef4444" />
                        ))}
                      </Bar>
                      <Bar dataKey="after" radius={[8, 8, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={`after-${i}`} fill="#34d399" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  Run benchmark to show chart.
                </p>
              )}
            </div>

            <div className="col-span-4 glass-card rounded-2xl p-6">
              <h2 className="mb-4 text-xl font-semibold">Improvements</h2>

              {benchmark ? (
                <div className="space-y-4">
                  <Stat
                    label="Latency Reduction"
                    value={`${benchmark.improvements.latency_reduction_percent}%`}
                  />
                  <Stat
                    label="Throughput Gain"
                    value={`${benchmark.improvements.tokens_per_second_gain_percent}%`}
                  />
                  <Stat
                    label="Memory Reduction"
                    value={`${benchmark.improvements.memory_reduction_percent}%`}
                  />
                  <Stat
                    label="Readiness Gain"
                    value={`+${benchmark.improvements.readiness_gain_points}`}
                  />
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  Improvements will appear here.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-emerald-300">{value}</p>
    </div>
  );
}




