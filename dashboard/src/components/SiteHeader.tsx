import { useEffect, useState } from "react";

const links = [["Demo", "#demo"], ["Rules", "#rules"], ["Features", "#features"], ["Quick start", "#start"], ["FAQ", "#faq"]] as const;

type Props = { motionPaused: boolean; onToggleMotion: () => void };

export function SiteHeader({ motionPaused, onToggleMotion }: Props) {
  const [theme, setTheme] = useState<"light" | "dark">(() => window.localStorage.getItem("dpi-theme") === "light" ? "light" : "dark");
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    window.localStorage.setItem("dpi-theme", next);
    setTheme(next);
  }
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="site-header-inner">
      <a className="brand" href="#top" aria-label="DPI Engine home"><img src="/dpi-icon.png" alt="" width="34" height="34" /><span>DPI <b>ENGINE</b></span></a>
      <nav aria-label="Main navigation">{links.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>
      <div className="header-actions">
        <button className="icon-button motion-button" onClick={onToggleMotion} aria-pressed={motionPaused} aria-label={motionPaused ? "Resume animations" : "Pause animations"}><span aria-hidden="true">{motionPaused ? "▶" : "Ⅱ"}</span><small>{motionPaused ? "Resume" : "Pause"}</small></button>
        <button className="icon-button theme-button" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}><span aria-hidden="true">{theme === "light" ? "◐" : "☼"}</span></button>
        <a className="github-button" href="https://github.com/nihalmachhi/Deep-Packet-Inspection-DPI-Engine" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
      </div>
    </div></header>
  </>;
}
