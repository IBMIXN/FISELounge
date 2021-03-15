const EMERGENCY_MESSAGES = {
  en: "Please, I am in need of your help. Contact me.",
  es: "Por favor, necesito tu ayuda. Contáctame.",
  it: "Per favore, ho bisogno del tuo aiuto. Contattami.",
  fr: "S'il vous plaît, j'ai besoin de votre aide. Contactez moi.",
  sv: "Snälla, jag behöver din hjälp. Kontakta mig.",
  ro: "Te rog, am nevoie de ajutorul tău. Contacteaza-ma.",
  zh: "拜托，我需要你的帮助。联络我。",
};

function translateEmergencyMessage() {
  const userLanguage = navigator.language || navigator.userLanguage || "en";
  const langCode = userLanguage.split("-")[0];
  return EMERGENCY_MESSAGES[langCode || "en"];
}

export { translateEmergencyMessage };
