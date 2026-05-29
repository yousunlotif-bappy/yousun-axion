"use client";

/*
  This page is a client component because it uses React state.
  The user can type an error log, send it to the backend,
  and see the diagnosis result without reloading the page.
*/
import { useState } from "react";

/* Shared dashboard layout components */
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

/*
  API helper function.

  runDoctor:
  - Sends the error log to the backend /doctor endpoint
  - Receives ROCm diagnosis result
*/
import { runDoctor } from "@/lib/api";

/* Icons used in this page */
import { Bot, Send, ShieldAlert, Terminal } from "lucide-react";

/*
  Message type for the AI chat box.

  role:
  - "user" means message from the user
  - "assistant" means message from ROCm Doctor assistant

  content:
  - The actual text message
*/
type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ROCmDoctorPage() {
  /*
    errorLog:
    Stores the ROCm/HIP/CUDA error log typed by the user.
    A default sample error is provided for quick testing.
  */
  const [errorLog, setErrorLog] = useState(
    "RuntimeError: HIP out of memory while running model.generate on cuda device."
  );

  /*
    messages:
    Stores all chat messages shown inside the AI Chat Box.

    It starts with one assistant message that tells the user what to do.
  */
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Paste your ROCm/HIP/CUDA error log. I will diagnose root cause and generate fixes.",
    },
  ]);

  /*
    loading:
    Shows whether the diagnosis request is currently running.
    Used to disable the button and show "Diagnosing..." text.
  */
  const [loading, setLoading] = useState(false);

  /*
    diagnosis:
    Stores the structured diagnosis result returned by the backend.
    It is null before the user sends an error log.
  */
  const [diagnosis, setDiagnosis] = useState<any>(null);

  /*
    sendLog function.

    This function runs when the user clicks "Send to ROCm Doctor".

    Steps:
    1. Enable loading state
    2. Add user message to chat box
    3. Send error log to backend using runDoctor()
    4. Save backend diagnosis result
    5. Create a short assistant reply
    6. Add assistant reply to chat box
    7. Stop loading
  */
  async function sendLog() {
    setLoading(true);

    /*
      Add the user's current error log as a chat message.
    */
    setMessages((prev) => [...prev, { role: "user", content: errorLog }]);

    try {
      /*
        Send error log to FastAPI backend.
        The backend returns diagnosis score, status, issues, fixes, etc.
      */
      const data = await runDoctor(errorLog);

      /*
        Store full diagnosis result for the right-side Diagnosis panel.
      */
      setDiagnosis(data);

      /*
        Build a short human-readable assistant reply
        using the backend diagnosis result.
      */
      const reply = `Diagnosis: ${data.status}. I found ${
        data.issues.length
      } issue(s). Main issue: ${data.issues[0]?.title}. Recommended fix: ${
        data.recommended_fixes[0]
      }`;

      /*
        Add assistant reply to the chat box.
      */
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      /*
        Show an alert if backend is not running or request fails.
      */
      alert("ROCm Doctor failed. Make sure backend is running.");
    } finally {
      /*
        Stop loading whether the request succeeds or fails.
      */
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Fixed left sidebar */}
      <Sidebar />

      {/* Main content starts after sidebar width */}
      <div className="ml-64">
        {/* Top navigation/status bar */}
        <Topbar />

        <section className="p-8">
          {/* Page heading */}
          <p className="text-sm font-semibold text-amber-400">
            AI Diagnostic Chat
          </p>

          <h1 className="mt-2 text-5xl font-bold">ROCm Doctor</h1>

          <p className="mt-3 max-w-3xl text-zinc-400">
            Chat with Axion to diagnose HIP memory, CUDA compatibility, ROCm
            runtime, driver mismatch, and AMD GPU environment problems.
          </p>

          {/* Main three-column layout */}
          <div className="mt-8 grid grid-cols-12 gap-6">
            
            {/* Left panel: error log input */}
            <div className="col-span-5 glass-card rounded-2xl p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Terminal className="h-5 w-5 text-emerald-300" />
                Error Log
              </h2>

              {/* Editable error log textarea */}
              <textarea
                value={errorLog}
                onChange={(e) => setErrorLog(e.target.value)}
                className="scrollbar-thin h-[420px] w-full resize-none rounded-xl border border-amber-400/10 bg-black/45 p-4 font-mono text-sm leading-7 text-zinc-300 outline-none"
              />

              {/* Send error log to backend doctor endpoint */}
              <button
                onClick={sendLog}
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-semibold text-black disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {loading ? "Diagnosing..." : "Send to ROCm Doctor"}
              </button>
            </div>

            {/* Middle panel: AI chat box */}
            <div className="col-span-4 glass-card rounded-2xl p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Bot className="h-5 w-5 text-emerald-300" />
                AI Chat Box
              </h2>

              {/* Chat message list */}
              <div className="scrollbar-thin h-[510px] space-y-4 overflow-y-auto rounded-xl border border-white/5 bg-black/25 p-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`rounded-xl p-4 text-sm leading-7 ${
                      msg.role === "assistant"
                        ? "border border-emerald-400/10 bg-emerald-400/10 text-emerald-100"
                        : "border border-amber-400/10 bg-amber-400/10 text-amber-100"
                    }`}
                  >
                    {/* Message role label */}
                    <p className="mb-1 text-xs uppercase text-zinc-500">
                      {msg.role}
                    </p>

                    {/* Message text */}
                    {msg.content}
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel: structured diagnosis result */}
            <div className="col-span-3 glass-card rounded-2xl p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                Diagnosis
              </h2>

              {diagnosis ? (
                <div className="space-y-4">
                  {/* Diagnosis score from backend */}
                  <BigStat label="Score" value={`${diagnosis.diagnosis_score}/100`} />

                  {/* Diagnosis status, for example Fixable or Healthy */}
                  <BigStat label="Status" value={diagnosis.status} />

                  {/* Backend confidence converted to percentage */}
                  <BigStat label="Confidence" value={`${Math.round(diagnosis.confidence * 100)}%`} />

                  {/* First recommended fix */}
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-7 text-emerald-100">
                    {diagnosis.recommended_fixes[0]}
                  </div>
                </div>
              ) : (
                /*
                  Placeholder text before any diagnosis is generated.
                */
                <p className="text-sm text-zinc-500">
                  Diagnosis result will appear here.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/*
  BigStat component.

  Reusable stat card for showing diagnosis values:
  - Score
  - Status
  - Confidence
*/
function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-emerald-300">{value}</p>
    </div>
  );
}


