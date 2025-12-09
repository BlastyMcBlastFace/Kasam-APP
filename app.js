document.addEventListener("DOMContentLoaded", () => {
  const meaningSlider = document.getElementById("meaning");
  const comprehensionSlider = document.getElementById("comprehension");
  const manageabilitySlider = document.getElementById("manageability");

  const meaningValue = document.getElementById("meaning-value");
  const comprehensionValue = document.getElementById("comprehension-value");
  const manageabilityValue = document.getElementById("manageability-value");

  const kasamSummary = document.getElementById("kasam-summary");
  const adviceList = document.getElementById("advice-list");

  const saveBtn = document.getElementById("save-btn");
  const saveStatus = document.getElementById("save-status");

  const chartCanvas = document.getElementById("kasamChart");

  const STORAGE_KEY = "kasamLogV1";

  let kasamChart = null;

  // --- Hjälpfunktioner för logg / datum ---

  function todayISODate() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
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
    log[d] = {
      date: d,
      meaning,
      comprehension,
      manageability,
    };
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

  // --- KASAM-logik ---

  function getLevel(value) {
    if (value <= 3) return "low";
    if (value <= 7) return "medium";
    return "high";
  }

  function getAdvice(meaning, comprehension, manageability) {
    const tips = [];

    const mLevel = getLevel(meaning);
    const cLevel = getLevel(comprehension);
    const hLevel = getLevel(manageability);

    // Meningsfullhet – fokus på värderingar och känsla av syfte
    if (mLevel === "low") {
      tips.push(
        "Forskning om välbefinnande visar att små, värderingsstyrda handlingar har stor effekt på sikt. Välj en liten sak idag som ligger nära dina värderingar (t.ex. hjälpa någon, bidra i ett projekt du bryr dig om).",
        "Skriv ned en mening eller påminnelse om varför det du gör i vardagen spelar roll – för dig själv, för andra eller för något större."
      );
    } else if (mLevel === "medium") {
      tips.push(
        "Identifiera ett tillfälle idag som kändes meningsfullt. Vad i situationen gjorde att det kändes så? Planera in fler liknande stunder kommande dagar."
      );
    } else {
      tips.push(
        "När meningsfullheten är hög är det värdefullt att 'bygga skyddsräcken'. Blocka tid i kalendern för det som är viktigast och var medveten om vad du säger ja respektive nej till."
      );
    }

    // Begriplighet – struktur, förutsägbarhet, kognitiv överblick
    if (cLevel === "low") {
      tips.push(
        "KASAM-forskning betonar att förutsägbarhet minskar stress. Gör en enkel dagplan med max 3 viktigaste saker och ungefär när du gör dem.",
        "Välj en situation som känns rörig och skriv upp vad du faktiskt vet, vad du inte vet och vem du kan fråga för att reda ut det."
      );
    } else if (cLevel === "medium") {
      tips.push(
        "Försök göra en 'mental karta' över dagen eller veckan. Sätt ord på var osäkerheten finns och planera ett litet steg för att öka klarheten (t.ex. ett mail, ett kort avstämningsmöte)."
      );
    } else {
      tips.push(
        "Du har en god kognitiv överblick just nu. Använd den till att skapa tydlighet även för andra – att förklara sammanhang högt brukar också stärka din egen begriplighet."
      );
    }

    // Hanterbarhet – resurser, stöd, kontroll
    if (hLevel === "low") {
      tips.push(
        "Studier kring stresshantering visar att upplevd kontroll är central. Välj en konkret sak du kan påverka idag (t.ex. prioritera om, minska omfattningen på en uppgift, be någon om hjälp).",
        "Fundera: vad kan jag ta bort, förenkla eller skjuta upp utan större konsekvenser? Att minska belastning är också ett aktivt, ansvarsfullt val."
      );
    } else if (hLevel === "medium") {
      tips.push(
        "Planera in en kort återhämtningspaus där du faktiskt byter miljö eller aktivitet (t.ex. kort promenad, andningspaus, stänga ner skärmar i 5 minuter). Små pauser skyddar hanterbarheten över tid."
      );
    } else {
      tips.push(
        "När du känner hög hanterbarhet är det ett bra läge att ta dig an en meningsfull utmaning. Sätt en tydlig gräns för hur mycket tid/energi den får ta så att balansen bevaras."
      );
    }

    // Extra coachande metatips, baserat på svagaste dimensionen
    const dims = [
      { key: "Meningsfullhet", value: meaning },
      { key: "Begriplighet", value: comprehension },
      { key: "Hanterbarhet", value: manageability },
    ];
    dims.sort((a, b) => a.value - b.value);
    const lowest = dims[0];

    tips.push(
      `Coach-perspektiv: Den dimension som just nu ser svagast ut är ${lowest.key.toLowerCase()}. Välj ett av tipsen ovan och formulera det som ett konkret steg du faktiskt kan göra idag. Gör det så litet att det nästan känns för enkelt – då ökar chansen att du verkligen gör det.`
    );

    return tips;
  }

  function getKasamSummary(meaning, comprehension, manageability) {
    const avg = (meaning + comprehension + manageability) / 3;
    const avgRounded = avg.toFixed(1);

    if (avg <= 3) {
      return `Din samlade KASAM-nivå (${avgRounded}/10) känns låg idag. Forskning visar att små, konsekventa steg är mer hållbara än stora ryck – välj 1–2 tips att testa, det räcker.`;
    }
    if (avg <= 7) {
      return `Din KASAM (${avgRounded}/10) ligger på en mellannivå. Du har delar som fungerar och några som kan stärkas. Se dagens tips som experiment, inte som krav.`;
    }
    return `Din KASAM är hög idag (${avgRounded}/10). Reflektera över vad som bidrar mest just nu – det är din personliga 'skyddsfaktor' som du kan återvända till när det blir tuffare.`;
  }

  // --- UI-uppdatering ---

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

    const tips = getAdvice(meaning, comprehension, manageability);

    const ul = document.createElement("ul");
    tips.forEach((tip) => {
      const li = document.createElement("li");
      li.textContent = tip;
      ul.appendChild(li);
    });

    adviceList.innerHTML = "";
    adviceList.appendChild(ul);
  }

  // --- Diagram ---

  function renderChart() {
    const entries = getSortedEntries();
    if (!entries.length) {
      if (kasamChart) {
        kasamChart.destroy();
        kasamChart = null;
      }
      return;
    }

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
          labels: {
            color: "#e5e7eb",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#9ca3af",
          },
          grid: {
            color: "rgba(75, 85, 99, 0.4)",
          },
        },
        y: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2,
            color: "#9ca3af",
          },
          grid: {
            color: "rgba(75, 85, 99, 0.4)",
          },
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

  // --- Event-hantering ---

  [meaningSlider, comprehensionSlider, manageabilitySlider].forEach((slider) =>
    slider.addEventListener("input", () => {
      updateUI();
      saveStatus.textContent = ""; // rensa ev. gammalt meddelande
    })
  );

  saveBtn.addEventListener("click", () => {
    const meaning = Number(meaningSlider.value);
    const comprehension = Number(comprehensionSlider.value);
    const manageability = Number(manageabilitySlider.value);

    const date = saveTodayEntry(meaning, comprehension, manageability);
    renderChart();
    saveStatus.textContent = `Dagens KASAM sparad (${date}).`;
  });

  // Initiera UI och diagram vid start
  updateUI();
  renderChart();
});
