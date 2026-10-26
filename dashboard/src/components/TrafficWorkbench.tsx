import { useEffect, useMemo, useState } from "react";
import { flowMatchesRule, sampleFlows, sampleRules, sampleSummary, type Protocol, type SampleFlow } from "../data/sampleCapture";

type Props = {
  activeRules: string[];
  onToggleRule: (id: string) => void;
  autoReplay: boolean;
  onToggleReplay: () => void;
  motionPaused: boolean;
};

export function TrafficWorkbench({ activeRules, onToggleRule, autoReplay, onToggleReplay, motionPaused }: Props) {
  const [protocol, setProtocol] = useState<"All" | Protocol>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(sampleFlows[sampleFlows.length - 1].id);
  const activeRulesData = sampleRules.filter((rule) => activeRules.includes(rule.id));
  const isBlocked = (flow: SampleFlow) => activeRulesData.some((rule) => flowMatchesRule(flow, rule));
  const blockedPackets = sampleFlows.reduce((total, flow) => total + (isBlocked(flow) ? flow.packets : 0), 0);
  const selectedFlow = sampleFlows.find((flow) => flow.id === selectedId) ?? sampleFlows[0];
  const selectedRule = activeRulesData.find((rule) => flowMatchesRule(selectedFlow, rule));
  const visibleFlows = useMemo(() => sampleFlows.filter((flow) => {
    const matchesProtocol = protocol === "All" || flow.protocol === protocol;
    const matchesQuery = `${flow.host} ${flow.app} ${flow.source} ${flow.destination}`.toLowerCase().includes(query.toLowerCase());
    return matchesProtocol && matchesQuery;
  }), [protocol, query]);

  useEffect(() => {
    if (!autoReplay || motionPaused) return;
    const timer = window.setInterval(() => setSelectedId((current) => {
      const index = sampleFlows.findIndex((flow) => flow.id === current);
      return sampleFlows[(index + 1) % sampleFlows.length].id;
    }), 1150);
    return () => window.clearInterval(timer);
  }, [autoReplay, motionPaused]);

  function replayFromStart() {
    setSelectedId(sampleFlows[0].id);
    if (!autoReplay) onToggleReplay();
  }

  return (
    <section className="demo-section" id="demo" aria-labelledby="demo-title">
      <div className="demo-heading"><div><p className="eyebrow"><span className="eyebrow-mark" /> SAMPLE PCAP · INTERACTIVE PREVIEW</p><h2 id="demo-title">Watch a capture become a decision.</h2><p>The checked-in fixture starts with 64 packets and 15 flows. Add a rule, inspect the match, and see the output count change.</p></div><span className="fixture-pill"><i /> test_dpi.pcap</span></div>
      <div className="dashboard-frame">
        <div className="dashboard-topbar"><div className="dashboard-brand"><span className="dashboard-mark">DPI</span><div><strong>Capture workbench</strong><small>Offline fixture · no live traffic</small></div></div><div className="dash-live"><i className={autoReplay && !motionPaused ? "pulse-dot" : ""} />{autoReplay && !motionPaused ? "REPLAYING SAMPLE" : "SAMPLE READY"}</div></div>
        <div className="dashboard-metrics">
          <Metric label="PACKETS" value={sampleSummary.packets.toString()} color="cyan" />
          <Metric label="TCP / UDP" value={`${sampleSummary.tcp} / ${sampleSummary.udp}`} color="violet" />
          <Metric label="FLOWS" value={sampleSummary.flows.toString()} color="blue" />
          <Metric label="FORWARDED" value={(sampleSummary.packets - blockedPackets).toString()} color="green" />
          <Metric label="BLOCKED" value={blockedPackets.toString()} color={blockedPackets ? "rose" : "neutral"} />
        </div>
        <div className="dashboard-controls"><div className="control-copy"><span className="control-label">RULE SET</span><div className="active-rule-chips">{activeRulesData.length ? activeRulesData.map((rule) => <button key={rule.id} className="active-rule-chip" onClick={() => onToggleRule(rule.id)} title={`Remove ${rule.label}`}>{rule.label}<b aria-hidden="true">×</b></button>) : <span className="no-rules">No blocking rules applied</span>}</div></div><div className="demo-actions"><button className="demo-button" onClick={replayFromStart}><span aria-hidden="true">↻</span> Replay sample</button><button className={`auto-toggle ${autoReplay ? "on" : ""}`} onClick={onToggleReplay} aria-pressed={autoReplay}><i /> Auto replay</button></div></div>
        <div className="dashboard-main">
          <div className="traffic-panel">
            <div className="traffic-panel-heading"><div><h3>Flow inspection</h3><p>Click a flow to inspect its metadata and rule decision.</p></div><label className="traffic-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search host or IP" aria-label="Search flows" /></label></div>
            <div className="traffic-filters" role="group" aria-label="Protocol filter">{(["All", "TCP", "UDP"] as const).map((item) => <button key={item} className={protocol === item ? "selected" : ""} onClick={() => setProtocol(item)} aria-pressed={protocol === item}>{item}</button>)}<span className="rows-count">{visibleFlows.length} flows</span></div>
            <div className="flow-list" role="group" aria-label="Sample flows" aria-live="polite">{visibleFlows.map((flow) => {
              const rule = activeRulesData.find((item) => flowMatchesRule(flow, item));
              const blocked = Boolean(rule);
              return <button className={`flow-row ${selectedId === flow.id ? "current" : ""}`} key={flow.id} onClick={() => setSelectedId(flow.id)} aria-pressed={selectedId === flow.id}>
                <span className={`flow-signal signal-${flow.app.toLowerCase().replace(/[^a-z]+/g, "-")}`}>{flow.app.slice(0, 2).toUpperCase()}</span><span className="flow-primary"><strong>{flow.host}</strong><small>{flow.source} <b>→</b> {flow.destination}:{flow.port}</small></span><span className={`transport-badge ${flow.protocol.toLowerCase()}`}>{flow.protocol}</span><span className="flow-count">{flow.packets}<small>pkts</small></span><span className={`flow-status ${blocked ? "blocked" : "allowed"}`}><i />{blocked ? "Blocked" : "Allowed"}</span>
              </button>;
            })}{visibleFlows.length === 0 && <p className="empty-state">No flows match your search.</p>}</div>
            <div className="traffic-foot"><span><i className="legend-allow" /> Allowed</span><span><i className="legend-block" /> Rule matched</span><small>Representative flows from the bundled PCAP</small></div>
          </div>
          <aside className="inspector-panel" aria-label="Selected flow details">
            <div className="inspector-heading"><span className="inspector-label">DECISION INSPECTOR</span><span className={`decision-pill ${selectedRule ? "blocked" : "allowed"}`}>{selectedRule ? "BLOCKED" : "ALLOWED"}</span></div>
            <h3>{selectedFlow.host}</h3><p className="inspector-subtitle">{selectedFlow.app} · {selectedFlow.protocol} · {selectedFlow.packets} packets</p>
            <div className="inspect-path"><div className="path-step"><span className="path-icon icon-cyan">01</span><span><b>Parse</b><small>IPv4 · {selectedFlow.protocol} · port {selectedFlow.port}</small></span></div><div className="path-connector" /><div className="path-step"><span className="path-icon icon-violet">02</span><span><b>Identify</b><small>{selectedFlow.evidence} → {selectedFlow.app}</small></span></div><div className="path-connector" /><div className="path-step"><span className={`path-icon ${selectedRule ? "icon-rose" : "icon-green"}`}>03</span><span><b>{selectedRule ? "Drop flow" : "Keep flow"}</b><small>{selectedRule ? `Matched ${selectedRule.label}` : "No active rule matched"}</small></span></div></div>
            <div className="inspector-address"><span>SOURCE</span><code>{selectedFlow.source}</code><span>DESTINATION</span><code>{selectedFlow.destination}:{selectedFlow.port}</code></div>
            <div className="protocol-mix"><div className="mix-heading"><span>CAPTURE PROTOCOLS</span><small>64 packets</small></div><div className="mix-track"><i className="mix-tcp" /><i className="mix-udp" /></div><div className="mix-legend"><span><i className="legend-tcp" />TCP <b>58</b></span><span><i className="legend-udp" />UDP <b>6</b></span></div></div>
          </aside>
        </div>
        <div className="decision-strip"><span className="strip-mark">↳</span><span><b>Packet filter</b><small>Allowed packet records are copied to a new PCAP. Packets from a blocked flow are omitted.</small></span><div className="scan-wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><span className="output-chip">OUTPUT · {sampleSummary.packets - blockedPackets} PACKETS</span></div>
      </div>
      <p className="demo-disclaimer">This simulator uses bundled sample metadata in your browser. The Python CLI processes actual PCAP bytes; the preview does not read or write files.</p>
    </section>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: "cyan" | "violet" | "blue" | "green" | "rose" | "neutral" }) {
  return <div className={`dash-metric metric-${color}`}><span>{label}</span><strong>{value}</strong><i /></div>;
}
