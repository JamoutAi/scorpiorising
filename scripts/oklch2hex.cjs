// Bulk-convert the oklch() literals we used to hex/rgba for max browser support.
const fs = require("fs");
const path = require("path");

const MAP = {
  "oklch(0.14 0.05 285)": "#1b1133",
  "oklch(0.11 0.065 278)": "#15102b",
  "oklch(0.10 0.07 285)": "#120b27",
  "oklch(0.10 0.07 280)": "#120b28",
  "oklch(0.10 0.07 278)": "#120b26",
  "oklch(0.09 0.05 285)": "#100a22",
  "oklch(0.08 0.07 285)": "#0e0a20",
  "oklch(0.16 0.065 280)": "#211435",
  "oklch(0.17 0.055 283)": "#231431",
  "oklch(0.18 0.055 282)": "#251636",
  "oklch(0.19 0.07 275)": "#281b3e",
  "oklch(0.20 0.065 278)": "#2b1c40",
  "oklch(0.22 0.065 278)": "#2f1e46",
  "oklch(0.28 0.07 288)": "#3b2448",
  "oklch(0.34 0.03 285)": "#4b3a5e",
  "oklch(0.38 0.03 285)": "#52425f",
  "oklch(0.40 0.03 285)": "#574463",
  "oklch(0.50 0.04 285)": "#6c5a79",
  "oklch(0.55 0.03 285)": "#766a83",
  "oklch(0.58 0.04 285)": "#7d7189",
  "oklch(0.60 0.03 285)": "#81768b",
  "oklch(0.64 0.04 285)": "#8b7f94",
  "oklch(0.65 0.03 285)": "#8c8295",
  "oklch(0.68 0.04 285)": "#958a9d",
  "oklch(0.68 0.09 288)": "#8f6f9c",
  "oklch(0.70 0.03 285)": "#94899c",
  "oklch(0.72 0.03 285)": "#988da0",
  "oklch(0.78 0.02 85)": "#cdc5b1",
  "oklch(0.80 0.02 85)": "#d0c9bc",
  "oklch(0.82 0.15 145)": "#2ed79f",
  "oklch(0.78 0.14 145)": "#1fc896",
  "oklch(0.84 0.16 145)": "#43e1ad",
  "oklch(0.78 0.12 75)": "#d9b264",
  "oklch(0.93 0.015 85)": "#ede8e0",
  "oklch(0.10 0.06 285)": "#120a26",
  "oklch(0.55 0.04 285)": "#766a83",
  "oklch(0.55 0.05 285)": "#776b84",
  "oklch(0.65 0.04 285)": "#8c8295",
  "oklch(14% 0.05 285)": "#211435",
};

// Normalize underscores (Tailwind arbitrary syntax) to spaces before mapping
function normalize(s) {
  return s.replace(/oklch\(([^)]*)\)/g, (m, inner) => {
    return `oklch(${inner.replace(/_/g, " ")})`;
  });
}

// white-with-alpha oklch(1 0 0 / X%) -> rgba(255,255,255,Y)
function replaceWhite(s) {
  return s.replace(/oklch\(1 0 0 \/\s*([\d.]+)%\)/g, (m, pct) => {
    const a = (parseFloat(pct) / 100).toFixed(3);
    return `rgba(255, 255, 255, ${a})`;
  });
}

// Alpha variants → rgba
function replaceAlpha(s) {
  // oklch(X Y Z / A) -> rgba based on nearest base
  return s.replace(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\/\s*([\d.]+)\)/g, (m, L, C, H, A) => {
    const hex = MAP[`oklch(${L} ${C} ${H})`] || "#2ed79f";
    // convert hex to rgb
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${A})`;
  });
}

const exts = [".tsx", ".ts", ".css"];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (f === "node_modules" || f === ".next" || f === ".git") continue;
      walk(p);
    } else if (exts.includes(path.extname(p))) {
      let src = fs.readFileSync(p, "utf8");
      if (src.includes("oklch")) {
        src = normalize(src);
        src = replaceWhite(src);
        src = replaceAlpha(src);
        for (const [k, v] of Object.entries(MAP)) {
          src = src.split(k).join(v);
        }
        fs.writeFileSync(p, src);
        console.log("converted", p);
      }
    }
  }
}
walk(path.resolve(__dirname, "..", "src"));
walk(path.resolve(__dirname, "..", "public"));
console.log("done");
