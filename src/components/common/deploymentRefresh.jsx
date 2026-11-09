import { Component } from "react";
import { withRouter } from "react-router-dom";

// CRA gives each main bundle a content hash; no extra dependency or build step.
export class DeploymentRefresh extends Component {
  componentDidMount() {
    this.mounted = true;
    this.loadedBundle = Array.from(document.scripts)
      .map(script => script.src)
      .find(src => /\/static\/js\/main\.[^/]+\.js(?:\?|$)/.test(src));
  }

  componentDidUpdate(previous) {
    if (previous.location.pathname !== this.props.location.pathname) this.checkVersion();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  checkVersion = async () => {
    if (process.env.NODE_ENV !== "production" || !this.loadedBundle || this.checking) return;
    this.checking = true;
    try {
      const base = this.loadedBundle.split("/static/js/")[0] + "/";
      const response = await fetch(base + "asset-manifest.json?_check=" + Date.now(), {
        cache: "no-store",
        credentials: "same-origin"
      });
      if (!response.ok) return;
      const manifest = await response.json();
      const main = manifest.files && manifest.files["main.js"];
      if (!main || !this.mounted) return;
      const next = new URL(main, base);
      const loaded = new URL(this.loadedBundle);
      if (next.origin !== loaded.origin || next.pathname === loaded.pathname) return;
      // Prevent repeated refreshes if a proxy temporarily serves an old index.
      const key = "frontend-refreshed:" + base;
      if (sessionStorage.getItem(key) === next.pathname) return;
      sessionStorage.setItem(key, next.pathname);
      const target = new URL(window.location.href);
      target.searchParams.set("_frontend", next.pathname.split("/").pop());
      window.location.replace(target.toString());
    } catch (_) {
      // Offline or mid-deployment: keep the current screen working.
    } finally {
      this.checking = false;
    }
  };

  render() { return null; }
}

export default withRouter(DeploymentRefresh);
