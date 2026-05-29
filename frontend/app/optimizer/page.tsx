"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getSampleDemo, runPipeline } from "@/lib/api";
import { getPipelineInput, getPipelineResult } from "@/lib/pipelineStore";
import { Bot, Play, Send, Sparkles, Zap } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function OptimizerPage() {
  const [code, setCode] = useState("");
  const [errorLog, setErrorLog] = useState("");
  const [result, setResult] = useState<any>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "I can explain the optimization plan, prioritize fixes, and guide you toward AMD-ready performance.",
    },
  ]);
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

  async function runOptimizer() {
    setLoading(true);

    try {
      const data = await runPipeline(code, errorLog);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Optimizer failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  function askOptimizer() {
    if (!question.trim()) return;

    const userQuestion = question.trim();

    setMessages((prev) => [...prev, { role: "user", content: userQuestion }]);

    const plan = result?.optimization_result?.plan ?? [];
    const topFix = plan[0]?.title ?? "Run optimizer first to generate a plan.";
    const secondFix = plan[1]?.title ?? "Then validate improvements with benchmark.";

    const answer = `Based on the current optimization result, the highest priority fix is: ${topFix}. Next important step: ${secondFix}. For a winning demo, show before/after benchmark proof and explain how the patch improves AMD GPU readiness.`;

    setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    setQuestion("");
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

  const plan = result?.optimization_result?.plan ?? [];
  const gains = result?.optimization_result?.projected_gains;

  return (
    <main className="min-h-screen">
      <Sidebar />

      <div className="ml-64">
        <Topbar />

        <section className="p-8">
          <p className="text-sm font-semibold text-amber-400">
            AI Optimization Assistant
          </p>
          <h1 className="mt-2 text-5xl font-bold">Optimizer</h1>
          <p className="mt-3 max-w-3xl text-zinc-400">
            Generate AMD GPU optimization plans, explain fix priorities, and
            chat with Axion about performance strategy.
          </p>

          <div className="mt-8 grid grid-cols-12 gap-6">
            <div className="col-span-5 glass-card rounded-2xl p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Sparkles className="h-5 w-5 text-emerald-300" />
                AI Assistance
              </h2>

              <button
                onClick={runOptimizer}
                disabled={loading}
                className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-semibold text-black disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {loading ? "Optimizing..." : "Generate Optimization Plan"}
              </button>

              <div className="scrollbar-thin max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {plan.length > 0 ? (
                  plan.map((step: any) => (
                    <div
                      key={step.step}
                      className="rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-4"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                          {step.step}
                        </div>
                        <div>
                          <p className="font-semibold">{step.title}</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {step.impact} impact · {step.effort} effort
                          </p>
                          {step.reason && (
                            <p className="mt-2 text-xs leading-6 text-zinc-400">
                              {step.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">
                    Run optimizer to generate recommendations.
                  </p>
                )}
              </div>
            </div>

            <div className="col-span-4 glass-card rounded-2xl p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Bot className="h-5 w-5 text-emerald-300" />
                Optimizer Chat Box
              </h2>

              <div className="scrollbar-thin h-[420px] space-y-4 overflow-y-auto rounded-xl border border-white/5 bg-black/25 p-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`rounded-xl p-4 text-sm leading-7 ${
                      msg.role === "assistant"
                        ? "border border-emerald-400/10 bg-emerald-400/10 text-emerald-100"
                        : "border border-amber-400/10 bg-amber-400/10 text-amber-100"
                    }`}
                  >
                    <p className="mb-1 text-xs uppercase text-zinc-500">
                      {msg.role}
                    </p>
                    {msg.content}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") askOptimizer();
                  }}
                  placeholder="Ask about optimization..."
                  className="flex-1 rounded-xl border border-emerald-400/10 bg-black/45 px-4 py-3 text-sm outline-none"
                />
                <button
                  onClick={askOptimizer}
                  className="rounded-xl bg-amber-400 px-4 text-black"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="col-span-3 glass-card rounded-2xl p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Zap className="h-5 w-5 text-amber-400" />
                Projected Gains
              </h2>

              {gains ? (
                <div className="space-y-4">
                  <Gain
                    label="Latency Reduction"
                    value={`${gains.latency_reduction}%`}
                  />
                  <Gain
                    label="Memory Reduction"
                    value={`${gains.memory_reduction}%`}
                  />
                  <Gain
                    label="Throughput Gain"
                    value={`${gains.throughput_gain}%`}
                  />
                  <Gain label="Readiness Gain" value={`+${gains.readiness_gain}`} />
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  Projected gains will appear here.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Gain({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-emerald-300">{value}</p>
    </div>
  );
}




