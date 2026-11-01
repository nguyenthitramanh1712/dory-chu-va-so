import { mkdirSync, copyFileSync, writeFileSync, readFileSync } from "node:fs";
mkdirSync("dist", { recursive: true });
for (const f of ["index.html", "manifest.webmanifest", "sw.js"]) copyFileSync(f, "dist/" + f);
const assets = JSON.parse(readFileSync("assets.b64.json", "utf8"));
for (const [name, b64] of Object.entries(assets)) writeFileSync("dist/" + name, Buffer.from(b64, "base64"));
console.log("dist ready:", Object.keys(assets).length, "icons");
