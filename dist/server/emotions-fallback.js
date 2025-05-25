"use strict";
// Dati di fallback per l'analisi delle emozioni nei sogni
// Questi dati verranno utilizzati quando l'API Gemini non è disponibile
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFallbackEmotionAnalysis = generateFallbackEmotionAnalysis;
// Emozioni predefinite con loro caratteristiche
const emotionLibrary = {
    "gioia": {
        description: "Sensazione di allegria e piacere che si manifesta in momenti di leggerezza e soddisfazione.",
        color: "#FFD700", // Gold
        keywords: ["felice", "contento", "sorriso", "ridere", "divertimento", "allegria", "festa", "celebrazione"],
        intensity: 8
    },
    "tristezza": {
        description: "Melanconia e sensazione di perdita che emerge in situazioni di separazione o delusione.",
        color: "#4682B4", // Steel Blue
        keywords: ["piangere", "lacrime", "perdita", "malinconia", "solitudine", "abbandono", "vuoto"],
        intensity: 7
    },
    "paura": {
        description: "Reazione di allarme e insicurezza di fronte a situazioni percepite come minacciose o pericolose.",
        color: "#800080", // Purple
        keywords: ["terrore", "spavento", "minaccia", "pericolo", "fuga", "nascondersi", "ansia", "oscurità"],
        intensity: 9
    },
    "rabbia": {
        description: "Forte emozione di irritazione e frustrazione che nasce in risposta a ostacoli o ingiustizie.",
        color: "#B22222", // Firebrick
        keywords: ["arrabbiato", "furioso", "irritato", "frustrazione", "lite", "aggressione", "conflitto"],
        intensity: 8
    },
    "sorpresa": {
        description: "Reazione improvvisa a eventi inattesi o rivelazioni impreviste nel sogno.",
        color: "#00CED1", // Dark Turquoise
        keywords: ["stupore", "meraviglia", "inaspettato", "shock", "rivelazione", "improvviso"],
        intensity: 6
    },
    "disgusto": {
        description: "Avversione o repulsione verso elementi o situazioni percepite come sgradevoli o ripugnanti.",
        color: "#556B2F", // Dark Olive Green
        keywords: ["repulsione", "ribrezzo", "schifo", "nausea", "avversione", "contaminazione"],
        intensity: 5
    },
    "serenità": {
        description: "Stato di calma e pace interiore che si manifesta in momenti di equilibrio e armonia.",
        color: "#87CEEB", // Sky Blue
        keywords: ["tranquillo", "calmo", "pacifico", "equilibrio", "armonia", "rilassato", "pace"],
        intensity: 6
    },
    "confusione": {
        description: "Sensazione di disorientamento e incertezza di fronte a situazioni complesse o ambigue.",
        color: "#9370DB", // Medium Purple
        keywords: ["disorientato", "perso", "incerto", "ambiguo", "labirinto", "caos", "complicato"],
        intensity: 7
    },
    "nostalgia": {
        description: "Sentimento agrodolce verso esperienze passate, luoghi familiari o persone care.",
        color: "#FFA07A", // Light Salmon
        keywords: ["ricordo", "passato", "memoria", "infanzia", "casa", "famiglia", "malinconia"],
        intensity: 6
    },
    "ansia": {
        description: "Stato di inquietudine e preoccupazione per situazioni future o conseguenze temute.",
        color: "#708090", // Slate Gray
        keywords: ["preoccupazione", "tensione", "nervosismo", "stress", "agitazione", "insicurezza"],
        intensity: 8
    },
    "speranza": {
        description: "Attesa fiduciosa verso possibilità future o cambiamenti positivi nelle situazioni.",
        color: "#98FB98", // Pale Green
        keywords: ["fiducia", "ottimismo", "futuro", "attesa", "possibilità", "rinnovamento", "luce"],
        intensity: 7
    },
    "meraviglia": {
        description: "Profondo stupore e ammirazione davanti a eventi o fenomeni di grande bellezza o potenza.",
        color: "#E6E6FA", // Lavender
        keywords: ["stupore", "incanto", "magnificenza", "bellezza", "ammirazione", "magia", "affascinante"],
        intensity: 8
    },
    "libertà": {
        description: "Sensazione di leggerezza e assenza di limiti o costrizioni, spesso associata al volo nei sogni.",
        color: "#ADD8E6", // Light Blue
        keywords: ["volare", "libero", "spazio", "aperto", "espansione", "indipendenza", "volo"],
        intensity: 9
    },
    "impotenza": {
        description: "Sensazione di incapacità di influenzare o cambiare una situazione negativa o minacciosa.",
        color: "#A9A9A9", // Dark Gray
        keywords: ["blocco", "paralisi", "immobilità", "ostacolo", "intrappolato", "inutilità", "incapacità"],
        intensity: 7
    },
    "curiosità": {
        description: "Desiderio di esplorare, scoprire e comprendere elementi sconosciuti o misteriosi.",
        color: "#DA70D6", // Orchid
        keywords: ["esplorazione", "scoperta", "interesse", "mistero", "indagine", "domanda", "ricerca"],
        intensity: 6
    }
};
/**
 * Funzione che analizza un testo di sogno e genera un'analisi emotiva di fallback
 * quando l'API Gemini non è disponibile
 */
