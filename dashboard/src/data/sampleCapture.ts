export type Protocol = "TCP" | "UDP";
export type SampleRule = { id: string; kind: "app" | "ip" | "domain"; value: string; label: string };

export type SampleFlow = {
  id: string;
  host: string;
  app: string;
  protocol: Protocol;
  port: number;
  source: string;
  destination: string;
  packets: number;
  evidence: string;
};

// Representative flows and exact packet totals from the checked-in test_dpi.pcap fixture.
export const sampleFlows: SampleFlow[] = [
  { id: "flow-01", host: "www.youtube.com", app: "YouTube", protocol: "TCP", port: 443, source: "192.168.1.100", destination: "142.250.185.206", packets: 8, evidence: "TLS SNI" },
  { id: "flow-02", host: "www.facebook.com", app: "Facebook", protocol: "TCP", port: 443, source: "192.168.1.101", destination: "157.240.229.35", packets: 5, evidence: "TLS SNI" },
  { id: "flow-03", host: "DNS question not extracted", app: "DNS", protocol: "UDP", port: 53, source: "192.168.1.102", destination: "8.8.8.8", packets: 4, evidence: "Destination port 53" },
  { id: "flow-04", host: "example.com", app: "HTTPS", protocol: "TCP", port: 80, source: "192.168.1.103", destination: "93.184.216.34", packets: 3, evidence: "HTTP Host" },
  { id: "flow-05", host: "github.com", app: "GitHub", protocol: "TCP", port: 443, source: "192.168.1.104", destination: "151.101.1.140", packets: 6, evidence: "TLS SNI" },
  { id: "flow-06", host: "telegram.org", app: "Telegram", protocol: "TCP", port: 443, source: "192.168.1.105", destination: "149.154.167.51", packets: 4, evidence: "TLS SNI" },
  { id: "flow-07", host: "www.instagram.com", app: "Instagram", protocol: "TCP", port: 443, source: "192.168.1.106", destination: "31.13.92.36", packets: 5, evidence: "TLS SNI" },
  { id: "flow-08", host: "open.spotify.com", app: "Spotify", protocol: "TCP", port: 443, source: "192.168.1.107", destination: "199.232.64.78", packets: 4, evidence: "TLS SNI" },
  { id: "flow-09", host: "www.amazon.com", app: "Amazon", protocol: "TCP", port: 443, source: "192.168.1.108", destination: "13.32.99.14", packets: 5, evidence: "TLS SNI" },
  { id: "flow-10", host: "discord.com", app: "Discord", protocol: "TCP", port: 443, source: "192.168.1.109", destination: "185.94.192.17", packets: 4, evidence: "TLS SNI" },
  { id: "flow-11", host: "www.tiktok.com", app: "TikTok", protocol: "TCP", port: 443, source: "192.168.1.50", destination: "104.18.25.35", packets: 5, evidence: "TLS SNI" },
  { id: "flow-12", host: "zoom.us", app: "Zoom", protocol: "TCP", port: 443, source: "192.168.1.110", destination: "18.160.0.52", packets: 3, evidence: "TLS SNI" },
  { id: "flow-13", host: "DNS question not extracted", app: "DNS", protocol: "UDP", port: 53, source: "192.168.1.111", destination: "8.8.8.8", packets: 2, evidence: "Destination port 53" },
  { id: "flow-14", host: "api.github.com", app: "GitHub", protocol: "TCP", port: 443, source: "192.168.1.112", destination: "140.82.112.4", packets: 3, evidence: "TLS SNI" },
  { id: "flow-15", host: "www.apple.com", app: "Apple", protocol: "TCP", port: 443, source: "192.168.1.113", destination: "23.195.0.0", packets: 3, evidence: "TLS SNI" },
];

export const sampleRules: SampleRule[] = [
  { id: "app-youtube", kind: "app", value: "YouTube", label: "App · YouTube" },
  { id: "ip-tiktok", kind: "ip", value: "192.168.1.50", label: "Source IP · 192.168.1.50" },
  { id: "domain-github", kind: "domain", value: "github", label: "Domain · github" },
];

export const sampleSummary = { packets: 64, bytes: 10130, tcp: 58, udp: 6, flows: 15 };

export function flowMatchesRule(flow: SampleFlow, rule: SampleRule): boolean {
  if (rule.kind === "app") return flow.app.toLowerCase() === rule.value.toLowerCase();
  if (rule.kind === "ip") return flow.source === rule.value;
  return flow.host.toLowerCase().includes(rule.value.toLowerCase());
}
