// Crée .env.local à partir de .env.example s'il n'existe pas encore.
// Ne l'écrase JAMAIS (il peut contenir les secrets de l'étudiant).
import { copyFileSync, existsSync } from "node:fs";

if (existsSync(".env.local")) {
  console.log("✓ .env.local existe déjà (non modifié).");
} else {
  copyFileSync(".env.example", ".env.local");
  console.log(
    "✓ .env.local créé depuis .env.example : complète-le avec tes valeurs.",
  );
}
