"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  FolderOpen,
  GraduationCap,
  Keyboard,
  Loader,
  Minus,
  Moon,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Sun,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TriangleAlert,
} from "lucide-react";

/* ================================================================== */
/*  Constantes et utilitaires                                          */
/* ================================================================== */

const W = 440; // largeur d’une page (px)
const H = 600; // hauteur d’une page (px)
const NB_PAGES = 20; // 0 = couverture ... 19 = dos du livre
const DERNIERE = NB_PAGES - 1;

type Kind = "bad" | "good";
type IconType = ComponentType<{ className?: string }>;

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";
const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

function Reinit({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
    >
      <RotateCcw className="h-3 w-3" />
      Réinitialiser la démo
    </button>
  );
}

function Champ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm text-slate-700">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </label>
  );
}

/* ================================================================== */
/*  Démos : Règle 1 (contrôle explicite)                               */
/* ================================================================== */

const FICHIERS = ["Rapport_final.pdf", "Photos_vacances.zip", "Budget_2026.xlsx", "Notes_cours_IHM.docx"];

function Regle1Mauvaise() {
  const [items, setItems] = useState<string[]>(FICHIERS);
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">Passez simplement la souris sur un fichier…</p>
      <ul className="space-y-2">
        {items.map((f) => (
          <li
            key={f}
            onMouseEnter={() => setItems((p) => p.filter((x) => x !== f))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
          >
            {f}
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Tous les fichiers ont disparu sans aucune demande. Impossible de revenir en arrière.
        </p>
      )}
      <Reinit onClick={() => setItems(FICHIERS)} />
    </div>
  );
}

function Regle1Bonne() {
  const [items, setItems] = useState<string[]>(FICHIERS);
  const [cible, setCible] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">La suppression exige un clic, puis une confirmation.</p>
      <ul className="space-y-2">
        {items.map((f) => (
          <li
            key={f}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
          >
            {f}
            <button
              type="button"
              onClick={() => setCible(f)}
              className={`${base} bg-red-600 py-1 text-white hover:bg-red-700`}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">Liste vide.</p>}
      <Reinit onClick={() => setItems(FICHIERS)} />
      {cible !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Confirmer la suppression</h3>
            <p className="mt-2 text-sm text-slate-600">
              Voulez-vous vraiment supprimer « {cible} » ? Cette action est définitive.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCible(null)}
                className={`${base} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setItems((p) => p.filter((x) => x !== cible));
                  setCible(null);
                }}
                className={`${base} bg-red-600 text-white hover:bg-red-700`}
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Démos : Règle 2 (contexte)                                         */
/* ================================================================== */

type Donnees = { nom: string; email: string; ville: string; adresse: string; qte: number };
type ChampTexte = "nom" | "email" | "ville" | "adresse";
const VIDE: Donnees = { nom: "", email: "", ville: "", adresse: "", qte: 0 };
const ETAPES = ["Identité", "Livraison", "Panier"];

function Formulaire({ persiste }: { persiste: boolean }) {
  const [etape, setEtape] = useState(0);
  const [d, setD] = useState<Donnees>(VIDE);
  const [perdu, setPerdu] = useState(false);
  const rempli = d.nom !== "" || d.email !== "" || d.ville !== "" || d.adresse !== "" || d.qte > 0;

  const maj = (k: ChampTexte, v: string) => {
    setPerdu(false);
    setD((p) => ({ ...p, [k]: v }));
  };
  const effacerSiBesoin = () => {
    if (!persiste) {
      if (rempli) setPerdu(true);
      setD(VIDE);
    }
  };
  const aller = (n: number) => {
    effacerSiBesoin();
    setEtape(n);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          {ETAPES.map((nom, i) => (
            <button
              key={nom}
              type="button"
              onClick={() => aller(i)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                i === etape ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {i + 1}. {nom}
            </button>
          ))}
        </div>
        {persiste && rempli && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
            <Check className="h-3 w-3" />
            Auto-sauvegardé
          </span>
        )}
      </div>

      {etape === 0 && (
        <div className="space-y-3">
          <Champ label="Nom complet" value={d.nom} onChange={(v) => maj("nom", v)} />
          <Champ label="Adresse e-mail" value={d.email} onChange={(v) => maj("email", v)} />
        </div>
      )}
      {etape === 1 && (
        <div className="space-y-3">
          <Champ label="Ville" value={d.ville} onChange={(v) => maj("ville", v)} />
          <Champ label="Adresse" value={d.adresse} onChange={(v) => maj("adresse", v)} />
        </div>
      )}
      {etape === 2 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800">
            <span>Livre « IHM »</span>
            <span className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Retirer un exemplaire"
                onClick={() => setD((p) => ({ ...p, qte: Math.max(0, p.qte - 1) }))}
                className="rounded border border-slate-300 p-1 hover:bg-slate-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              <strong className="w-5 text-center">{d.qte}</strong>
              <button
                type="button"
                aria-label="Ajouter un exemplaire"
                onClick={() => setD((p) => ({ ...p, qte: p.qte + 1 }))}
                className="rounded border border-slate-300 p-1 hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </span>
          </div>
          <p className="rounded-lg bg-white p-3 text-xs text-slate-600">
            Récapitulatif : {d.nom || "—"} · {d.email || "—"} · {d.ville || "—"} · {d.adresse || "—"}
          </p>
        </div>
      )}

      {perdu && (
        <p className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          Vos données ont été effacées. Il faut tout ressaisir.
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={etape === 0}
          onClick={() => aller(etape - 1)}
          className={`${base} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40`}
        >
          Précédent
        </button>
        <button
          type="button"
          onClick={effacerSiBesoin}
          className="text-xs text-slate-500 underline hover:text-slate-800"
        >
          Actualiser (simulation)
        </button>
        <button
          type="button"
          disabled={etape === ETAPES.length - 1}
          onClick={() => aller(etape + 1)}
          className={`${base} bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40`}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

function Regle2Mauvaise() {
  return <Formulaire persiste={false} />;
}
function Regle2Bonne() {
  return <Formulaire persiste />;
}

/* ================================================================== */
/*  Démos : Règle 3 (rétroaction)                                      */
/* ================================================================== */

function Regle3Mauvaise() {
  const [clics, setClics] = useState(0);
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Cliquez sur « Envoyer ». Le message est-il parti ? Impossible à savoir…</p>
      <button
        type="button"
        onClick={() => setClics((c) => c + 1)}
        className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 outline-none"
      >
        Valider / Envoyer
      </button>
      <p className="text-sm text-slate-700">
        Clics frustrés : <strong className="text-red-600">{clics}</strong>
      </p>
      {clics >= 5 && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          L’utilisateur martèle le bouton : aucune réaction visible, aucune confirmation.
        </p>
      )}
      <Reinit onClick={() => setClics(0)} />
    </div>
  );
}

function Regle3Bonne() {
  const [etat, setEtat] = useState<"repos" | "chargement">("repos");
  const [toast, setToast] = useState(false);

  const envoyer = () => {
    if (etat === "chargement") return;
    setToast(false);
    setEtat("chargement");
    window.setTimeout(() => {
      setEtat("repos");
      setToast(true);
      window.setTimeout(() => setToast(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Survolez, cliquez : le bouton réagit à chaque étape.</p>
      <button
        type="button"
        onClick={envoyer}
        disabled={etat === "chargement"}
        className={`${base} bg-indigo-600 px-4 text-white shadow hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md active:translate-y-0 active:scale-95 disabled:cursor-wait disabled:opacity-80`}
      >
        {etat === "chargement" ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            Envoi en cours…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Valider / Envoyer
          </>
        )}
      </button>
      <div aria-live="polite" className="min-h-[3rem]">
        {toast && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-600 p-3 text-sm font-medium text-white shadow-lg">
            <CircleCheck className="h-5 w-5" />
            Message envoyé avec succès !
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Démos : Règle 4 (cohérence)                                        */
/* ================================================================== */

function Carte({ titre, texte, children }: { titre: string; texte: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-900">{titre}</h4>
      <p className="mt-1 text-xs text-slate-600">{texte}</p>
      <div className="mt-3 flex items-center gap-2">{children}</div>
    </div>
  );
}

function Regle4Mauvaise() {
  return (
    <div className="space-y-3">
      <Carte titre="Profil utilisateur" texte="Modifier ou retirer ce profil.">
        <button type="button" className={`${base} bg-blue-600 text-white`}>
          <Save className="h-4 w-4" />
          Supprimer
        </button>
        <button type="button" className={`${base} ml-auto bg-red-600 text-white`}>
          <CircleX className="h-4 w-4" />
          Valider
        </button>
      </Carte>
      <Carte titre="Commande n°1042" texte="Confirmer ou annuler cette commande.">
        <button type="button" className="ml-auto rounded-full bg-amber-500 px-5 py-1 text-xs font-bold text-white">
          Supprimer ✓
        </button>
        <button type="button" className="rounded-none border-2 border-slate-400 px-2 py-3 text-xs text-slate-700">
          Valider
        </button>
      </Carte>
    </div>
  );
}

function Regle4Bonne() {
  return (
    <div className="space-y-3">
      {[
        { titre: "Profil utilisateur", texte: "Modifier ou retirer ce profil." },
        { titre: "Commande n°1042", texte: "Confirmer ou annuler cette commande." },
      ].map((c) => (
        <Carte key={c.titre} titre={c.titre} texte={c.texte}>
          <button type="button" className={`${base} bg-red-600 text-white hover:bg-red-700`}>
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>
          <button type="button" className={`${base} ml-auto bg-emerald-600 text-white hover:bg-emerald-700`}>
            <Check className="h-4 w-4" />
            Valider
          </button>
        </Carte>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Démos : Règle 5 (souplesse)                                        */
/* ================================================================== */

function Regle5Mauvaise() {
  const [niveau, setNiveau] = useState(0);
  const [taches, setTaches] = useState<string[]>([]);
  const [clics, setClics] = useState(0);

  const clic = (fn: () => void) => {
    setClics((c) => c + 1);
    fn();
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">Ajouter une tâche : Fichier, puis Tâches, puis Nouvelle tâche. Aucun raccourci.</p>
      <div className="flex items-start gap-1 text-sm">
        <div className="relative">
          <button
            type="button"
            onClick={() => clic(() => setNiveau(niveau === 0 ? 1 : 0))}
            className="rounded border border-slate-300 bg-slate-100 px-3 py-1 text-slate-800"
          >
            Fichier ▾
          </button>
          {niveau >= 1 && (
            <div className="absolute left-0 top-full z-10 mt-1 w-32 rounded border border-slate-300 bg-white shadow">
              <button
                type="button"
                onClick={() => clic(() => setNiveau(2))}
                className="block w-full px-3 py-1 text-left text-slate-800 hover:bg-slate-100"
              >
                Tâches ▸
              </button>
              <div className="block px-3 py-1 text-slate-400">Options</div>
            </div>
          )}
        </div>
        {niveau === 2 && (
          <div className="mt-8 w-40 rounded border border-slate-300 bg-white shadow">
            <button
              type="button"
              onClick={() =>
                clic(() => {
                  setTaches((p) => [...p, `Tâche ${p.length + 1}`]);
                  setNiveau(0);
                })
              }
              className="block w-full px-3 py-1 text-left text-slate-800 hover:bg-slate-100"
            >
              Nouvelle tâche
            </button>
            <button
              type="button"
              onClick={() =>
                clic(() => {
                  setTaches([]);
                  setNiveau(0);
                })
              }
              className="block w-full px-3 py-1 text-left text-slate-800 hover:bg-slate-100"
            >
              Tout effacer
            </button>
          </div>
        )}
      </div>
      <ul className="min-h-[5rem] space-y-1 rounded-lg border border-dashed border-slate-300 bg-white p-2 text-sm text-slate-800">
        {taches.length === 0 && <li className="text-slate-400">Aucune tâche</li>}
        {taches.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <p className="text-xs text-slate-500">Clics effectués : {clics}</p>
    </div>
  );
}

const TAILLES = ["text-xs", "text-sm", "text-base", "text-lg"];

function Regle5Bonne() {
  const [taches, setTaches] = useState<string[]>(["Préparer l’exposé"]);
  const [texte, setTexte] = useState("");
  const [sombre, setSombre] = useState(false);
  const [taille, setTaille] = useState(1);
  const [champ, setChamp] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    if (champ === null) return;
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        champ.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [champ]);

  const ajouter = () => {
    const t = texte.trim();
    if (t === "") return;
    setTaches((p) => [...p, t]);
    setTexte("");
  };

  return (
    <div
      className={`space-y-3 rounded-xl p-3 ${TAILLES[taille]} ${
        sombre ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setSombre((s) => !s)} className={`${base} border border-slate-400 py-1`}>
          {sombre ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {sombre ? "Mode clair" : "Mode sombre"}
        </button>
        <button
          type="button"
          onClick={() => setTaille((t) => Math.max(0, t - 1))}
          className={`${base} border border-slate-400 py-1`}
        >
          A−
        </button>
        <button
          type="button"
          onClick={() => setTaille((t) => Math.min(TAILLES.length - 1, t + 1))}
          className={`${base} border border-slate-400 py-1`}
        >
          A+
        </button>
      </div>
      <div className="flex gap-2">
        <input
          ref={setChamp}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ajouter();
            if (e.key === "Escape") setTexte("");
          }}
          placeholder="Nouvelle tâche…"
          className={`${inputCls} ${sombre ? "!border-slate-600 !bg-slate-800 !text-slate-100" : ""}`}
        />
        <button type="button" onClick={ajouter} className={`${base} bg-indigo-600 text-white hover:bg-indigo-700`}>
          Ajouter
        </button>
      </div>
      <ul className="min-h-[4rem] space-y-1">
        {taches.map((t, i) => (
          <li key={`${t}-${i}`} className="flex items-center justify-between rounded bg-black/5 px-2 py-1">
            {t}
            <button
              type="button"
              aria-label={`Supprimer ${t}`}
              onClick={() => setTaches((p) => p.filter((_, j) => j !== i))}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <p className="flex flex-wrap items-center gap-2 text-xs opacity-80">
        <Keyboard className="h-4 w-4" />
        <kbd className="rounded border border-slate-400 px-1">Ctrl+K</kbd> saisir
        <kbd className="rounded border border-slate-400 px-1">Entrée</kbd> ajouter
        <kbd className="rounded border border-slate-400 px-1">Échap</kbd> effacer
      </p>
    </div>
  );
}

/* ================================================================== */
/*  Démos : Règle 6 (prévention des erreurs)                           */
/* ================================================================== */

function Regle6Mauvaise() {
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [mdp, setMdp] = useState("");
  const [resultat, setResultat] = useState<"aucun" | "erreur" | "ok">("aucun");

  const envoyer = () => {
    const valide = email.includes("@") && /^\d{2}\/\d{2}\/\d{4}$/.test(date) && mdp.length >= 8;
    setResultat(valide ? "ok" : "erreur");
  };

  return (
    <div className="space-y-3">
      <Champ label="E-mail" value={email} onChange={setEmail} />
      <Champ label="Date de réservation" value={date} onChange={setDate} />
      <Champ label="Mot de passe" value={mdp} onChange={setMdp} />
      <button type="button" onClick={envoyer} className={`${base} bg-indigo-600 text-white hover:bg-indigo-700`}>
        Réserver
      </button>
      {resultat === "erreur" && (
        <p className="rounded-lg bg-red-50 p-3 font-mono text-sm text-red-700">Error 400: Invalid Input</p>
      )}
      {resultat === "ok" && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Réservation enregistrée.</p>
      )}
    </div>
  );
}

function Regle6Bonne() {
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [mdp, setMdp] = useState("");
  const [fait, setFait] = useState(false);
  const aujourdhui = new Date().toISOString().slice(0, 10);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const criteres = [
    { ok: mdp.length >= 8, texte: "8 caractères minimum" },
    { ok: /[A-Z]/.test(mdp), texte: "Une majuscule" },
    { ok: /\d/.test(mdp), texte: "Un chiffre" },
    { ok: /[^A-Za-z0-9]/.test(mdp), texte: "Un caractère spécial" },
  ];
  const score = criteres.filter((c) => c.ok).length;
  const dateOk = date !== "" && date >= aujourdhui;
  const valide = emailOk && dateOk && score >= 3;
  const niveaux = ["Très faible", "Faible", "Moyen", "Bon", "Excellent"];
  const couleurs = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-lime-500", "bg-emerald-600"];

  return (
    <div className="space-y-3">
      <div>
        <Champ
          label="E-mail"
          value={email}
          onChange={(v) => {
            setFait(false);
            setEmail(v);
          }}
          placeholder="nom@exemple.dz"
        />
        {email !== "" && (
          <p className={`mt-1 text-xs ${emailOk ? "text-emerald-600" : "text-red-600"}`}>
            {emailOk ? "Format valide" : "Format attendu : nom@domaine.dz"}
          </p>
        )}
      </div>
      <label className="block text-sm text-slate-700">
        <span className="mb-1 block font-medium">Date de réservation</span>
        <input
          type="date"
          min={aujourdhui}
          value={date}
          suppressHydrationWarning
          onChange={(e) => {
            setFait(false);
            setDate(e.target.value);
          }}
          className={inputCls}
        />
      </label>
      <div>
        <Champ
          label="Mot de passe"
          type="password"
          value={mdp}
          onChange={(v) => {
            setFait(false);
            setMdp(v);
          }}
        />
        <div className="mt-2 h-2 overflow-hidden rounded bg-slate-200">
          <div className={`h-full transition-all ${couleurs[score]}`} style={{ width: `${(score / 4) * 100}%` }} />
        </div>
        <p className="mt-1 text-xs text-slate-600">Robustesse : {niveaux[score]}</p>
        <ul className="mt-1 grid grid-cols-2 gap-1 text-xs">
          {criteres.map((c) => (
            <li key={c.texte} className={`flex items-center gap-1 ${c.ok ? "text-emerald-600" : "text-slate-500"}`}>
              {c.ok ? <CircleCheck className="h-3 w-3" /> : <CircleX className="h-3 w-3" />}
              {c.texte}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        disabled={!valide}
        onClick={() => setFait(true)}
        className={`${base} bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300`}
      >
        Réserver
      </button>
      {!valide && <p className="text-xs text-slate-500">Le bouton s’active quand tous les champs sont valides.</p>}
      {fait && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Réservation enregistrée.</p>}
    </div>
  );
}

/* ================================================================== */
/*  Démos : Règle 7 (métaphore)                                        */
/* ================================================================== */

const ACTIONS_OBSCURES = ["EXEC_01", "RM -RF", "0xA3F", "◢⬡◣"];

const ACTIONS_CLAIRES: { label: string; Icon: IconType; msg: string }[] = [
  { label: "Corbeille", Icon: Trash2, msg: "Le fichier a été déplacé dans la corbeille." },
  { label: "Dossier", Icon: FolderOpen, msg: "Le dossier est ouvert." },
  { label: "Sauvegarder", Icon: Save, msg: "Votre travail est sauvegardé." },
  { label: "Rechercher", Icon: Search, msg: "Saisissez un mot pour lancer la recherche." },
];

function Regle7Mauvaise() {
  const [dernier, setDernier] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">Quelle commande sauvegarde ? Laquelle supprime ?</p>
      <div className="flex flex-wrap gap-2">
        {ACTIONS_OBSCURES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setDernier(code)}
            className="rounded border border-slate-500 bg-slate-800 px-3 py-2 font-mono text-xs text-green-400 hover:bg-slate-700"
          >
            {code}
          </button>
        ))}
      </div>
      <p className="rounded-lg bg-white p-3 font-mono text-xs text-slate-700">
        {dernier === null ? "Aucune action." : `${dernier} → résultat : ???`}
      </p>
    </div>
  );
}

function Regle7Bonne() {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">Chaque icône évoque un objet du monde réel.</p>
      <div className="flex flex-wrap gap-2">
        {ACTIONS_CLAIRES.map(({ label, Icon, msg: m }) => (
          <button
            key={label}
            type="button"
            onClick={() => setMsg(m)}
            className="flex w-[4.9rem] flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white px-1 py-3 text-xs text-slate-700 hover:border-indigo-400 hover:bg-indigo-50"
          >
            <Icon className="h-6 w-6 text-indigo-600" />
            {label}
          </button>
        ))}
      </div>
      <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">{msg ?? "Aucune action."}</p>
    </div>
  );
}

/* ================================================================== */
/*  Données des règles                                                 */
/* ================================================================== */

type Regle = {
  id: number;
  titre: string;
  court: string;
  definition: string;
  probleme: string;
  solution: string;
  Mauvaise: ComponentType;
  Bonne: ComponentType;
};

const REGLES: Regle[] = [
  {
    id: 1,
    titre: "Le contrôle explicite",
    court: "Contrôle explicite",
    definition:
      "Le système n’exécute une action que si l’utilisateur la demande clairement. L’utilisateur garde l’initiative du dialogue et peut toujours revenir en arrière.",
    probleme: "Un simple survol de la souris supprime un fichier : aucune demande, aucune confirmation, aucun retour possible.",
    solution: "Un bouton « Supprimer » explicite, suivi d’une fenêtre de confirmation avant toute action critique.",
    Mauvaise: Regle1Mauvaise,
    Bonne: Regle1Bonne,
  },
  {
    id: 2,
    titre: "Le contexte",
    court: "Contexte",
    definition:
      "Le système tient compte de l’état de la tâche en cours et conserve les données saisies, d’une étape à l’autre.",
    probleme: "Passer à l’étape suivante ou actualiser la page efface tout le formulaire : il faut tout ressaisir.",
    solution: "Les données sont conservées automatiquement, et un badge « Auto-sauvegardé » rassure l’utilisateur.",
    Mauvaise: Regle2Mauvaise,
    Bonne: Regle2Bonne,
  },
  {
    id: 3,
    titre: "La rétroaction (feedback)",
    court: "Rétroaction",
    definition:
      "Chaque action de l’utilisateur reçoit une réponse visible et immédiate : survol, clic, chargement, succès ou échec.",
    probleme: "Le bouton ne réagit pas : l’utilisateur doute, clique plusieurs fois et finit par se frustrer.",
    solution: "Effet au survol et au clic, indicateur de chargement, puis notification verte de succès.",
    Mauvaise: Regle3Mauvaise,
    Bonne: Regle3Bonne,
  },
  {
    id: 4,
    titre: "La cohérence",
    court: "Cohérence",
    definition:
      "Les mêmes éléments ont le même aspect, la même place et le même comportement dans toute l’application.",
    probleme: "Couleurs, icônes et positions des boutons changent d’une carte à l’autre : on ne sait plus où cliquer.",
    solution: "Un système de design unique : « Supprimer » en rouge avec une corbeille à gauche, « Valider » en vert à droite.",
    Mauvaise: Regle4Mauvaise,
    Bonne: Regle4Bonne,
  },
  {
    id: 5,
    titre: "La souplesse (flexibilité)",
    court: "Souplesse",
    definition:
      "L’interface s’adapte au niveau de l’utilisateur : accès simple pour les débutants, raccourcis rapides pour les experts, réglages personnalisables.",
    probleme: "Tout passe par des menus imbriqués à la souris : lent, répétitif, sans raccourci ni réglage.",
    solution: "Boutons visibles et raccourcis clavier (Ctrl+K, Entrée, Échap), thème clair ou sombre, taille du texte.",
    Mauvaise: Regle5Mauvaise,
    Bonne: Regle5Bonne,
  },
  {
    id: 6,
    titre: "L’anticipation (prévention des erreurs)",
    court: "Prévention des erreurs",
    definition: "Le système prévient l’erreur avant qu’elle ne survienne, plutôt que de la signaler après coup.",
    probleme: "Champs libres, date tapée à la main et message cryptique « Error 400 » après l’envoi.",
    solution: "Validation en temps réel, bouton désactivé tant que le formulaire est invalide, sélecteur de date, jauge de mot de passe.",
    Mauvaise: Regle6Mauvaise,
    Bonne: Regle6Bonne,
  },
  {
    id: 7,
    titre: "La métaphore",
    court: "Métaphore",
    definition: "L’interface s’appuie sur des analogies avec le monde réel que l’utilisateur connaît déjà.",
    probleme: "Commandes techniques (EXEC_01, RM -RF) et symboles abstraits dont personne ne devine le sens.",
    solution: "Corbeille, dossier, disquette, loupe : le sens est compris au premier regard.",
    Mauvaise: Regle7Mauvaise,
    Bonne: Regle7Bonne,
  },
];

/* ================================================================== */
/*  Pages du livre                                                     */
/* ================================================================== */

function Feuille({ num, children }: { num: number; children: ReactNode }) {
  const gauche = num % 2 === 1;
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fbfcfe] text-slate-800">
      <div
        className={`pointer-events-none absolute inset-y-0 w-10 from-slate-900/10 to-transparent ${
          gauche ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"
        }`}
      />
      <div className="relative flex h-full flex-col px-7 pb-10 pt-7">{children}</div>
      <span className="pointer-events-none absolute bottom-3 left-0 right-0 text-center font-serif text-[11px] text-slate-400">
        {num}
      </span>
    </div>
  );
}

function Couverture({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-gradient-to-br from-[#0b1b3a] via-[#143270] to-[#0b1b3a] p-8 text-center text-white">
      <div className="pointer-events-none absolute inset-3 rounded-md border border-amber-300/40" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/40 to-transparent" />
      <div className="relative mt-3 flex flex-col items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/60 bg-white/5">
          <GraduationCap className="h-7 w-7 text-amber-300" />
        </span>
        <p className="font-serif text-lg font-semibold leading-snug">Université Chadli Bendjedid</p>
        <p className="font-serif text-base text-blue-100">El Tarf</p>
      </div>
      <div className="relative space-y-3">
        <p className="text-sm text-blue-200">Module : Interaction Homme-Machine (IHM)</p>
        <h2 className="font-serif text-[2rem] font-bold leading-tight">
          Les 7 Règles
          <br />
          de Joëlle Coutaz
        </h2>
        <div className="flex justify-center gap-1.5">
          {REGLES.map((r) => (
            <span key={r.id} className="h-1.5 w-1.5 rounded-full bg-amber-300" />
          ))}
        </div>
        <p className="text-xs text-blue-200">Sujet : Les 7 Règles de Joëlle Coutaz</p>
      </div>
      <div className="relative mb-2 space-y-2 text-sm">
        <p className="text-blue-200">Réalisé par :</p>
        <p className="font-serif text-base font-semibold">Ghersallah Chahinez &amp; Laouami Tasnim</p>
        <p className="text-xs text-blue-200">Niveau : Licence 3 Informatique (Groupe 3) | Année : 2026/2027</p>
        <button
          type="button"
          onClick={onOpen}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-[#0b1b3a] transition hover:bg-amber-200"
        >
          <BookOpen className="h-4 w-4" />
          Ouvrir le livre
        </button>
      </div>
    </div>
  );
}

function Sommaire({ go }: { go: (p: number) => void }) {
  const lignes: { label: string; page: number }[] = [
    { label: "Introduction", page: 2 },
    ...REGLES.map((r) => ({ label: `Règle ${r.id} : ${r.court}`, page: 2 * r.id + 1 })),
    { label: "Conclusion", page: 17 },
  ];
  return (
    <>
      <h2 className="font-serif text-2xl font-bold text-slate-900">Sommaire</h2>
      <p className="mt-1 text-[13px] text-slate-500">Cliquez sur une ligne pour aller directement à la page.</p>
      <ul className="mt-5 space-y-1">
        {lignes.map((l) => (
          <li key={l.label}>
            <button
              type="button"
              onClick={() => go(l.page)}
              className="flex w-full items-baseline gap-2 rounded-md px-2 py-2 text-left text-[14px] text-slate-800 transition hover:bg-indigo-50"
            >
              <span>{l.label}</span>
              <span className="flex-1 border-b border-dotted border-slate-300" />
              <span className="font-serif text-slate-500">{l.page}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function Introduction() {
  const atouts = [
    { titre: "Efficacité", texte: "Les tâches se font plus vite, avec moins d’efforts." },
    { titre: "Fiabilité", texte: "Moins d’erreurs, et des erreurs plus faciles à corriger." },
    { titre: "Satisfaction", texte: "Une interface comprise sans mode d’emploi donne confiance." },
  ];
  return (
    <>
      <h2 className="font-serif text-2xl font-bold text-slate-900">Introduction</h2>
      <p className="mt-3 text-[13px] leading-relaxed text-slate-700">
        Une interface n’est pas un simple écran : c’est le lieu où l’humain et la machine se rencontrent.
        Joëlle Coutaz, chercheuse française de référence en Interaction Homme-Machine, propose{" "}
        <strong>sept règles</strong> qui guident la conception d’interfaces utilisables, compréhensibles et agréables.
      </p>
      <p className="mt-3 text-[13px] leading-relaxed text-slate-700">
        Ces règles ont un point commun : <strong>placer l’humain au centre de la conception</strong>. Ce n’est pas à
        l’utilisateur de s’adapter au système, c’est au système de s’adapter à ses besoins, à ses gestes et à ses
        erreurs.
      </p>
      <h3 className="mt-5 font-serif text-base font-semibold text-slate-900">Pourquoi l’humain au centre ?</h3>
      <ul className="mt-2 space-y-2">
        {atouts.map((a) => (
          <li key={a.titre} className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-[13px]">
            <strong className="text-indigo-900">{a.titre}.</strong>{" "}
            <span className="text-slate-700">{a.texte}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function PageRegle({ regle }: { regle: Regle }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="font-serif text-5xl font-bold leading-none text-indigo-700">{regle.id}</span>
        <div>
          <p className="text-xs text-slate-500">Règle {regle.id} sur 7</p>
          <h2 className="font-serif text-xl font-bold leading-tight text-slate-900">{regle.titre}</h2>
        </div>
      </div>
      <div className="mt-4 space-y-3 text-[13px] leading-relaxed">
        <section className="rounded-lg border-l-4 border-indigo-600 bg-indigo-50/60 p-3">
          <h3 className="font-semibold text-indigo-900">La règle (définition)</h3>
          <p className="mt-1 text-slate-700">{regle.definition}</p>
        </section>
        <section className="rounded-lg border-l-4 border-red-500 bg-red-50/70 p-3">
          <h3 className="flex items-center gap-1 font-semibold text-red-800">
            <ThumbsDown className="h-3.5 w-3.5" />
            Le problème (mauvaise IHM)
          </h3>
          <p className="mt-1 text-slate-700">{regle.probleme}</p>
        </section>
        <section className="rounded-lg border-l-4 border-emerald-600 bg-emerald-50/70 p-3">
          <h3 className="flex items-center gap-1 font-semibold text-emerald-800">
            <ThumbsUp className="h-3.5 w-3.5" />
            La solution (bonne IHM)
          </h3>
          <p className="mt-1 text-slate-700">{regle.solution}</p>
        </section>
      </div>
    </>
  );
}

function PageDemo({ regle }: { regle: Regle }) {
  const [vue, setVue] = useState<Kind>("bad");
  const { Mauvaise, Bonne } = regle;
  const mauvaise = vue === "bad";
  return (
    <>
      <h2 className="font-serif text-xl font-bold text-slate-900">Essayez-la vous-même</h2>
      <p className="mt-1 text-[13px] text-slate-500">Règle {regle.id} : {regle.court}</p>
      <div role="group" aria-label="Choisir la version" className="mt-3 flex rounded-lg bg-slate-100 p-1 text-sm">
        <button
          type="button"
          onClick={() => setVue("bad")}
          aria-pressed={mauvaise}
          className={`flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 font-medium transition ${
            mauvaise ? "bg-red-600 text-white shadow" : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <ThumbsDown className="h-4 w-4" />
          Mauvaise IHM
        </button>
        <button
          type="button"
          onClick={() => setVue("good")}
          aria-pressed={!mauvaise}
          className={`flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 font-medium transition ${
            !mauvaise ? "bg-emerald-600 text-white shadow" : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
          Bonne IHM
        </button>
      </div>
      <div
        className={`mt-3 flex-1 overflow-y-auto rounded-xl border p-3 ${
          mauvaise ? "border-red-200 bg-red-50/50" : "border-emerald-200 bg-emerald-50/50"
        }`}
      >
        {mauvaise ? <Mauvaise /> : <Bonne />}
      </div>
    </>
  );
}

function Conclusion() {
  const resume = [
    "Garder la main sur les actions",
    "Conserver le contexte de la tâche",
    "Répondre à chaque geste",
    "Rester cohérent partout",
    "S’adapter aux novices et aux experts",
    "Prévenir l’erreur avant qu’elle arrive",
    "Parler le langage du monde réel",
  ];
  return (
    <>
      <h2 className="font-serif text-2xl font-bold text-slate-900">Conclusion</h2>
      <p className="mt-3 text-[13px] leading-relaxed text-slate-700">
        Les sept règles de Joëlle Coutaz ne sont pas des contraintes techniques : ce sont des engagements envers
        l’utilisateur. Appliquées ensemble, elles transforment une application qui « fonctionne » en application qui
        « se comprend ».
      </p>
      <ol className="mt-3 space-y-1.5">
        {resume.map((t, i) => (
          <li key={t} className="flex items-center gap-2 text-[13px] text-slate-700">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-700 text-[11px] font-bold text-white">
              {i + 1}
            </span>
            {t}
          </li>
        ))}
      </ol>
      <p className="mt-4 rounded-lg bg-indigo-50 p-3 font-serif text-[14px] italic leading-relaxed text-indigo-900">
        Concevoir une bonne IHM, c’est d’abord comprendre l’humain avant de coder la machine.
      </p>
    </>
  );
}

function Merci() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
        <CircleCheck className="h-7 w-7 text-indigo-700" />
      </span>
      <h2 className="mt-5 font-serif text-3xl font-bold text-slate-900">Merci de votre attention</h2>
      <p className="mt-2 text-[14px] text-slate-600">Place à vos questions.</p>
      <div className="mt-8 space-y-1 text-[13px] text-slate-700">
        <p className="font-serif text-base font-semibold">Ghersallah Chahinez &amp; Laouami Tasnim</p>
        <p>Licence 3 Informatique (Groupe 3) · 2026/2027</p>
        <p>Université Chadli Bendjedid, El Tarf</p>
      </div>
    </div>
  );
}

function DosDuLivre() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-bl from-[#0b1b3a] via-[#143270] to-[#0b1b3a] text-center text-white p-6">
      <div className="pointer-events-none absolute inset-3 rounded-md border border-amber-300/40" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/40 to-transparent" />
      
      {/* 1. أيقونة القبعة */}
      <GraduationCap className="h-8 w-8 text-amber-300" />

      {/* 2. صورة الـ QR Code تحت القبعة مباشرة */}
      <div className="bg-white p-2 rounded-xl shadow-lg border border-amber-300/40 my-1">
        {/* حطي صورة الـ QR Code في مجلد public باسم qrcode.png أو حطي الرابط المباشر لها */}
        <img 
          src="/qrcode.png" 
          alt="QR Code NotebookLM" 
          className="w-24 h-24 object-contain rounded-lg"
        />
      </div>
      <p className="text-[11px] text-amber-200/90 font-medium">Scannez pour écouter la présentation audio</p>

      {/* 3. الكتابة الخاصة بالجامعة والمقياس */}
      <div className="space-y-1 mt-1">
        <p className="font-serif text-base font-semibold">Interaction Homme-Machine</p>
        <p className="text-xs text-blue-200">Université Chadli Bendjedid · El Tarf · 2026/2027</p>
      </div>
    </div>
  );
}
function construirePages(go: (p: number) => void): ReactNode[] {
  const pages: ReactNode[] = [];
  pages.push(<Couverture onOpen={() => go(1)} />);
  pages.push(
    <Feuille num={1}>
      <Sommaire go={go} />
    </Feuille>,
  );
  pages.push(
    <Feuille num={2}>
      <Introduction />
    </Feuille>,
  );
  REGLES.forEach((r) => {
    pages.push(
      <Feuille num={2 * r.id + 1}>
        <PageRegle regle={r} />
      </Feuille>,
    );
    pages.push(
      <Feuille num={2 * r.id + 2}>
        <PageDemo regle={r} />
      </Feuille>,
    );
  });
  pages.push(
    <Feuille num={17}>
      <Conclusion />
    </Feuille>,
  );
  pages.push(
    <Feuille num={18}>
      <Merci />
    </Feuille>,
  );
  pages.push(<DosDuLivre />);
  return pages;
}

/* ================================================================== */
/*  Mécanique du livre 3D                                              */
/* ================================================================== */

function Feuillet({
  index,
  total,
  retourne,
  spread,
  front,
  back,
}: {
  index: number;
  total: number;
  retourne: boolean;
  spread: boolean;
  front: ReactNode;
  back: ReactNode | null;
}) {
  const feuillet: CSSProperties = {
    position: "absolute",
    top: 0,
    left: spread ? W : 0,
    width: W,
    height: H,
    transformOrigin: "left center",
    transformStyle: "preserve-3d",
    transform: `rotateY(${retourne ? -180 : 0}deg)`,
    transition: "transform 0.9s cubic-bezier(0.45, 0.05, 0.25, 1), z-index 0s linear 0.45s",
    zIndex: retourne ? index : total - index,
  };
  const face: CSSProperties = {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };
  return (
    <div style={feuillet}>
      <div style={face} className="overflow-hidden rounded-r-lg shadow-xl">
        {front}
      </div>
      {back !== null && (
        <div style={{ ...face, transform: "rotateY(180deg)" }} className="overflow-hidden rounded-l-lg shadow-xl">
          {back}
        </div>
      )}
    </div>
  );
}

function abonnerFenetre(rappel: () => void) {
  window.addEventListener("resize", rappel);
  return () => window.removeEventListener("resize", rappel);
}
const lireFenetre = () => `${window.innerWidth}x${window.innerHeight}`;
const lireFenetreServeur = () => "1280x800";

export default function Page() {
  const [p, setP] = useState(0);
  const vue = useSyncExternalStore(abonnerFenetre, lireFenetre, lireFenetreServeur);
  const [vw, vh] = vue.split("x").map(Number);
  const spread = vw >= 900;

  const go = useCallback((page: number) => setP(Math.max(0, Math.min(DERNIERE, page))), []);
  const suivant = useCallback(
    () =>
      setP((cur) =>
        spread ? Math.min(DERNIERE, 2 * Math.ceil(cur / 2) + 2) : Math.min(DERNIERE, cur + 1),
      ),
    [spread],
  );
  const precedent = useCallback(
    () => setP((cur) => (spread ? Math.max(0, 2 * (Math.ceil(cur / 2) - 1)) : Math.max(0, cur - 1))),
    [spread],
  );

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const cible = e.target as HTMLElement | null;
      if (cible && ["INPUT", "TEXTAREA", "SELECT"].includes(cible.tagName)) return;
      if (e.key === "ArrowRight") suivant();
      if (e.key === "ArrowLeft") precedent();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [suivant, precedent]);

  const pages = construirePages(go);
  const nbFeuillets = spread ? NB_PAGES / 2 : NB_PAGES;
  const retournes = spread ? Math.ceil(p / 2) : p;
  const largeurLivre = spread ? 2 * W : W;
  const echelle = Math.max(0.3, Math.min(1, (vw - 32) / largeurLivre, (vh - 170) / H));
  const decalage = spread ? (retournes === 0 ? -W / 2 : retournes === nbFeuillets ? W / 2 : 0) : 0;

  let etiquette: string;
  if (spread) {
    if (retournes === 0) etiquette = "Couverture";
    else if (retournes === nbFeuillets) etiquette = "Fin du livre";
    else etiquette = `Pages ${2 * retournes - 1}–${2 * retournes}`;
  } else {
    etiquette = p === 0 ? "Couverture" : p === DERNIERE ? "Fin du livre" : `Page ${p}`;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-[radial-gradient(ellipse_at_center,#1e293b_0%,#0f172a_70%)] px-4 py-4 text-white">
      <header className="text-center">
        <h1 className="font-serif text-lg font-semibold sm:text-xl">Exposé IHM : Les 7 Règles de Joëlle Coutaz</h1>
        <p className="text-xs text-slate-400">Livre interactif · tournez les pages avec les boutons ou les flèches ← →</p>
      </header>

      <div className="flex w-full flex-1 items-center justify-center py-3">
        <div className="relative" style={{ width: largeurLivre * echelle, height: H * echelle }}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-5 left-[8%] right-[8%] h-8 rounded-full bg-black/60 blur-2xl"
          />
          <div
            style={{
              width: largeurLivre,
              height: H,
              transform: `scale(${echelle})`,
              transformOrigin: "top left",
            }}
          >
            <div
              style={{
                position: "relative",
                width: largeurLivre,
                height: H,
                perspective: "2600px",
                transform: `translateX(${decalage}px)`,
                transition: "transform 0.9s cubic-bezier(0.45, 0.05, 0.25, 1)",
              }}
            >
              {Array.from({ length: nbFeuillets }, (_, i) => (
                <Feuillet
                  key={i}
                  index={i}
                  total={nbFeuillets}
                  retourne={i < retournes}
                  spread={spread}
                  front={spread ? pages[2 * i] : pages[i]}
                  back={spread ? pages[2 * i + 1] : null}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <nav aria-label="Navigation du livre" className="w-full max-w-md space-y-2">
        <div className="h-1 overflow-hidden rounded bg-slate-700">
          <div
            className="h-full bg-amber-300 transition-all duration-700"
            style={{ width: `${(p / DERNIERE) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={precedent}
            disabled={p === 0}
            className="inline-flex items-center gap-1 rounded-full bg-slate-700 px-4 py-2 text-sm font-medium transition hover:bg-slate-600 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="rounded-full px-3 py-2 text-xs text-slate-300 underline-offset-2 hover:text-white hover:underline"
          >
            {etiquette} · Sommaire
          </button>
          <button
            type="button"
            onClick={suivant}
            disabled={p === DERNIERE}
            className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-200 disabled:opacity-30"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </nav>
    </main>
  );
}
