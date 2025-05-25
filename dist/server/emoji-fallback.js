"use strict";
// Dati di fallback per la traduzione di sogni in emoji
// Questi dati verranno utilizzati quando l'API Gemini non è disponibile
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFallbackEmojiTranslation = generateFallbackEmojiTranslation;
// Mappe di parole chiave per emoji
const keywordToEmoji = {
    // Persone ed emozioni
    "felice": "😊",
    "felicità": "😊",
    "gioia": "😄",
    "triste": "😢",
    "tristezza": "😭",
    "piangere": "😭",
    "arrabbiato": "😠",
    "rabbia": "😡",
    "paura": "😨",
    "spavento": "😱",
    "terrore": "😱",
    "sorpresa": "😲",
    "meraviglia": "😲",
    "confuso": "😕",
    "confusione": "🤔",
    "amore": "❤️",
    "innamorato": "😍",
    "persona": "👤",
    "persone": "👥",
    "famiglia": "👪",
    "bambino": "👶",
    "amico": "🤝",
    // Natura e ambienti
    "sole": "☀️",
    "luna": "🌙",
    "stelle": "✨",
    "cielo": "🌤️",
    "notte": "🌃",
    "pioggia": "🌧️",
    "neve": "❄️",
    "temporale": "⛈️",
    "montagna": "🏔️",
    "mare": "🌊",
    "oceano": "🌊",
    "acqua": "💧",
    "albero": "🌳",
    "foresta": "🌲",
    "fiore": "🌸",
    "natura": "🏞️",
    "fuoco": "🔥",
    // Luoghi e costruzioni
    "casa": "🏠",
    "appartamento": "🏢",
    "edificio": "🏛️",
    "scuola": "🏫",
    "università": "🎓",
    "ospedale": "🏥",
    "chiesa": "⛪",
    "città": "🏙️",
    "strada": "🛣️",
    "ponte": "🌉",
    // Trasporti
    "auto": "🚗",
    "macchina": "🚗",
    "treno": "🚂",
    "aereo": "✈️",
    "volare": "✈️",
    "volo": "🛫",
    "nave": "🚢",
    "barca": "⛵",
    "bicicletta": "🚲",
    "correre": "🏃",
    // Azioni e concetti
    "parlare": "💬",
    "discorso": "🗣️",
    "silenzio": "🤫",
    "musica": "🎵",
    "cantare": "🎤",
    "dormire": "💤",
    "sognare": "💭",
    "pensare": "💭",
    "idea": "💡",
    "cercare": "🔍",
    "trovare": "🔎",
    "guardare": "👀",
    "vedere": "👁️",
    "nascondersi": "🙈",
    "chiave": "🔑",
    "porta": "🚪",
    "tempo": "⏳",
    "orologio": "⏰",
    "morte": "💀",
    "fantasma": "👻",
    "mostro": "👾",
    // Oggetti
    "libro": "📚",
    "leggere": "📖",
    "lettera": "✉️",
    "telefono": "📱",
    "chiamare": "📞",
    "computer": "💻",
    "regalo": "🎁",
    "denaro": "💰",
    "soldi": "💵",
    "cibo": "🍽️",
    "mangiare": "🍴",
    "bere": "🥤",
    // Sport e attività
    "sport": "🏆",
    "gara": "🏁",
    "competizione": "🥇",
    "vincere": "🏅",
    "perdere": "😓",
    "calcio": "⚽",
    "basket": "🏀",
    "nuoto": "🏊",
    "nuotare": "🏊‍♂️",
    "danza": "💃",
    "ballare": "🕺",
    // Elementi simbolici
    "cuore": "❤️",
    "stella": "⭐",
    "infinito": "♾️",
    "pace": "☮️",
    "pericolo": "⚠️",
    "vietato": "🚫",
    "segreto": "🔒",
    "magia": "✨",
};
// Emoji comuni nei sogni con spiegazioni
const dreamEmojis = [
    { emoji: "💭", meaning: "Rappresenta il sogno stesso o pensieri e riflessioni profonde" },
    { emoji: "🌙", meaning: "Simboleggia la notte, il sonno e l'inconscio" },
    { emoji: "✨", meaning: "Elementi magici, misteriosi o trasformativi nel sogno" },
    { emoji: "🚪", meaning: "Una porta o passaggio verso nuove possibilità o transizioni nella vita" },
    { emoji: "⏳", meaning: "Il tempo che scorre, ricordi passati o ansie sul futuro" },
    { emoji: "🔍", meaning: "Ricerca, scoperta o esplorazione di aspetti nascosti" },
    { emoji: "🌊", meaning: "Emozioni profonde, l'inconscio o situazioni travolgenti" },
    { emoji: "🏃", meaning: "Fuga da qualcosa, inseguimento o sensazione di urgenza" },
    { emoji: "😱", meaning: "Paura, ansia o momenti di terrore nel sogno" },
    { emoji: "🌈", meaning: "Speranza, trasformazione o passaggio verso qualcosa di positivo" },
    { emoji: "🔒", meaning: "Segreti, cose nascoste o parti di sé represse" },
    { emoji: "👁️", meaning: "Consapevolezza, intuizione o la sensazione di essere osservati" },
    { emoji: "🌪️", meaning: "Caos, confusione o cambiamenti turbolenti nella vita" },
    { emoji: "🧩", meaning: "Puzzle da risolvere o pezzi mancanti di una situazione" },
    { emoji: "🧠", meaning: "Processi mentali, ricordi o conflitti interiori" },
    { emoji: "🌱", meaning: "Crescita personale, nuovi inizi o potenziale non espresso" },
];
// Mood comuni nei sogni
const dreamMoods = {
    pacifico: "Questo sogno ha un tono prevalentemente pacifico e sereno, suggerendo un periodo di equilibrio emotivo",
    ansioso: "Questo sogno ha un tono prevalentemente ansioso e inquieto, riflettendo preoccupazioni o tensioni irrisolte",
    nostalgico: "Questo sogno ha un tono prevalentemente nostalgico, collegandosi a ricordi e sentimenti del passato",
    confuso: "Questo sogno ha un tono prevalentemente confuso e disorientante, suggerendo incertezza o decisioni difficili",
    avventuroso: "Questo sogno ha un tono prevalentemente avventuroso ed esplorativo, indicando desiderio di nuove esperienze",
    minaccioso: "Questo sogno ha un tono prevalentemente minaccioso o inquietante, esprimendo timori o situazioni di conflitto",
    trasformativo: "Questo sogno ha un tono prevalentemente trasformativo, suggerendo cambiamenti significativi in corso",
    gioioso: "Questo sogno ha un tono prevalentemente gioioso e positivo, riflettendo un buon momento emotivo",
};
/**
 * Genera una traduzione emoji di fallback per un sogno
 * quando l'API Gemini non è disponibile
 */
