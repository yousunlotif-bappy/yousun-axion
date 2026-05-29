import { Activity, Bell, HelpCircle, Settings } from "lucide-react";

/*
  Topbar component.

  This component creates the top navigation/header area of the dashboard.
  It shows system status, ROCm version, GPU system info, project name,
  action icons, and user profile information.
*/
export default function Topbar() {
  return (
    /*
      Main topbar container.

      sticky top-0:
      Keeps the topbar visible when scrolling.

      z-20:
      Keeps the topbar above normal page content.

      backdrop-blur-xl:
      Creates a glass-like blur effect.

      bg-[#020806]/85:
      Uses a dark transparent background.
    */
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-emerald-400/10 bg-[#020806]/85 px-8 py-5 backdrop-blur-xl">
      
      {/* Left side: system/project status pills */}
      <div className="flex gap-4">
        {/* Shows backend/system connection status */}
        <TopPill label="Status" value="● Connected" highlight />

        {/* Shows ROCm version */}
        <TopPill label="ROCm" value="6.1.2" />

        {/* Shows GPU system information */}
        <TopPill label="System" value="MI300X · 8 GPUs" />

        {/* Shows active project/workspace */}
        <TopPill label="Project" value="Retail-LLM-Inference" />
      </div>

      {/* Right side: action buttons and user profile */}
      <div className="flex items-center gap-3">
        
        {/* Notification button */}
        <IconButton>
          <Bell className="h-5 w-5" />
        </IconButton>

        {/* Activity/monitoring button */}
        <IconButton>
          <Activity className="h-5 w-5" />
        </IconButton>

        {/* Help/support button */}
        <IconButton>
          <HelpCircle className="h-5 w-5" />
        </IconButton>

        {/* Settings button */}
        <IconButton>
          <Settings className="h-5 w-5" />
        </IconButton>

        {/*
          User profile card.

          Shows:
          - User avatar initials
          - User name
          - User role
        */}
        <div className="ml-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2">
          
          {/* User avatar with initials */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/20 text-sm font-bold text-emerald-200">
            AK
          </div>

          {/* User identity text */}
          <div>
            <p className="text-sm font-semibold">Admin User</p>
            <p className="text-xs text-zinc-500">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}

/*
  TopPill component.

  This small reusable component displays dashboard metadata
  such as status, ROCm version, GPU system, and project name.

  Props:
  - label: Small title text
  - value: Main value text
  - highlight: Optional boolean to apply emerald color
*/
function TopPill({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    /*
      Pill container.

      It uses:
      - Rounded corners
      - Soft border
      - Transparent background
    */
    <div className="rounded-xl border border-emerald-400/15 bg-white/[0.03] px-5 py-3">
      
      {/* Small label text */}
      <p className="text-xs text-zinc-500">{label}</p>

      {/*
        Main value text.

        If highlight is true:
        - Use emerald color

        Otherwise:
        - Use normal light text
      */}
      <p
        className={`text-sm font-semibold ${
          highlight ? "text-emerald-300" : "text-zinc-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/*
  IconButton component.

  This reusable button wraps icon components.
  It keeps all topbar icon buttons visually consistent.
*/
function IconButton({ children }: { children: React.ReactNode }) {
  return (
    /*
      Icon button style.

      It includes:
      - Rounded border
      - Soft transparent background on hover
      - Text color transition
    */
    <button className="rounded-xl border border-white/10 p-3 text-zinc-300 transition hover:bg-white/5 hover:text-white">
      {children}
    </button>
  );
}