function generateFallbackEmotionAnalysis(dream, story) {
    // Combina il sogno e la storia per l'analisi
    const combinedText = (dream + " " + story).toLowerCase();
    // Tiene traccia del conteggio delle parole chiave per ogni emozione
    const emotionScores = {};
    // Analizza il testo per trovare parole chiave associate a diverse emozioni
    Object.entries(emotionLibrary).forEach(([emotion, data]) => {
        let score = 0;
        data.keywords.forEach(keyword => {
            // Conta le occorrenze della parola chiave nel testo
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            const matches = combinedText.match(regex);
            if (matches) {
                score += matches.length;
            }
        });
        if (score > 0) {
            emotionScores[emotion] = score;
        }
    });
    // Se non abbiamo trovato emozioni, assegniamo alcuni valori predefiniti
    if (Object.keys(emotionScores).length === 0) {
        // Aggiungiamo alcune emozioni di base che sono comuni nei sogni
        emotionScores["curiosità"] = 5;
        emotionScores["confusione"] = 4;
        emotionScores["meraviglia"] = 3;
    }
    // Ordina le emozioni per punteggio decrescente
    const sortedEmotions = Object.entries(emotionScores)
        .sort((a, b) => b[1] - a[1])
        .map(([emotion, score]) => emotion);
    // Seleziona l'emozione primaria (quella con il punteggio più alto)
    const primaryEmotion = sortedEmotions[0] || "confusione";
    // Seleziona 3-5 emozioni per l'analisi
    const selectedEmotions = sortedEmotions.slice(0, Math.min(5, sortedEmotions.length));
    // Crea gli oggetti EmotionData per le emozioni selezionate
    const emotions = selectedEmotions.map(emotionName => {
        const emotionData = emotionLibrary[emotionName];
        const baseIntensity = emotionData.intensity;
        const score = emotionScores[emotionName] || 1;
        // Calcola un'intensità basata sia sul conteggio delle parole chiave che sull'intensità predefinita
        // Normalizza a un valore tra 1 e 10
        const normalizedScore = Math.min(10, Math.max(1, Math.round((score / 3 + baseIntensity) / 2)));
        return {
            name: emotionName.charAt(0).toUpperCase() + emotionName.slice(1),
            intensity: normalizedScore,
            description: emotionData.description,
            color: emotionData.color
        };
    });
    // Genera un'analisi generale
    let analysis = "";
    if (emotions.length === 1) {
        analysis = `Il sogno è dominato principalmente da un forte senso di ${primaryEmotion}. Questa emozione pervade l'intera narrativa onirica e suggerisce un focus su tematiche legate a questa dimensione emotiva.`;
    }
    else if (emotions.length >= 2) {
        const primaryIntensity = emotions[0].intensity > 7 ? "forte" : "moderato";
        const secondaryEmotion = emotions[1].name.toLowerCase();
        analysis = `Il sogno presenta un ${primaryIntensity} senso di ${primaryEmotion}, accompagnato da elementi di ${secondaryEmotion}. Questa combinazione emotiva suggerisce una tensione o complementarità tra questi stati affettivi, riflettendo possibili dinamiche interiori.`;
        if (emotions.length >= 3) {
            const tertiaryEmotion = emotions[2].name.toLowerCase();
            analysis += ` Si nota anche la presenza di ${tertiaryEmotion}, che aggiunge ulteriore complessità all'esperienza onirica.`;
        }
    }
    return {
        primaryEmotion: primaryEmotion.charAt(0).toUpperCase() + primaryEmotion.slice(1),
        emotions,
        analysis
    };
}
