document.addEventListener("DOMContentLoaded", () => {
  console.log("KASAM-app initieras…");

  const meaningSlider = document.getElementById("meaning");
  const comprehensionSlider = document.getElementById("comprehension");
  const manageabilitySlider = document.getElementById("manageability");

  const meaningValue = document.getElementById("meaning-value");
  const comprehensionValue = document.getElementById("comprehension-value");
  const manageabilityValue = document.getElementById("manageability-value");

  const kasamSummary = document.getElementById("kasam-summary");

  const adviceMeaningEl = document.getElementById("advice-meaning");
  const adviceComprehensionEl = document.getElementById("advice-comprehension");
  const adviceManageabilityEl = document.getElementById("advice-manageability");

  const cardMeaning = document.getElementById("card-meaning");
  const cardComprehension = document.getElementById("card-comprehension");
  const cardManageability = document.getElementById("card-manageability");

  const coachText = document.getElementById("coach-text");

  const saveBtn = document.getElementById("save-btn");
  const saveStatus = document.getElementById("save-status");

  const chartCanvas = document.getElementById("kasamChart");
  const chartStatus = document.getElementById("chart-status");

  const adviceStyleSelect = document.getElementById("advice-style");

  const infoButtons = document.querySelectorAll(".info-icon");
  const infoBoxes = document.querySelectorAll(".info-box");

  const noteTextarea = document.getElementById("daily-note");
  const saveNoteBtn = document.getElementById("save-note-btn");
  const noteStatus = document.getElementById("note-status");
  const notesList = document.getElementById("notes-list");


  const STORAGE_KEY = "kasamLogV1";
  const ADVICE_STYLE_KEY = "kasamAdviceStyleV1";
  const NOTES_KEY = "kasamNotesV1";
  let kasamChart = null;

  // ===== LocalStorage (daglig logg) =====

  function todayISODate() {
    return new Date().toISOString().slice(0, 10);
  }

  function loadLog() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      console.error("Kunde inte läsa KASAM-logg:", e);
      return {};
    }
  }

  function saveLog(log) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    } catch (e) {
      console.error("Kunde inte spara KASAM-logg:", e);
    }
  }

  function saveTodayEntry(meaning, comprehension, manageability) {
    const log = loadLog();
    const d = todayISODate();
    log[d] = { date: d, meaning, comprehension, manageability };
    saveLog(log);
    return d;
  }

  function getSortedEntries() {
    const log = loadLog();
    const entries = Object.values(log);
    entries.sort((a, b) => (a.date < b.date ? -1 : 1));
    return entries;
  }

  // ===== Anteckningar (dagliga reflektioner) =====

  function loadNotes() {
    try {
      const raw = localStorage.getItem(NOTES_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      console.error("Kunde inte läsa anteckningar:", e);
      return {};
    }
  }

  function saveNotes(notes) {
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error("Kunde inte spara anteckningar:", e);
    }
  }

  function saveTodayNote(text) {
    const notes = loadNotes();
    const d = todayISODate();
    notes[d] = { date: d, text };
    saveNotes(notes);
    return d;
  }

  function getSortedNotes() {
    const notes = loadNotes();
    const arr = Object.values(notes);
    arr.sort((a, b) => (a.date < b.date ? -1 : 1));
    return arr;
  }

  function renderNotesList(limit = 10) {
    if (!notesList) return;

    const all = getSortedNotes();
    const latest = all.slice(-limit); // senaste X
    notesList.innerHTML = "";

    if (!latest.length) {
      const li = document.createElement("li");
      li.textContent = "Inga sparade reflektioner ännu.";
      notesList.appendChild(li);
      return;
    }

    latest.forEach((n) => {
      const li = document.createElement("li");
      const dateSpan = document.createElement("span");
      dateSpan.className = "note-date";
      dateSpan.textContent = n.date;

      const textSpan = document.createElement("span");
      textSpan.className = "note-text";
      textSpan.textContent = n.text || "(tom anteckning)";

      li.appendChild(dateSpan);
      li.appendChild(textSpan);
      notesList.appendChild(li);
    });
  }

  function initNotesUI() {
    if (!noteTextarea || !saveNoteBtn) return;

    // Fyll dagens anteckning om den finns
    const notes = loadNotes();
    const today = todayISODate();
    if (notes[today] && notes[today].text) {
      noteTextarea.value = notes[today].text;
    }

    renderNotesList();

    saveNoteBtn.addEventListener("click", () => {
      const text = noteTextarea.value.trim();
      const date = saveTodayNote(text);
      noteStatus.textContent = `Reflektion för ${date} sparad lokalt.`;
      renderNotesList();
    });
  }

  
  function toDisplayDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("sv-SE", { month: "short", day: "numeric" });
  }

  // ===== KASAM-logik =====

  function getLevel(value) {
    if (value <= 3) return "low";
    if (value <= 7) return "medium";
    return "high";
  }

  function getKasamSummary(meaning, comprehension, manageability) {
    const avg = (meaning + comprehension + manageability) / 3;
    const avgRounded = avg.toFixed(1);

    if (avg <= 3) {
      return `Din samlade KASAM-nivå (${avgRounded}/10) känns låg idag. Små, konsekventa steg räcker – välj 1–2 råd att testa.`;
    }
    if (avg <= 7) {
      return `Din KASAM (${avgRounded}/10) ligger på en mellannivå. Du har delar som fungerar och några som kan stärkas. Se tipsen som experiment, inte krav.`;
    }
    return `Din KASAM är hög idag (${avgRounded}/10). Notera vad som bidrar mest just nu – det blir din personliga skyddsfaktor framåt.`;
  }

  // ===== Råd + rådstil =====

  function getBaseAdvice(meaning, comprehension, manageability) {
    function levelAdvice(value, low, medium, high) {
      if (value <= 3) return low;
      if (value <= 7) return medium;
      return high;
    }

    const meaningfulnessAdvice = levelAdvice(
      meaning,
      [
        "Välj en liten aktivitet idag som ligger nära dina värderingar.",
        "Fundera på vad som skulle göra dagen 5% mer meningsfull.",
        "Titta på din kalender/att-göra-lista och markera en sak som faktiskt betyder något för någon annan. Lägg lite extra omsorg där.",
        "Skriv ner tre saker som brukar ge dig mening (personer, sammanhang, aktiviteter) – se om du kan få in en av dem i veckan.",
        "Prata med någon du litar på om vad som känns tomt just nu – bara att sätta ord på det kan öka känslan av sammanhang.",
        "Om mycket känns meningslöst: välj att bara “testa” ett av råden som ett experiment, inte som ett krav."
      ],
      [
        "Notera under dagen: när känner du lite mer energi eller närvaro? Skriv ned en kort rad om det.",
        "Välj en återkommande uppgift och påminn dig själv: “Vem eller vad bidrar jag till genom det här?”",
        "Identifiera när du känt mest energi idag och planera in mer av det.",
        "Justera en liten sak i vardagen så den ligger mer i linje med dina värderingar (t.ex. hur du startar dagen eller avslutar en arbetsuppgift).",
        "Formulera dagens viktigaste mening: 'Idag betyder det mest att jag..., då känns dagen okej.'"
      ],
      [
        "Skriv ned vad som gör att det känns meningsfullt just nu – det blir ett “minne” att gå tillbaka till när det dalar.",
        "Skydda tid för det som känns meningsfullt – blocka kalendern.",
        "Se om du kan använda din höga meningsfullhet för att stötta någon annan som har det tuffare – utan att tömma dig själv.",
        "Dela din upplevelse av mening med någon annan – ofta klarnar den ännu mer när du sätter ord på den.",
        "Planera in återhämtning även när meningen är hög, så att du inte “bränner” den på för mycket görande."
      ]
    );

    const comprehensibilityAdvice = levelAdvice(
      comprehension,
      [
        "Be om konkret förtydligande: “Kan du ge ett exempel?” eller “Kan du säga samma sak med enklare ord?”.",
        "Sätt ord på osäkerheten: “Just nu förstår jag inte X, och det gör att jag känner Y” – det minskar ofta känslan av kaos.",
        "Välj en situation som känns rörig och försök beskriva den i max 3 meningar. Ofta blir den mer hanterlig bara av det.",
        "Bryt ner uppgifter i tre steg och gör bara det första idag.",
        "Skapa en enkel dagstruktur: 'Först gör jag detta, sedan detta'.",
        "Skriv vad du vet → vad du inte vet → vem som kan ge klarhet."
      ],
      [
        "Gör en mental karta över veckan: tre huvudområden.",
        "Identifiera en sak som är oklar och bestäm ett litet nästa steg (ställa en fråga, boka ett möte, läsa in dig).",
        "Sammanfatta ett möte eller en dag för dig själv i tre punkter: “Det här hände – det här betyder det – det här blir nästa steg.”",
        "Om något känns halvtydligt: fråga “Vad är syftet med det här?” – syfte ökar ofta begripligheten.",
        "Förklara en process eller en uppgift för någon annan – när du förklarar för någon annan brukar din egen bild bli tydligare."
      ],
      [
        "Dokumentera din struktur och använd den som förklaringsmodell de dagar allt känns rörigt.",
        "Planera på längre sikt när din begriplighet är hög: vad är viktigast kommande vecka/månad?",
        "Var tydlig med gränser runt din tid och ditt fokus – hög begriplighet är en resurs, inte något som ska täcka upp för alla andra.",
        "Stärk andra genom att dela din överblick – det gynnar även dig.",
        "Lägg in små “reality checks”: stämmer min bild med andras bild? Om inte – justera utan att anklaga dig själv."
      ]
    );

    const manageabilityAdvice = levelAdvice(
      manageability,
      [
        "Lista allt som snurrar i huvudet – ringa in en sak du faktiskt kan påverka idag. Fokusera där!",
        "Skala ner en uppgift tills den känns löjligt liten – och gör bara den versionen. Det bygger känslan av “jag kan”.",
        "Ta bort eller förenkla något i din dag – vad behöver jag göra nu?",
        "Be konkret om stöd: 'Kan du hjälpa mig med X före kl 14?'",
        "Om allt känns överväldigande: välj att göra klart en sak helt, istället för att göra lite på tio saker."
      ],
      [
        "Prioritera dagen med tre etiketter: måste, bra, kan vänta – flytta något från måste till “kan vänta” om det går.",
        "Lägg in mikroåterhämtning: 3–5 min utan skärm.",
        "Lägg in små “checkpoint-frågor” under dagen: “Hur är min energi just nu?”, “Vad är mest hjälpsamt att göra nu?”.",
        "Checka av: 'Har jag tid och energi för detta idag?'",
        "Se till att du har något litet inplanerat som ger energi, inte bara tar – en kort promenad, en kopp kaffe i lugn och ro, ett samtal.",
        "Kom överens med dig själv om en “good enough”-nivå för en uppgift – allt behöver inte vara perfekt."
      ],
      [
        "Använd din höga hanterbarhet till att skapa buffertar: gör något i förväg som du brukar stressa över senare.",
        "Se över din belastning – finns något du kan ta bort innan det blir för mycket, även om du “klarar det” nu?",
        "När andra ber om hjälp: känn efter vad du faktiskt har utrymme för att ta, så att din känsla av kontroll inte äts upp.",
        "Välj en lagom utmaning som känns rolig (inte bara plikttrogen) och se hur du kan göra den hållbar över tid.",
        "Planera återhämtning även när du känner kontroll – hög hanterbarhet behöver underhållas.",
        "Dela ansvar – stärker upplevd gemensam hanterbarhet."
      ]
    );

    const dims = [
      { key: "meningsfullhet", value: meaning },
      { key: "begriplighet", value: comprehension },
      { key: "hanterbarhet", value: manageability }
    ].sort((a, b) => a.value - b.value);

    const lowest = dims[0];

    const coachBalanced =
      `Fokus idag: din ${lowest.key}. Välj ett av råden i den rutan som känns mest konkret och gör det så enkelt att du med säkerhet genomför det.`;

    const coachFactual =
      `Ur ett mer faktabaserat perspektiv är din ${lowest.key} lägst idag. Välj ett råd som känns realistiskt utifrån din faktiska tid och energi, och se det som ett litet experiment.`;

    const coachCoaching =
      `Som coach skulle jag säga: ge lite extra vänlighet till din ${lowest.key} idag. Välj ett råd som känns snällt men ändå utmanande på en lagom nivå för dig.`;

    return {
      meaningfulness: meaningfulnessAdvice,
      comprehensibility: comprehensibilityAdvice,
      manageability: manageabilityAdvice,
      coachBalanced,
      coachFactual,
      coachCoaching
    };
  }

  function adaptTipsForStyle(tips, style, dimensionLabel) {
    if (style === "factual") {
      return tips.map(t => `Faktaperspektiv (${dimensionLabel}): ${t}`);
    }
    if (style === "coaching") {
      return tips.map(t => `Coachande perspektiv (${dimensionLabel}): ${t}`);
    }
    // balanced
    return tips;
  }

  function getAdvice(meaning, comprehension, manageability, style) {
    const base = getBaseAdvice(meaning, comprehension, manageability);

    const meaningfulnessAdvice = adaptTipsForStyle(
      base.meaningfulness,
      style,
      "meningsfullhet"
    );
    const comprehensibilityAdvice = adaptTipsForStyle(
      base.comprehensibility,
      style,
      "begriplighet"
    );
    const manageabilityAdvice = adaptTipsForStyle(
      base.manageability,
      style,
      "hanterbarhet"
    );

    let coachAdvice = base.coachBalanced;
    if (style === "factual") coachAdvice = base.coachFactual;
    if (style === "coaching") coachAdvice = base.coachCoaching;

    return {
      meaningfulness: meaningfulnessAdvice,
      comprehensibility: comprehensibilityAdvice,
      manageability: manageabilityAdvice,
      coach: coachAdvice
    };
  }

  // ===== UI =====

  function renderAdviceList(container, items) {
    container.innerHTML = "";
    items.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      container.appendChild(li);
    });
  }

  function setLevelClass(card, level) {
    card.classList.remove("level-low", "level-medium", "level-high");
    card.classList.add(`level-${level}`);
  }

  function getCurrentAdviceStyle() {
    const styleFromSelect = adviceStyleSelect ? adviceStyleSelect.value : null;
    if (styleFromSelect) return styleFromSelect;

    const stored = localStorage.getItem(ADVICE_STYLE_KEY);
    return stored || "balanced";
  }

  function updateUI() {
    const meaning = Number(meaningSlider.value);
    const comprehension = Number(comprehensionSlider.value);
    const manageability = Number(manageabilitySlider.value);

    const style = getCurrentAdviceStyle();

    meaningValue.textContent = meaning;
    comprehensionValue.textContent = comprehension;
    manageabilityValue.textContent = manageability;

    kasamSummary.textContent = getKasamSummary(
      meaning,
      comprehension,
      manageability
    );

    const advice = getAdvice(meaning, comprehension, manageability, style);
    console.log("Råd-objekt:", advice);

    renderAdviceList(adviceMeaningEl, advice.meaningfulness);
    renderAdviceList(adviceComprehensionEl, advice.comprehensibility);
    renderAdviceList(adviceManageabilityEl, advice.manageability);

    setLevelClass(cardMeaning, getLevel(meaning));
    setLevelClass(cardComprehension, getLevel(comprehension));
    setLevelClass(cardManageability, getLevel(manageability));

    coachText.textContent = advice.coach;
  }

  // ===== Graf =====

  function renderChart() {
    const entries = getSortedEntries();
    console.log("Antal loggade poster:", entries.length, entries);

    if (!chartStatus) {
      console.warn("chartStatus-element saknas.");
    }

    if (!entries.length) {
      if (kasamChart) {
        kasamChart.destroy();
        kasamChart = null;
      }
      if (chartStatus) {
        chartStatus.textContent = "Ingen data ännu – spara minst en dags KASAM för att se grafen.";
      }
      return;
    }

    if (!chartCanvas) {
      console.warn("Canvas för graf saknas.");
      if (chartStatus) chartStatus.textContent = "Kunde inte hitta grafikytan (canvas).";
      return;
    }

    if (typeof Chart === "undefined") {
      console.warn("Chart.js verkar inte vara laddat.");
      if (chartStatus) chartStatus.textContent = "Grafbiblioteket (Chart.js) kunde inte laddas. Kontrollera din internetanslutning.";
      return;
    }

    if (chartStatus) chartStatus.textContent = "";

    const labels = entries.map((e) => toDisplayDate(e.date));
    const meaningData = entries.map((e) => e.meaning);
    const comprehensionData = entries.map((e) => e.comprehension);
    const manageabilityData = entries.map((e) => e.manageability);

    const data = {
      labels,
      datasets: [
        {
          label: "Meningsfullhet",
          data: meaningData,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          tension: 0.2,
        },
        {
          label: "Begriplighet",
          data: comprehensionData,
          borderColor: "#38bdf8",
          backgroundColor: "rgba(56, 189, 248, 0.2)",
          tension: 0.2,
        },
        {
          label: "Hanterbarhet",
          data: manageabilityData,
          borderColor: "#a855f7",
          backgroundColor: "rgba(168, 85, 247, 0.2)",
          tension: 0.2,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#e5e7eb" },
        },
      },
      scales: {
        x: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(75, 85, 99, 0.4)" },
        },
        y: {
          min: 0,
          max: 10,
          ticks: { stepSize: 2, color: "#9ca3af" },
          grid: { color: "rgba(75, 85, 99, 0.4)" },
        },
      },
    };

    if (kasamChart) {
      kasamChart.data = data;
      kasamChart.options = options;
      kasamChart.update();
    } else {
      kasamChart = new Chart(chartCanvas, {
        type: "line",
        data,
        options,
      });
    }
  }

  // ===== Rådstil – init & events =====

  function initAdviceStyle() {
    const stored = localStorage.getItem(ADVICE_STYLE_KEY);
    const initial = stored || "balanced";
    if (adviceStyleSelect) {
      adviceStyleSelect.value = initial;
      adviceStyleSelect.addEventListener("change", () => {
        const value = adviceStyleSelect.value || "balanced";
        localStorage.setItem(ADVICE_STYLE_KEY, value);
        updateUI();
      });
    }
  }

  // ===== Info-popups (under respektive slider) =====

  function initInfoPopups() {
    if (!infoButtons.length) return;

    infoButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.info;
        const targetId = "info-" + key;

        infoBoxes.forEach((box) => {
          if (box.id === targetId) {
            box.classList.toggle("open");
          } else {
            box.classList.remove("open");
          }
        });
      });
    });
  }

  // ===== Fällbara råd =====

  function initAdviceCollapse() {
    const cards = document.querySelectorAll(".advice-card");
    console.log("initAdviceCollapse: hittade", cards.length, "kort");

    if (!cards.length) return;

    // Startläge: alla kort kollapsade
    cards.forEach((card) => {
      card.classList.add("collapsed");
      card.classList.remove("expanded");
      const icon = card.querySelector(".advice-toggle-icon");
      if (icon) icon.textContent = "+";

      // Klick på hela kortet (inkl rubrik) togglar
      card.addEventListener("click", () => {
        const isCollapsed = card.classList.contains("collapsed");
        const iconInner = card.querySelector(".advice-toggle-icon");

        if (isCollapsed) {
          card.classList.remove("collapsed");
          card.classList.add("expanded");
          if (iconInner) iconInner.textContent = "–";
        } else {
          card.classList.add("collapsed");
          card.classList.remove("expanded");
          if (iconInner) iconInner.textContent = "+";
        }
      });
    });
  }

  // ===== Events sliders & spara =====

  [meaningSlider, comprehensionSlider, manageabilitySlider].forEach((slider) =>
    slider.addEventListener("input", () => {
      updateUI();
      saveStatus.textContent = "";
    })
  );

  saveBtn.addEventListener("click", () => {
    const meaning = Number(meaningSlider.value);
    const comprehension = Number(comprehensionSlider.value);
    const manageability = Number(manageabilitySlider.value);

    const date = saveTodayEntry(meaning, comprehension, manageability);
    saveStatus.textContent = `Dagens KASAM sparad lokalt (${date}).`;
    renderChart();
  });

  // ===== Init =====
  initAdviceStyle();
  initInfoPopups();
  initAdviceCollapse();
  updateUI();
  initNotesUI();
  renderChart();

  // Service worker-registrering (för PWA)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("sw.js")
      .then((reg) => {
        console.log("Service worker registrerad:", reg.scope);
      })
      .catch((err) => {
        console.log("Service worker-registrering misslyckades:", err);
      });
  }
});

