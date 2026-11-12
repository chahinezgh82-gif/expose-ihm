"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Check,
  CircleCheck,
  CircleX,
  FolderOpen,
  Keyboard,
  Loader,
  Minus,
  Moon,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TriangleAlert,
  Sun,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types et utilitaires                                               */
/* ------------------------------------------------------------------ */

type Mode = "compare" | "bad" | "good";
type Kind = "bad" | "good";
type IconType = ComponentType<{ className?: string }>;

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";
const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

function Panel({ kind, children }: { kind: Kind; children: ReactNode }) {
  const bad = kind === "bad";
  return (
    <section
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
        bad ? "border-red-200" : "border-emerald-200"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold ${
          bad ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
        }`}
      >
        {bad ? <ThumbsDown className="h-4 w-4" /> : <ThumbsUp className="h-4 w-4" />}
        {bad ? "Mauvaise IHM (Problème)" : "Bonne IHM (Solution)"}
      </div>
      <div className="relative p-4">{children}</div>
    </section>
  );
}

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

/* ------------------------------------------------------------------ */
/*  Règle 1 : Le contrôle explicite                                    */
/* ------------------------------------------------------------------ */

const FICHIERS = [
  "Rapport_final.pdf",
  "Photos_vacances.zip",
  "Budget_2026.xlsx",
  "Notes_cours_IHM.docx",
];

function Regle1Mauvaise() {
  const [items, setItems] = useState<string[]>(FICHIERS);
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Passez simplement la souris sur un fichier pour voir ce qui se passe…
      </p>
      <ul className="space-y-2">
        {items.map((f) => (
          <li
            key={f}
            onMouseEnter={() => setItems((p) => p.filter((x) => x !== f))}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
          >
            {f}
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Tous vos fichiers ont disparu, sans aucune demande de votre part. Impossible de revenir en arrière.
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
      <p className="text-sm text-slate-600">
        La suppression exige un clic explicite, puis une confirmation.
      </p>
      <ul className="space-y-2">
        {items.map((f) => (
          <li
            key={f}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
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
      {items.length === 0 && (
        <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">Liste vide.</p>
      )}
      <Reinit onClick={() => setItems(FICHIERS)} />
      {cible !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
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

/* ------------------------------------------------------------------ */
/*  Règle 2 : Le contexte                                              */
/* ------------------------------------------------------------------ */

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
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm text-slate-800">
            <span>Livre « Interaction Homme-Machine »</span>
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
          <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
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

      <div className="flex items-center justify-between">
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
          Actualiser la page (simulation)
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

/* ------------------------------------------------------------------ */
/*  Règle 3 : La rétroaction                                           */
/* ------------------------------------------------------------------ */

function Regle3Mauvaise() {
  const [clics, setClics] = useState(0);
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Cliquez sur « Envoyer ». Le message est-il parti ? Impossible à savoir…
      </p>
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
      <p className="text-sm text-slate-600">
        Survolez, cliquez : le bouton réagit à chaque étape.
      </p>
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

/* ------------------------------------------------------------------ */
/*  Règle 4 : La cohérence                                             */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Règle 5 : La souplesse                                             */
/* ------------------------------------------------------------------ */

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
      <p className="text-sm text-slate-600">
        Pour ajouter une tâche : Fichier, puis Tâches, puis Nouvelle tâche. Aucun raccourci.
      </p>
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
      <ul className="min-h-[5rem] space-y-1 rounded-lg border border-dashed border-slate-300 p-2 text-sm text-slate-800">
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
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const ajouter = () => {
    const t = texte.trim();
    if (t === "") return;
    setTaches((p) => [...p, t]);
    setTexte("");
  };

  return (
    <div
      className={`space-y-3 rounded-xl p-3 ${TAILLES[taille]} ${
        sombre ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSombre((s) => !s)}
          className={`${base} border border-slate-400 py-1`}
        >
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
          ref={ref}
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
        <kbd className="rounded border border-slate-400 px-1">Ctrl+K</kbd> rechercher/saisir
        <kbd className="rounded border border-slate-400 px-1">Entrée</kbd> ajouter
        <kbd className="rounded border border-slate-400 px-1">Échap</kbd> effacer
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Règle 6 : L’anticipation / prévention des erreurs                  */
/* ------------------------------------------------------------------ */

function Regle6Mauvaise() {
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [mdp, setMdp] = useState("");
  const [resultat, setResultat] = useState<"aucun" | "erreur" | "ok">("aucun");

  const envoyer = () => {
    const valide =
      email.includes("@") && /^\d{2}\/\d{2}\/\d{4}$/.test(date) && mdp.length >= 8;
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
    { ok: mdp.length >= 8, texte: "Au moins 8 caractères" },
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
        <Champ label="E-mail" value={email} onChange={(v) => { setFait(false); setEmail(v); }} placeholder="nom@exemple.dz" />
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
          onChange={(e) => { setFait(false); setDate(e.target.value); }}
          className={inputCls}
        />
      </label>
      <div>
        <Champ label="Mot de passe" type="password" value={mdp} onChange={(v) => { setFait(false); setMdp(v); }} />
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
      {!valide && (
        <p className="text-xs text-slate-500">Le bouton s’active quand tous les champs sont valides.</p>
      )}
      {fait && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Réservation enregistrée.</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Règle 7 : La métaphore                                             */
/* ------------------------------------------------------------------ */

const ACTIONS_OBSCURES = [
  { code: "EXEC_01" },
  { code: "RM -RF" },
  { code: "0xA3F" },
  { code: "◢⬡◣" },
];

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
        {ACTIONS_OBSCURES.map((a) => (
          <button
            key={a.code}
            type="button"
            onClick={() => setDernier(a.code)}
            className="rounded border border-slate-500 bg-slate-800 px-3 py-2 font-mono text-xs text-green-400 hover:bg-slate-700"
          >
            {a.code}
          </button>
        ))}
      </div>
      <p className="rounded-lg bg-slate-100 p-3 font-mono text-xs text-slate-700">
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
            className="flex w-24 flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-3 text-xs text-slate-700 hover:border-indigo-400 hover:bg-indigo-50"
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

/* ------------------------------------------------------------------ */
/*  Définition des règles                                              */
/* ------------------------------------------------------------------ */

type Regle = {
  id: number;
  titre: string;
  court: string;
  regle: string;
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
    regle: "Le système n’exécute une action que sur demande explicite de l’utilisateur, qui garde la maîtrise du dialogue.",
    probleme: "Une simple action de survol supprime un fichier, sans demande ni possibilité d’annuler.",
    solution: "Un bouton clair déclenche l’action, puis une fenêtre de confirmation demande de valider.",
    Mauvaise: Regle1Mauvaise,
    Bonne: Regle1Bonne,
  },
  {
    id: 2,
    titre: "Le contexte",
    court: "Contexte",
    regle: "Le système conserve l’état de la tâche en cours : ce que l’utilisateur a saisi ne doit jamais se perdre.",
    probleme: "Changer d’étape ou actualiser la page efface toutes les données déjà saisies.",
    solution: "Les données sont conservées automatiquement entre les étapes, avec un badge « Auto-sauvegardé ».",
    Mauvaise: Regle2Mauvaise,
    Bonne: Regle2Bonne,
  },
  {
    id: 3,
    titre: "La rétroaction (feedback)",
    court: "Rétroaction",
    regle: "Chaque action de l’utilisateur doit recevoir une réponse visible et immédiate du système.",
    probleme: "Le bouton ne montre aucun changement : l’utilisateur doute et clique encore et encore.",
    solution: "Effet au survol et au clic, indicateur de chargement, puis message vert de succès.",
    Mauvaise: Regle3Mauvaise,
    Bonne: Regle3Bonne,
  },
  {
    id: 4,
    titre: "La cohérence",
    court: "Cohérence",
    regle: "Les mêmes actions ont le même aspect, la même place et le même comportement dans toute l’application.",
    probleme: "Couleurs, icônes et positions des boutons changent d’une carte à l’autre.",
    solution: "Un système de design unique : Supprimer en rouge à gauche, Valider en vert à droite.",
    Mauvaise: Regle4Mauvaise,
    Bonne: Regle4Bonne,
  },
  {
    id: 5,
    titre: "La souplesse (flexibilité)",
    court: "Souplesse",
    regle: "Le système s’adapte aux débutants comme aux experts, et à leurs préférences.",
    probleme: "Tout passe par des menus imbriqués à la souris : lent, sans raccourci, sans réglage.",
    solution: "Boutons pour les débutants, raccourcis clavier pour les experts, thème et taille du texte réglables.",
    Mauvaise: Regle5Mauvaise,
    Bonne: Regle5Bonne,
  },
  {
    id: 6,
    titre: "L’anticipation (prévention des erreurs)",
    court: "Prévention des erreurs",
    regle: "Il vaut mieux empêcher l’erreur que la signaler après coup : le système guide l’utilisateur en amont.",
    probleme: "Saisie libre, champs vides acceptés et message d’erreur incompréhensible après l’envoi.",
    solution: "Validation en temps réel, bouton désactivé tant que tout n’est pas valide, sélecteur de date.",
    Mauvaise: Regle6Mauvaise,
    Bonne: Regle6Bonne,
  },
  {
    id: 7,
    titre: "La métaphore (analogie)",
    court: "Métaphore",
    regle: "L’interface s’appuie sur des objets du monde réel que l’utilisateur connaît déjà.",
    probleme: "Des codes techniques et des symboles abstraits dont personne ne devine la fonction.",
    solution: "Corbeille, dossier, disquette et loupe : le sens est compris au premier regard.",
    Mauvaise: Regle7Mauvaise,
    Bonne: Regle7Bonne,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const MODES: { id: Mode; label: string; Icon: IconType }[] = [
  { id: "compare", label: "Côte à côte", Icon: ArrowLeftRight },
  { id: "bad", label: "Mauvaise IHM", Icon: ThumbsDown },
  { id: "good", label: "Bonne IHM", Icon: ThumbsUp },
];

export default function Page() {
  const [actif, setActif] = useState(1);
  const [mode, setMode] = useState<Mode>("compare");
  const regle = REGLES.find((r) => r.id === actif) ?? REGLES[0];
  const precedente = REGLES.find((r) => r.id === regle.id - 1);
  const suivante = REGLES.find((r) => r.id === regle.id + 1);
  const { Mauvaise, Bonne } = regle;

  const aller = (id: number) => {
    setActif(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 bg-indigo-900 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-lg font-bold sm:text-xl">Exposé IHM : Les 7 Règles de Joëlle Coutaz</h1>
            <p className="text-xs text-indigo-200">Interaction Homme-Machine · démonstrations interactives</p>
          </div>
          <div role="group" aria-label="Mode d’affichage" className="flex rounded-lg bg-indigo-800 p-1">
            {MODES.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                aria-pressed={mode === id}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition sm:px-3 sm:text-sm ${
                  mode === id ? "bg-white text-indigo-900" : "text-indigo-100 hover:bg-indigo-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 py-4 lg:grid-cols-[250px_1fr]">
        <nav aria-label="Les 7 règles" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {REGLES.map((r) => (
              <li key={r.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => aller(r.id)}
                  aria-current={r.id === actif ? "page" : undefined}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                    r.id === actif
                      ? "bg-indigo-700 text-white shadow"
                      : "bg-white text-slate-700 hover:bg-indigo-50"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      r.id === actif ? "bg-white text-indigo-700" : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {r.id}
                  </span>
                  {r.court}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-indigo-900">
              Règle {regle.id} : {regle.titre}
            </h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-indigo-50 p-3">
                <h3 className="text-sm font-semibold text-indigo-800">La règle</h3>
                <p className="mt-1 text-sm text-slate-700">{regle.regle}</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3">
                <h3 className="text-sm font-semibold text-red-800">Le problème</h3>
                <p className="mt-1 text-sm text-slate-700">{regle.probleme}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3">
                <h3 className="text-sm font-semibold text-emerald-800">La solution</h3>
                <p className="mt-1 text-sm text-slate-700">{regle.solution}</p>
              </div>
            </div>
          </div>

          <div className={mode === "compare" ? "grid items-start gap-4 lg:grid-cols-2" : "grid gap-4"}>
            {(mode === "compare" || mode === "bad") && (
              <Panel key={`mauvaise-${regle.id}`} kind="bad">
                <Mauvaise />
              </Panel>
            )}
            {(mode === "compare" || mode === "good") && (
              <Panel key={`bonne-${regle.id}`} kind="good">
                <Bonne />
              </Panel>
            )}
          </div>

          <div className="flex items-center justify-between">
            {precedente ? (
              <button
                type="button"
                onClick={() => aller(precedente.id)}
                className={`${base} bg-white text-slate-700 shadow-sm hover:bg-indigo-50`}
              >
                <ArrowLeft className="h-4 w-4" />
                Règle {precedente.id}
              </button>
            ) : (
              <span />
            )}
            {suivante ? (
              <button
                type="button"
                onClick={() => aller(suivante.id)}
                className={`${base} bg-indigo-700 text-white hover:bg-indigo-800`}
              >
                Règle {suivante.id}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <span />
            )}
          </div>
        </main>
      </div>

      <footer className="bg-white py-4 text-center text-xs text-slate-500">
        Exposé IHM · Les 7 règles de Joëlle Coutaz · Projet académique, Interaction Homme-Machine
      </footer>
    </div>
  );
}
