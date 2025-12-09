document.addEventListener("DOMContentLoaded", () => {
  const meaningSlider = document.getElementById("meaning");
  const comprehensionSlider = document.getElementById("comprehension");
  const manageabilitySlider = document.getElementById("manageability");

  const meaningValue = document.getElementById("meaning-value");
  const comprehensionValue = document.getElementById("comprehension-value");
  const manageabilityValue = document.getElementById("manageability-value");

  const kasamSummary = document.getElementById("kasam-summary");
  const adviceList = document.getElementById("advice-list");

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

    // Meningsfullhet
    if (mLevel === "low") {
      tips.push(
        "Välj en liten aktivitet idag som känns viktig för dig – något som stämmer med dina värderingar.",
        "Skriv ned en sak du gör den här veckan som faktiskt spelar roll för någon annan."
      );
    } else if (mLevel === "medium") {
      tips.push(
        "Notera vilka stunder under dagen som känns mest meningsfulla och fundera på hur du kan få in fler sådana."
      );
    } else {
      tips.push(
        "Skydda tid i kalendern för det som känns meningsfullt för dig och säg nej till sådant som inte bidrar."
      );
    }

    // Begriplighet
    if (cLevel === "low") {
      tips.push(
        "Skriv en enkel plan för dagen med max 3 viktigaste sakerna.",
        "Bryt ned en svår uppgift i mindre steg och ta bara första steget idag."
      );
    } else if (cLevel === "medium") {
      tips.push(
        "Identifiera en situation som känns rörig och sätt ord på vad som är oklart – vem kan hjälpa dig att reda ut det?"
      );
    } else {
      tips.push(
        "Använd din goda överblick till att hjälpa någon annan att skapa struktur eller förstå sammanhanget bättre."
      );
    }

    // Hanterbarhet
    if (hLevel === "low") {
      tips.push(
        "Fundera på vad du kan ta bort eller skjuta upp idag för att få mer utrymme.",
        "Be någon om konkret hjälp med en uppgift eller ett beslut."
      );
    } else if (hLevel === "medium") {
      tips.push(
        "Planera in åtminstone en kort paus där du verkligen återhämtar dig (t.ex. en kort promenad utan mobil)."
      );
    } else {
      tips.push(
        "Använd din upplevelse av kontroll till att ta dig an en meningsfull utmaning – men var också noga med dina gränser."
      );
    }

    return tips;
  }

  function getKasamSummary(meaning, comprehension, manageability) {
    const avg = (meaning + comprehension + manageability) / 3;

    if (avg <= 3) {
      return "Din samlade KASAM-nivå känns låg idag. Var extra snäll mot dig själv och välj en eller två små saker från tipsen att testa – det räcker.";
    }
    if (avg <= 7) {
      return "Din KASAM ligger på en mellannivå idag. Du har delar som fungerar, och några som kan stärkas medvetet.";
    }
    return "Din KASAM är hög idag. Fundera på hur du kan bevara den här nivån över tid och vad som bidrar mest.";
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

  // Lyssna på förändringar
  [meaningSlider, comprehensionSlider, manageabilitySlider].forEach((slider) =>
    slider.addEventListener("input", updateUI)
  );

  // Initiera
  updateUI();
});
