"use client";

/*
  This component must run on the client side because it uses usePathname().
  usePathname() is a Next.js client hook that reads the current route.
*/

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

/*
  Icons from lucide-react.
  Each icon is used for one sidebar navigation item.
*/
import {
  BarChart3,
  Code2,
  FileText,
  FlaskConical,
  Home,
  Search,
  Settings,
  ShieldAlert,
  WandSparkles,
  Workflow,
} from "lucide-react";

/*
  Sidebar navigation items.

  Each object contains:
  - name: The text shown in the sidebar
  - icon: The icon component displayed beside the text
  - href: The route/page path where the link will navigate
*/
const navItems = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Workflow", icon: Workflow, href: "/workflow" },
  { name: "Project Scan", icon: Search, href: "/project-scan" },
  { name: "ROCm Doctor", icon: ShieldAlert, href: "/rocm-doctor" },
  { name: "Optimizer", icon: WandSparkles, href: "/optimizer" },
  { name: "Patch Generator", icon: Code2, href: "/patch-generator" },
  { name: "Benchmark", icon: BarChart3, href: "/benchmark" },
  { name: "Kernel Lab", icon: FlaskConical, href: "/kernel-lab" },
  { name: "Reports", icon: FileText, href: "/reports" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  /*
    Get the current browser pathname.

    Example:
    - If the user is on dashboard, pathname is "/"
    - If the user is on reports page, pathname is "/reports"

    This is used to highlight the active sidebar item.
  */
  const pathname = usePathname();

  return (
    /*
      Main sidebar container.

      fixed:
      Keeps the sidebar fixed on the left side of the screen.

      h-screen:
      Makes the sidebar full screen height.

      w-64:
      Sets sidebar width to 256px.

      bg-black/45 and backdrop-blur-xl:
      Creates a dark glassmorphism style.
    */
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-emerald-400/10 bg-black/45 p-5 backdrop-blur-xl">
      
      {/* Brand/logo section */}
      <div className="mb-8 flex items-center gap-3">
        
        {/* Logo image container */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-400/40 bg-emerald-400/10 green-glow">
          <Image
            src="/logo (8).png"
            alt="YOUSUN Axion Logo"
            width={25}
            height={25}
            className="h-10 w-10 object-contain"
            priority
          />
        </div>

        {/* Project name and subtitle */}
        <div>
          <h1 className="text-xl font-bold tracking-tight">YOUSUN Axion</h1>
          <p className="text-xs leading-5 text-zinc-400">
            Autonomous GPU Intelligence
          </p>
        </div>
      </div>

      {/*
        Navigation menu area.

        no-scrollbar:
        Hides the scrollbar visually.

        flex-1:
        Allows the nav area to take the remaining sidebar height.

        overflow-y-auto:
        Allows scrolling if sidebar items exceed available height.
      */}
      <nav className="no-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          /*
            Get the icon component from the current nav item.

            React components must start with uppercase letters,
            so item.icon is assigned to Icon.
          */
          const Icon = item.icon;

          /*
            Check whether this nav item matches the current page route.

            If true, the item gets active styling.
          */
          const active = pathname === item.href;

          return (
            /*
              Next.js Link component.

              It navigates between pages without a full page reload.
            */
            <Link
              href={item.href}
              key={item.name}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                active
                  ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 shadow-[0_0_22px_rgba(16,185,129,0.16)]"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {/* Navigation icon */}
              <Icon className="h-5 w-5 shrink-0" />

              {/* Navigation text */}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/*
        Bottom sidebar section.

        This area shows:
        - Current workspace
        - Current plan
        - Copyright text
      */}
      <div className="mt-4 shrink-0 space-y-3">
        
        {/* Workspace information card */}
        <div className="rounded-2xl border border-emerald-400/10 bg-white/[0.03] p-4">
          <p className="text-xs text-zinc-500">WORKSPACE</p>
          <p className="mt-1 text-sm font-semibold">Retail-LLM-Inference</p>
        </div>

        {/* Plan information card */}
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
          <p className="text-xs text-amber-400">YOUSUN Labs</p>
          <p className="mt-1 text-sm font-semibold text-amber-200">
            Enterprise Plan
          </p>
        </div>

        {/* Sidebar footer */}
        <p className="text-xs text-zinc-600">© 2026 YOUSUN Axion</p>
      </div>
    </aside>
  );
}