function generateFallbackEmojiTranslation(dreamText) {
    // Converte il testo in minuscolo per le corrispondenze
    const lowercaseDream = dreamText.toLowerCase();
    // Trova parole chiave nel testo del sogno che corrispondono a emoji
    const foundEmojis = new Set();
    Object.entries(keywordToEmoji).forEach(([keyword, emoji]) => {
        if (lowercaseDream.includes(keyword)) {
            foundEmojis.add(emoji);
        }
    });
    // Se non abbiamo trovato abbastanza emoji, aggiungiamo alcune emoji universali dei sogni
    if (foundEmojis.size < 3) {
        foundEmojis.add("💭"); // Bolla di pensiero (sogno)
        foundEmojis.add("🌙"); // Luna (notte/sonno)
        foundEmojis.add("✨"); // Stelle/magia (elemento onirico)
    }
    // Limita a max 12 emoji e converte in array
    const emojiArray = Array.from(foundEmojis).slice(0, 12);
    // Crea la stringa di traduzione emoji
    const emojiTranslation = emojiArray.join("");
    // Seleziona le spiegazioni per le emoji trovate
    const emojiExplanations = emojiArray.map(emoji => {
        // Cerca se abbiamo una spiegazione predefinita per questa emoji
        const predefinedExplanation = dreamEmojis.find(item => item.emoji === emoji);
        if (predefinedExplanation) {
            return predefinedExplanation;
        }
        // Altrimenti, crea una spiegazione generica
        return {
            emoji: emoji,
            meaning: "Rappresenta un elemento importante o un'emozione presente nel tuo sogno"
        };
    });
    // Determina il mood del sogno in base alle parole presenti
    let mood = "";
    let highestCount = 0;
    Object.entries(dreamMoods).forEach(([moodType, description]) => {
        // Parole associate a ciascun mood
        const moodKeywords = {
            pacifico: ["calmo", "tranquillo", "sereno", "pace", "quiete", "rilassato"],
            ansioso: ["ansia", "preoccupato", "timore", "stress", "tensione", "paura"],
            nostalgico: ["passato", "ricordo", "infanzia", "vecchio", "memoria", "tempo"],
            confuso: ["confuso", "strano", "bizzarro", "incomprensibile", "misterioso"],
            avventuroso: ["avventura", "esplorare", "scoprire", "viaggiare", "correre", "volare"],
            minaccioso: ["pericolo", "minaccia", "spaventoso", "buio", "mostro", "inseguire"],
            trasformativo: ["cambiamento", "trasformazione", "evoluzione", "crescita", "nuovo"],
            gioioso: ["felice", "gioia", "ridere", "festa", "amore", "divertimento"],
        };
        // Conta quante parole associate al mood sono presenti nel sogno
        const keywords = moodKeywords[moodType] || [];
        let count = 0;
        keywords.forEach(keyword => {
            if (lowercaseDream.includes(keyword)) {
                count++;
            }
        });
        // Se questo mood ha più parole corrispondenti, diventa il mood principale
        if (count > highestCount) {
            highestCount = count;
            mood = description;
        }
    });
    // Se non è stato possibile determinare un mood, usa un fallback generico
    if (!mood) {
        mood = "Questo sogno contiene diversi elementi simbolici che riflettono aspetti della tua vita interiore ed esteriore";
    }
    return {
        emojiTranslation,
        emojiExplanations,
        emojiMood: mood
    };
}
