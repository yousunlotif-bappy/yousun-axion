/*
  Shared dashboard layout components.

  Sidebar:
  - Shows the left navigation menu.

  Topbar:
  - Shows the top status/navigation bar.
*/
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

/*
  Icons from lucide-react.

  Each icon represents one workflow step visually.
*/
import {
  UploadCloud,
  Search,
  ShieldAlert,
  WandSparkles,
  Code2,
  BarChart3,
  FileText,
  CheckCircle2,
} from "lucide-react";

/*
  Workflow step data.

  Each object contains:
  - title: Step name
  - icon: Icon component for the step
  - desc: Short explanation of what the step does

  This array is later mapped to generate workflow cards automatically.
*/
const steps = [
  {
    title: "Upload Workload",
    icon: UploadCloud,
    desc: "User uploads AI code, repo, or ROCm error log.",
  },
  {
    title: "Project Scan",
    icon: Search,
    desc: "Axion detects framework, precision, CUDA usage, and readiness risks.",
  },
  {
    title: "ROCm Doctor",
    icon: ShieldAlert,
    desc: "Diagnoses HIP memory, CUDA compatibility, and ROCm runtime problems.",
  },
  {
    title: "Optimizer",
    icon: WandSparkles,
    desc: "Generates AMD GPU optimization plan with impact and effort level.",
  },
  {
    title: "Patch Generator",
    icon: Code2,
    desc: "Creates actual code changes such as BF16, inference mode, and device abstraction.",
  },
  {
    title: "Benchmark",
    icon: BarChart3,
    desc: "Compares before/after latency, tokens/sec, memory, and readiness score.",
  },
  {
    title: "Reports",
    icon: FileText,
    desc: "Exports AMD Readiness Report with business impact and final verdict.",
  },
  {
    title: "AMD-Ready Output",
    icon: CheckCircle2,
    desc: "Developer gets optimized, benchmarked, AMD-ready workload.",
  },
];

export default function WorkflowPage() {
  return (
    /*
      Main page wrapper.

      min-h-screen:
      Makes the page at least full screen height.
    */
    <main className="min-h-screen">
      {/* Fixed left sidebar */}
      <Sidebar />

      {/*
        Main content area.

        ml-64:
        Adds left margin equal to sidebar width,
        so content does not go under the sidebar.
      */}
      <div className="ml-64">
        {/* Top navigation/status bar */}
        <Topbar />

        {/* Page content container */}
        <section className="p-8">
          {/* Small page category label */}
          <p className="text-sm font-semibold text-amber-400">
            End-to-End Agent Pipeline
          </p>

          {/* Main page title */}
          <h1 className="mt-2 text-5xl font-bold">Workflow</h1>

          {/* Page description */}
          <p className="mt-3 max-w-3xl text-zinc-400">
            YOUSUN Axion turns broken or slow AI workloads into optimized,
            benchmarked, AMD-ready deployments through an autonomous multi-agent
            workflow.
          </p>

          {/*
            Workflow cards grid.

            grid-cols-4:
            Shows four cards per row.

            steps.map():
            Creates one card for every workflow step.
          */}
          <div className="mt-10 grid grid-cols-4 gap-6">
            {steps.map((step, index) => {
              /*
                Get the icon component from the current step.

                React components must start with uppercase letters,
                so step.icon is assigned to Icon.
              */
              const Icon = step.icon;

              return (
                /*
                  Single workflow step card.

                  key={step.title}:
                  Gives React a unique identifier for each card.
                */
                <div key={step.title} className="glass-card rounded-2xl p-6">
                  {/* Card top row: icon on left, step number on right */}
                  <div className="mb-5 flex items-center justify-between">
                    {/* Icon container */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Step number */}
                    <span className="text-3xl font-bold text-emerald-400/30">
                      {index + 1}
                    </span>
                  </div>

                  {/* Step title */}
                  <h2 className="text-xl font-semibold">{step.title}</h2>

                  {/* Step description */}
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/*
            Optimization Loop section.

            This explains that some agents can run repeatedly
            until the workload reaches the desired performance target.
          */}
          <div className="mt-8 glass-card rounded-2xl p-6">
            <h2 className="text-2xl font-semibold">Optimization Loop</h2>

            <p className="mt-3 text-zinc-400">
              Optimizer, Patch Generator, Benchmark, and Kernel Lab can run
              repeatedly until target latency, memory, and readiness goals are
              reached.
            </p>

            {/*
              Loop stages.

              These represent the repeated optimization cycle:
              Optimizer -> Patch -> Benchmark -> Kernel Lab
            */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              {["Optimizer", "Patch", "Benchmark", "Kernel Lab"].map((item) => (
                /*
                  Single optimization loop item.
                */
                <div
                  key={item}
                  className="rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-5 text-center"
                >
                  <p className="font-semibold text-emerald-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}



