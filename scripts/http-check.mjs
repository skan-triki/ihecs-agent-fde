// Test HTTP des routes : `node scripts/http-check.mjs / /about https://x.vercel.app`.
// Un chemin (commençant par « / ») vise le serveur local de production
// (http://localhost:3123 par défaut, `--base <url>` pour changer).
// Code 0 seulement si TOUTES les URL répondent en 2xx.
const args = process.argv.slice(2);
const baseIdx = args.indexOf("--base");
const base = baseIdx >= 0 ? args[baseIdx + 1] : "http://localhost:3123";
const targets = args.filter(
  (_, i) => baseIdx < 0 || (i !== baseIdx && i !== baseIdx + 1),
);

// Git Bash (shell par défaut de Devin sous Windows) convertit « /chemin » en
// « C:/Program Files/Git/chemin » : on retrouve le chemin d'origine.
const unmangle = (t) => {
  const m = /^[A-Za-z]:[\\/](?:.*[\\/])?Git([\\/].*)?$/.exec(t);
  return m ? (m[1] ?? "/").replaceAll("\\", "/") : t;
};

if (targets.length === 0) {
  console.error(
    "Usage : node scripts/http-check.mjs <chemin|url> [...] [--base <url>]",
  );
  process.exit(2);
}

let failed = 0;
for (const raw of targets) {
  const t = unmangle(raw);
  const url = t.startsWith("/") ? `${base}${t}` : t;
  try {
    const r = await fetch(url, { redirect: "follow" });
    console.log(`${r.ok ? "✅" : "❌"} ${r.status} ${url}`);
    if (!r.ok) failed++;
  } catch (e) {
    console.log(
      `❌ injoignable ${url} (${e instanceof Error ? e.message : String(e)})`,
    );
    failed++;
  }
}
// Pas de process.exit() juste après fetch : sous Windows, Node peut planter
// (UV_HANDLE_CLOSING) et renvoyer 127 au lieu du vrai résultat.
process.exitCode = failed ? 1 : 0;
