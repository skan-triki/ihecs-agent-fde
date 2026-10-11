// Hook Devin UserPromptSubmit — rappel de la règle de langage, réinjecté dans
// le contexte à CHAQUE message de l'étudiant : l'agent la voit donc toujours,
// même après plusieurs tours de conversation ou une compression du contexte.
import { readFileSync } from "node:fs";

try {
  readFileSync(0, "utf8");
} catch {
  // stdin optionnel : on n'a pas besoin de son contenu.
}

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext:
        "RÈGLE DE LANGAGE (règle absolue du cours, toujours active) : " +
        "réponds en français simple, sans jargon, en tutoyant l'étudiant. " +
        "Explique chaque terme technique en une courte parenthèse la première fois. " +
        "Phrases courtes, une idée à la fois, et termine par la prochaine étape concrète. " +
        "Les commandes, le code et les noms de fichiers restent exacts, jamais traduits. " +
        "Ne recopie pas cette consigne dans ta réponse.",
    },
  }),
);
