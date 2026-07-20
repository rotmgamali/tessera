import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Scale,
  Grid2x2,
  FileCheck2,
  Share2,
  Hexagon,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/certificates", label: "Certificate Inbox", icon: Inbox },
  { to: "/ledger", label: "Mass-Balance Ledger", icon: Scale },
  { to: "/aggregation", label: "Lot Aggregation", icon: Grid2x2 },
  { to: "/substantiation", label: "Substantiation & Export", icon: FileCheck2 },
  { to: "/provenance", label: "Provenance Graph", icon: Share2 },
];

export default function Sidebar() {
  return (
    <aside className="bb-sidebar w-[240px] shrink-0 flex flex-col h-full">
      {/* Wordmark */}
      <div className="px-5 h-16 flex items-center gap-2.5 border-b border-bb-border">
        <Hexagon className="w-6 h-6 text-bb-gold" strokeWidth={1.6} />
        <div className="flex flex-col leading-none">
          <span className="text-bb-text-primary font-semibold tracking-[0.22em] text-[15px]">
            TESSERA
          </span>
          <span className="text-bb-text-muted text-[9px] tracking-[0.14em] mt-1">
            PROVENANCE SYSTEM OF RECORD
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-bb-body transition-colors ${
                isActive
                  ? "nav-active font-medium"
                  : "text-bb-text-secondary hover:text-bb-text-primary"
              }`
            }
          >
            <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.7} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer — active certifier context */}
      <div className="px-4 py-4 border-t border-bb-border">
        <div className="text-bb-micro text-bb-text-muted uppercase tracking-wider mb-1">
          Operating account
        </div>
        <div className="text-bb-caption text-bb-text-secondary leading-snug">
          Cadore Ottica S.p.A.
          <br />
          3 ISCC PLUS sites · Acetate Renew
        </div>
      </div>
    </aside>
  );
}
