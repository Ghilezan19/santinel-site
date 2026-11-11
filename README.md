# SANTINEL — site de prezentare

Site cinematic RO/EN pentru SANTINEL (AI pentru siguranța pe șantier + monitorizarea calității aerului).

## Pornire
```bash
npm install
npm run dev      # http://localhost:3000  (RO: /ro, EN: /en)
npm run build && npm start
```
> Node 20: Tailwind este fixat intenționat la 4.1.11 (versiunile 4.3+ cer Node ≥ 22).

## Ce editați
| Ce | Unde |
|---|---|
| Nume, email, telefon, formular (Formspree) | `content/config.ts` → `site` |
| Cifrele din „Problema” + surse (**DE VERIFICAT**) | `content/config.ts` → `stats`, `statSources` |
| Prețuri, hardware | `content/config.ts` → `pricing` |
| Ipoteze calculator ROI | `content/config.ts` → `roiAssumptions` |
| Echipa | `content/config.ts` → `team` |
| Toate textele | `messages/ro.json`, `messages/en.json` |

## Structură
- `components/three/HeroScene.tsx`: scena 3D din hero (clădire wireframe, macara, scanner, praf)
- `components/sections/*`: secțiunile paginii, în ordine (vezi `app/[locale]/page.tsx`)
- `components/ui/SiteScene.tsx`: scena CCTV desenată în SVG (muncitori, detecții)
- `lib/demoEngine.ts`: simularea pentru demo-ul live

## Publicare (GitHub Pages)
Site-ul e la https://ghilezan19.github.io/santinel-site/

După orice modificare:
```bash
git add -A && git commit -m "mesaj" && git push   # salvează codul
npm run deploy                                      # publică site-ul (1–2 min până apare)
```

## Formular
Cererile ajung pe emailul din `content/config.ts` prin FormSubmit (gratuit).
La **prima** cerere trimisă de pe site, FormSubmit trimite un email de activare: apăsați „Activate Form” o singură dată.
