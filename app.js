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

  const STORAGE_KEY = "kasamLogV1";
  const ADVICE_STYLE_KEY = "kasamAdviceStyleV1";
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
        "Skriv ned varför något du gör denna vecka spelar roll."
      ],
      [
        "Identifiera när du känt mest energi idag och planera in mer av det.",
        "Formulera dagens viktigaste mening: 'Idag betyder det mest att…'"
      ],
      [
        "Skydda tid för det som känns meningsfullt – blocka kalendern.",
        "Dela med dig av varför något känns viktigt – det förstärker motivationen."
      ]
    );

    const comprehensibilityAdvice = levelAdvice(
      comprehension,
      [
        "Bryt ner uppgifter i tre steg och gör bara det första idag.",
        "Skapa en enkel dagstruktur: 'Först gör jag detta, sedan detta'.",
        "Skriv vad du vet → vad du inte vet → vem som kan ge klarhet."
      ],
      [
        "Gör en mental karta över veckan: tre huvudområden.",
        "Identifiera en sak som är oklar och lös just den.",
        "Förklara sammanhang för andra – det ökar din egen tydlighet."
      ],
      [
        "Dokumentera din struktur och använd den som förklaringsmodell.",
        "Planera på längre sikt när din begriplighet är hög.",
        "Stärk andra genom att dela din överblick – det gynnar även dig."
      ]
    );

    const manageabilityAdvice = levelAdvice(
      manageability,
      [
        "Välj en sak du kan påverka idag och gör den.",
        "Ta bort eller förenkla något i din dag (10–20% regeln).",
        "Be konkret om stöd: 'Kan du hjälpa mig med X före kl 14?'"
      ],
      [
        "Lägg in mikroåterhämtning: 3–5 min utan skärm.",
        "Prioritera: vad är måste? vad är bra att göra?",
        "Checka av: 'Har jag tid och energi för detta idag?'"
      ],
      [
        "Ta dig an en lagom utmaning som känns viktig.",
        "Planera återhämtning även när du känner kontroll.",
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

  // Events sliders & spara

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

  // Init
  initAdviceStyle();
  initInfoPopups();
  updateUI();
  renderChart();
});
