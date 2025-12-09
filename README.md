🌿 KASAM – Daglig check-in

En interaktiv webbapp för att stärka känslan av sammanhang genom daglig reflektion, loggning och coachande råd

KASAM (Känsla Av SAMmanhang) är en psykologisk modell utvecklad av Aaron Antonovsky.
Den bygger på tre centrala komponenter:

Meningsfullhet – känslan av att det jag gör är viktigt

Begriplighet – att förstå vardagen och skapa förutsägbarhet

Hanterbarhet – upplevelsen av att ha resurser att möta vardagen

Den här appen låter användaren snabbt skatta sin dag på dessa tre dimensioner och får sedan individuellt anpassade råd baserat på aktuell nivå. Datan sparas som en daglig logg och visualiseras som en graf över tid.

🚀 Funktioner
✔️ Tre sliders: meningsfullhet, begriplighet, hanterbarhet

Användaren skattar varje dimension mellan 0–10.

✔️ Automatiskt genererade råd

Appen ger faktabaserade och coachande tips baserat på:

nivå (låg, medel, hög)

aktuell balans mellan dimensionerna

svagaste dimensionen för dagen

✔️ Daglig loggning (LocalStorage)

Alla inmatningar sparas per datum utan backend.
Exempel:

{
  "2025-01-10": {
    "meaning": 6,
    "comprehension": 4,
    "manageability": 7
  }
}

✔️ Visuell utvecklingsgraf

Med hjälp av Chart.js visas linjediagram för alla tre dimensioner över tid.

✔️ Fungerar direkt via GitHub Pages

Allt är ren HTML/CSS/JS – ingen server behövs.

📂 Projektstruktur
/
├─ index.html       # Huvudsidan
├─ style.css        # Stil & layout
└─ app.js           # Logik, råd, grafer och datalagring

🧠 KASAM-modellen – kort bakgrund

Antonovsky visade att människor som tolkar sin vardag genom KASAM-linsen ofta:

hanterar stress bättre

upplever högre resiliens

känner större välbefinnande

upplever starkare motivation och riktning

Appen är designad för att göra modellen praktiskt användbar i vardagen genom:

Mikroreflektion (3 sliders)

Automatisk återkoppling (coachande råd)

Datadriven utveckling (graf över tid)

🛠️ Teknisk översikt
Lagring

• All data sparas lokalt via localStorage.
• Ingen backend krävs, allt sker i webbläsaren.

Grafik

• Linjediagram byggs med Chart.js (CDN).
• Renderar bara om biblioteket finns – appen kraschar inte om CDN misslyckas.

Kodprinciper

• Minimal och ren vanilla-JavaScript
• Inga externa ramverk
• Responsiv design för mobil och desktop

▶️ Kör projektet lokalt

Öppna bara index.html i en webbläsare.

Eller kör via GitHub Pages:

Gå till Settings → Pages

Välj branch: main

Välj source: /root

Spara – URL genereras automatiskt

💡 Framtida förbättringar (förslag)

Personlig dagbok kopplad till KASAM-värden

Exportera logg till CSV

Push-påminnelser via PWA

Mörkt / ljust tema

AI-genererade råd baserat på användarhistorik

Om du vill kan jag ta fram färdiga implementationer för dessa.

🙌 Licens

MIT License – fritt att kopiera, ändra och bygga vidare.

🎯 Syfte

Målet är att skapa ett enkelt, forskningsbaserat och användarvänligt verktyg för att:

öka självinsikt

identifiera vad som stärker respektive utmanar ens välbefinnande

stimulera ett mer reflekterande, hållbart vardagstempo

ge coachande stöd utan att bli påträngande

Appen är perfekt både för individuell användning och arbetsrelaterad reflektion, t.ex. inom ledarskap, teamutveckling eller stresshantering.# Kasam-APP
