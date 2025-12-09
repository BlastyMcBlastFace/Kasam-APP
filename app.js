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

  const STORAGE_KEY = "kasamLogV1";

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

  function getAdvice(meaning, comprehension, manageability) {
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
    const coachAdvice =
      `Fokus idag: din ${lowest.key}. Välj ett av råden i den rutan som känns mest konkret och gör det så enkelt att du med säkerhet genomför det.`;

    return {
      meaningfulness: meaningfulnessAdvice,
      comprehensibility: comprehensibilityAdvice,
      manageability: manageabilityAdvice,
      coach: coachAdvice
    };
  }

  // ===== UI =====

  function renderAdviceList(container, items) {
    if (!container) {
      console.warn("Saknar container för råd:", container);
      return;
    }
    container.innerHTML = "";
    items.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      container.appendChild(li);
    });
  }

  function setLevelClass(card, level) {
    if (!card) return;
    card.classList.remove("level-low", "level-medium", "level-high");
    card.classList.add(`level-${level}`);
  }

  function updateUI() {
    const meaning = Number(meaningSlider.value);
    const comprehension = Number(comprehensionSlider.value);
    const manageability = Number(manageabilitySlider.value);

    meaningValue.textContent = meaning;
    comprehensionValue.textContent = comprehension;
    manageabilityValue.textContent = manageability;

    kasamSummary.textContent = getKasamSummary(
      meaning,
      comprehension,
      manageability
    );

    const advice = getAdvice(meaning, comprehension, manageability);
    console.log("Råd-objekt:", advice);

    renderAdviceList(adviceMeaningEl, advice.meaningfulness);
    renderAdviceList(adviceComprehensionEl, advice.comprehensibility);
    renderAdviceList(adviceManageabilityEl, advice.manageability);

    setLevelClass(cardMeaning, getLevel(meaning));
    setLevelClass(cardComprehension, getLevel(comprehension));
    setLevelClass(cardManageability, getLevel(manageability));

    if (coachText) {
      coachText.textContent = advice.coach;
    }
  }

  // Events

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
    saveStatus.textContent = `Dagens KASAM sparad (${date}).`;
  });

  // Init
  updateUI();
});
