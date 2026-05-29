import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Bell, Database, MonitorCog, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Topbar />

        <section className="p-8">
          <p className="text-sm font-semibold text-amber-400">
            Platform Configuration
          </p>
          <h1 className="mt-2 text-5xl font-bold">Settings</h1>
          <p className="mt-3 max-w-3xl text-zinc-400">
            Configure GPU target, optimization defaults, notifications,
            security, and report export behavior.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-6">
            <SettingCard
              icon={<MonitorCog />}
              title="GPU & System"
              items={["Target GPU: AMD MI300X", "ROCm: 6.1.2", "Precision: BF16"]}
            />
            <SettingCard
              icon={<Bell />}
              title="Notifications"
              items={["Scan completed", "Benchmark completed", "Report ready"]}
            />
            <SettingCard
              icon={<Shield />}
              title="Security"
              items={["Admin role", "API access enabled", "Session protected"]}
            />
            <SettingCard
              icon={<Database />}
              title="Data & Reports"
              items={["PDF export enabled", "JSON export enabled", "Report archive local"]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function SettingCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
          {icon}
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm text-zinc-300"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}



