import { useLocation } from "react-router-dom";
import { Plus, CalendarClock } from "lucide-react";
import { deadlines, daysUntil } from "../fixtures";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Portfolio provenance & compliance overview" },
  "/certificates": { title: "Certificate Inbox", subtitle: "Supplier declarations & transaction certificates" },
  "/ledger": { title: "Mass-Balance Ledger", subtitle: "ISCC PLUS 203-2 site-specific bookkeeping" },
  "/aggregation": { title: "Lot Aggregation", subtitle: "Sub-MOQ offcuts stitched into certified lots" },
  "/substantiation": { title: "Substantiation & Export", subtitle: "EmpCo / PPWR dossiers · DPP-ready export" },
  "/provenance": { title: "Provenance Graph", subtitle: "The two-sided verified-transaction network" },
};

function nearestDeadline() {
  const upcoming = [...deadlines]
    .map((d) => ({ ...d, days: daysUntil(d.date) }))
    .filter((d) => d.days >= 0)
    .sort((a, b) => a.days - b.days);
  return upcoming[0] ?? { ...deadlines[deadlines.length - 1], days: daysUntil(deadlines[deadlines.length - 1].date) };
}

export default function TopBar() {
  const { pathname } = useLocation();
  const meta = titles[pathname] ?? titles["/"];
  const nd = nearestDeadline();

  return (
    <header className="bb-topbar h-16 shrink-0 flex items-center justify-between px-6 border-b border-bb-border">
      <div className="min-w-0">
        <h1 className="text-bb-title text-bb-text-primary truncate">{meta.title}</h1>
        <p className="text-bb-caption text-bb-text-muted truncate">{meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Deadline countdown chip */}
        <div
          className="hidden md:flex items-center gap-2 rounded-lg px-3 py-1.5 border"
          style={{ background: "var(--bb-gold-glow-bg)", borderColor: "var(--bb-border-gold)" }}
          title={nd.detail}
        >
          <CalendarClock className="w-4 h-4 text-bb-gold" />
          <div className="leading-tight">
            <div className="text-bb-micro text-bb-text-muted uppercase tracking-wide">
              {nd.regime} · {nd.label}
            </div>
            <div className="text-bb-caption font-semibold text-bb-gold bb-numeric">
              {nd.days === 0 ? "Today" : `${nd.days} days`}
            </div>
          </div>
        </div>

        {/* Global add-certificate action */}
        <button
          className="bb-event-action bb-event-action-primary"
          onClick={() => alert("Demo: certificate upload / ingestion is stubbed in Wave 1.")}
        >
          <Plus className="w-4 h-4" />
          Add certificate
        </button>

        {/* User avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-bb-caption font-semibold text-bb-bg-deep"
          style={{ background: "linear-gradient(180deg, var(--bb-gold-light), var(--bb-gold))" }}
          title="Giulia Ferraro — Head of Sustainability & Compliance"
        >
          GF
        </div>
      </div>
    </header>
  );
}
