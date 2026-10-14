// Empreinte de l'arbre de travail : sha256 de tout ce qui diffère de HEAD
// (statut porcelain, diff complet, contenu réel des fichiers non suivis).
// Sert au marqueur de tour `.git/ihecs-turn-base` : si l'empreinte est
// identique en fin de tour, rien n'a été modifié → les contrôles de fin de
// tour (lint, types, tests) n'ont pas à rejouer sur un tour « parole seule ».
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export const turnBasePath = () => ".git/ihecs-turn-base";
export const planPendingPath = () => ".git/ihecs-plan-pending";
export const planAckPath = () => ".git/ihecs-plan-ack.log";

const git = (args) =>
  spawnSync("git", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

// "" hors dépôt git : les appelants désamorcent alors leurs contrôles.
const diffHash = () => {
  const status = git([
    "status",
    "--porcelain=v1",
    "-z",
    "--untracked-files=all",
  ]);
  if (status.status !== 0) return "";
  const h = createHash("sha256");
  h.update(status.stdout ?? "");
  h.update(String(git(["diff", "HEAD", "--binary"]).stdout ?? ""));
  // Les fichiers non suivis n'ont pas de diff : on hache leur contenu,
  // sinon réécrire un fichier untracked ne changerait pas l'empreinte.
  for (const rec of String(status.stdout).split("\0")) {
    if (!rec.startsWith("??")) continue;
    const p = rec.slice(3).split(" -> ").pop();
    try {
      h.update(readFileSync(p));
    } catch {
      // Fichier illisible ou dossier listé : le statut l'inclut déjà.
    }
  }
  return h.digest("hex");
};

// « HEAD:empreinte » : un commit OU une modification invalide le marqueur.
export const turnFingerprint = () => {
  const head = String(git(["rev-parse", "HEAD"]).stdout ?? "").trim();
  const d = diffHash();
  return head && d ? `${head}:${d}` : "";
};
