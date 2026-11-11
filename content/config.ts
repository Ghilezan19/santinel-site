/**
 * SANTINEL — configurare centrală.
 * Tot ce trebuie să editați (nume, prețuri, cifre, echipă, contact) este aici.
 * Textele de pe site sunt în /messages/ro.json și /messages/en.json.
 */

export const site = {
  name: "SANTINEL",
  domain: "santinel.ro",
  contactEmail: "ghilezan19@gmail.com",
  phone: "0787 788 291",
  city: "Timișoara, România",
  /**
   * Unde ajung cererile din formular. Implicit: FormSubmit (gratuit, fără cont),
   * care le trimite pe emailul de mai sus. Prima cerere trimite un email de
   * activare la această adresă: trebuie apăsat o singură dată „Activate Form”.
   * Dacă e gol, formularul deschide clientul de email (mailto).
   */
  formEndpoint: "https://formsubmit.co/ajax/ghilezan19@gmail.com",
};

/**
 * Cifrele din secțiunea „Problema”.
 * ⚠️ DE VERIFICAT înainte de concurs — înlocuiți cu valori + surse oficiale
 * (Inspecția Muncii, Eurostat, ANPM / calitateaer.ro).
 */
export const stats = [
  { key: "fatalShare", value: 22, suffix: "%", decimals: 0 },
  { key: "falls", value: 1, prefix: "#", decimals: 0 },
  { key: "pm10Limit", value: 50, suffix: " µg/m³", decimals: 0 },
  { key: "exceedDays", value: 35, suffix: "", decimals: 0 },
] as const;

export const statSources = [
  "Eurostat — European Statistics on Accidents at Work (ESAW) — DE VERIFICAT",
  "Inspecția Muncii — rapoarte anuale accidente de muncă — DE VERIFICAT",
  "Legea 104/2011 privind calitatea aerului înconjurător (valori-limită PM10) — DE VERIFICAT",
];

/** Prețuri orientative (EUR / șantier / lună). */
export const pricing = {
  currency: "€",
  plans: [
    { id: "air", price: 149, highlighted: false },
    { id: "safety", price: 299, highlighted: false },
    { id: "complete", price: 399, highlighted: true },
  ],
  hardware: {
    camera: 180, // € / cameră AI (dacă nu există camere compatibile)
    sensor: 320, // € / senzor calitate aer
  },
} as const;

/**
 * Ipoteze pentru calculatorul ROI — ajustați-le cu date reale.
 * Toate sunt afișate transparent pe site.
 */
export const roiAssumptions = {
  incidentRatePerWorkerYear: 0.04, // incidente SSM raportabile / muncitor / an
  incidentReduction: 0.45, // reducere estimată cu monitorizare AI
  avgIncidentCost: 9000, // € cost mediu incident (oprire lucru, medical, anchetă)
  finesPerMonth: 450, // € amenzi SSM + mediu / lună / șantier (medie)
  finesReduction: 0.6,
  theftPerWorkerMonth: 35, // € pierderi materiale / muncitor / lună
  theftReduction: 0.5,
};

/**
 * Echipa. `photo` e în /public/team. `focus` = punctul de pe față (object-position),
 * `zoom` mărește poza când persoana apare mică în cadru.
 */
export const team: {
  name: string;
  role: string;
  initials: string;
  photo?: string;
  focus?: string;
  zoom?: number;
}[] = [
  {
    name: "Mădălin Ghilezan",
    role: "Co-fondator", // TODO: rolul exact
    initials: "MG",
    photo: "/team/madalin-ghilezan.png",
    focus: "48% 12%",
    zoom: 1.15,
  },
  {
    name: "Maximilian Racz",
    role: "Co-fondator", // TODO: rolul exact
    initials: "MR",
    photo: "/team/maximilian-racz.png",
    focus: "50% 22%",
    zoom: 1.9,
  },
];
