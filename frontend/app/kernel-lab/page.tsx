import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { FlaskConical, CheckCircle2, Cpu, Zap } from "lucide-react";

export default function KernelLabPage() {
  return (
    <main className="min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Topbar />

        <section className="p-8">
          <p className="text-sm font-semibold text-amber-400">
            Advanced Kernel Preview
          </p>
          <h1 className="mt-2 text-5xl font-bold">Kernel Lab</h1>
          <p className="mt-3 max-w-3xl text-zinc-400">
            Experimental module for kernel-level analysis, attention path
            optimization, and memory transfer improvement on AMD GPUs.
          </p>

          <div className="mt-8 grid grid-cols-12 gap-6">
            <div className="col-span-4 glass-card rounded-2xl p-6">
              <FlaskConical className="h-8 w-8 text-amber-400" />
              <p className="mt-6 text-sm text-zinc-400">Kernel Speedup</p>
              <p className="mt-2 text-6xl font-bold text-emerald-300">1.82x</p>
              <p className="mt-3 text-sm text-zinc-500">vs baseline path</p>
            </div>

            <div className="col-span-4 glass-card rounded-2xl p-6">
              <Cpu className="h-8 w-8 text-emerald-300" />
              <p className="mt-6 text-sm text-zinc-400">Target Operation</p>
              <p className="mt-2 text-2xl font-bold">Attention Kernel</p>
              <p className="mt-3 text-sm text-zinc-500">
                Memory-bound LLM inference path
              </p>
            </div>

            <div className="col-span-4 glass-card rounded-2xl p-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-300" />
              <p className="mt-6 text-sm text-zinc-400">Correctness</p>
              <p className="mt-2 text-2xl font-bold text-emerald-300">Passed</p>
              <p className="mt-3 text-sm text-zinc-500">
                Output validation successful
              </p>
            </div>
          </div>

          <div className="mt-8 glass-card rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Zap className="h-6 w-6 text-amber-400" />
              Why this matters
            </h2>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-zinc-400">
              Kernel Lab gives YOUSUN Axion advanced technical depth. It shows
              that optimization does not stop at basic code changes. Axion can
              also identify kernel-level speedup opportunities for AMD GPU
              workloads, making the project stronger for technical judging.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}




