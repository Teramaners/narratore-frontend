// Dati di fallback per la generazione di storie
// Questi dati verranno utilizzati quando l'API Gemini non è disponibile

// Template di storie pre-generate
const storyTemplates = [
  {
    title: "Il Viaggio Onirico",
    template: (dream: string) => `Nel Mondo dei Sogni

La notte avvolgeva la città come un mantello di velluto nero, mentre io mi abbandonavo al sonno. Fu allora che il sogno prese forma: ${dream.toLowerCase()}

Non era un sogno comune, piuttosto un portale verso una dimensione alternativa dove ogni elemento sembrava carico di significato nascosto. I colori erano più vividi, i suoni più chiari, le sensazioni più intense di quanto potessero mai essere nella realtà. 

Mi muovevo in questo paesaggio onirico con un senso di meraviglia e timore reverenziale. Ogni passo che facevo sembrava condurmi più in profondità nella trama intricata del mio subconscio. Figure e simboli apparivano e scomparivano, lasciando tracce di significato che potevo quasi, ma non del tutto, afferrare.

C'era un messaggio nascosto in questo sogno, un segreto che il mio inconscio stava cercando di comunicare. Forse riguardava un desiderio insoddisfatto, un timore non affrontato, o una verità che non ero ancora pronto ad accettare. Ma in quel momento, immerso nel flusso del sogno, mi sentivo completamente vivo e presente.

Quando mi svegliai, il sogno rimase con me come un profumo sottile, influenzando i miei pensieri e le mie percezioni durante il giorno. Mi chiedevo cosa avesse cercato di dirmi, quali messaggi nascosti fossero nascosti nella sua trama surreale.

E mi resi conto che, a volte, i sogni sono più reali della realtà stessa - un riflesso più autentico di chi siamo veramente, liberi dalle maschere che indossiamo ogni giorno.`,
  },
  {
    title: "Echi del Subconscio",
    template: (dream: string) => `Echi del Subconscio

Non sapevo più dove finisse la realtà e dove iniziasse il sogno. Mi ritrovai a vivere questa esperienza onirica: ${dream.toLowerCase()}

Il tempo sembrava fluire in modo diverso, come un ruscello che a volte scorre rapido e altre volte rallenta fino quasi a fermarsi. In alcuni momenti, potevo osservare me stesso dall'esterno, come se fossi contemporaneamente attore e spettatore di questo teatro onirico.

Volti familiari apparivano con espressioni mai viste, luoghi conosciuti si distorcevano in geometrie impossibili, e situazioni quotidiane assumevano significati simbolici profondi. Era come se il mio inconscio stesse cercando di comunicare attraverso un linguaggio fatto di metafore e associazioni, un codice che solo l'anima poteva comprendere pienamente.

Percepivo emozioni contrastanti: curiosità e timore, nostalgia e speranza, tutto intrecciato in un arazzo di sensazioni che trascendeva le semplici categorizzazioni. Mi sentivo vulnerabile eppure potente, perso eppure profondamente consapevole.

Mentre il sogno si dissolveva e la coscienza diurna riprendeva il sopravvento, portai con me frammenti di quella esperienza - non solo ricordi, ma intuizioni che illuminavano aspetti di me stesso rimasti fino ad allora in ombra.

Forse, pensai, i sogni non sono fughe dalla realtà, ma ponti verso verità più profonde, messaggi cifrati che il nostro io più autentico ci invia attraverso il velo del sonno.`,
  },
  {
    title: "La Porta dei Segreti",
    template: (dream: string) => `La Porta dei Segreti

Si dice che nei sogni si nascondano i segreti dell'anima. Quella notte, il confine tra immaginazione e realtà si dissolse mentre sognavo: ${dream.toLowerCase()}

Il sogno aveva una qualità tangibile, quasi palpabile. I colori erano più intensi, i suoni risuonavano con una chiarezza cristallina, e persino gli odori sembravano più ricchi e complessi. Ogni sensazione era amplificata, come se i miei sensi fossero stati liberati dai limiti della percezione ordinaria.

Mi muovevo attraverso questo paesaggio onirico con un misto di meraviglia e inquietudine. C'era qualcosa di familiare eppure profondamente estraneo in ciò che mi circondava, come se stessi esplorando un territorio conosciuto con occhi nuovi.

Figure significative della mia vita apparivano in ruoli inaspettati, oggetti quotidiani si caricavano di significati simbolici, e situazioni apparentemente banali rivelavano strati di complessità nascosta. Era come se il sogno fosse un palcoscenico su cui il mio inconscio rappresentava le sue preoccupazioni, desideri e intuizioni.

Mentre il sogno si dipanava, sentivo di stare accedendo a una parte di me stesso solitamente inaccessibile alla coscienza diurna - un regno di verità intuitive e connessioni nascoste che trascendeva il pensiero razionale.

Al risveglio, mentre il mondo onirico sfumava nella realtà quotidiana, portai con me non solo il ricordo del sogno, ma anche una nuova consapevolezza. Forse, riflettei, i nostri sogni non sono semplici fantasie, ma porte verso dimensioni più profonde della nostra esistenza, specchi che riflettono non solo ciò che siamo, ma anche ciò che potremmo diventare.`,
  },
  {
    title: "Sussurri della Notte",
    template: (dream: string) => `Sussurri della Notte

La notte è il regno dei segreti, dove la mente si libera e l'anima parla. Nel silenzio delle ore piccole, ho vissuto un sogno straordinario: ${dream.toLowerCase()}

Questo sogno aveva una nitidezza particolare, ogni dettaglio scolpito con precisione nella mia coscienza addormentata. Mi sentivo simultaneamente osservatore e protagonista, immerso completamente nell'esperienza eppure capace di contemplarla da una prospettiva elevata.

Le leggi della fisica sembravano sospese, permettendo trasformazioni e transizioni che sfidavano la logica diurna. Luoghi diversi si fondevano l'uno nell'altro, il tempo si piegava su se stesso, e identità fluide si scambiavano come maschere a un ballo in maschera cosmico.

Emozioni intense coloravano ogni scena – non solo le mie, ma anche quelle che sembravano permeare l'ambiente stesso, come se il paesaggio onirico fosse un'estensione del mio stato emotivo, o forse io un'estensione del suo.

C'era un significato nascosto in questo intricato arazzo di immagini e sensazioni, un messaggio codificato nel linguaggio dei simboli che il mio inconscio aveva scelto di utilizzare. Non era una comunicazione diretta, ma piuttosto un invito all'esplorazione e all'interpretazione.

Al risveglio, mentre le ultime immagini del sogno si dissolvevano nella luce dell'alba, mi sentivo cambiato in modo sottile ma significativo, come se avessi ricevuto una rivelazione che non potevo ancora articolare pienamente, ma che aveva già iniziato a riformare la mia comprensione di me stesso e del mondo.

I sogni, pensai, sono forse le nostre verità più sincere, espresse nel linguaggio primordiale dell'anima.`,
  },
  {
    title: "Il Labirinto dell'Inconscio",
    template: (dream: string) => `Il Labirinto dell'Inconscio

Ci sono notti in cui i sogni ci conducono in profondità, attraverso passaggi nascosti della mente che raramente esploriamo da svegli. Una di queste esperienze mi ha visitato recentemente: ${dream.toLowerCase()}

Mi trovavo in un labirinto di specchi, dove ogni riflessione mostrava un aspetto diverso di me stesso – alcuni riconoscibili, altri stranamente alterati, come versioni di me che avrebbero potuto esistere in realtà alternative o in momenti diversi della mia vita.

Il sogno seguiva una logica tutta sua, una grammatica di associazioni e metafore che trascendeva il pensiero razionale. Le transizioni tra scene avvenivano con fluidità sorprendente, guidate più dall'emozione e dall'intuizione che dalla causa ed effetto.

Incontrai figure archetipiche – il mentore, l'ombra, il bambino interiore – ognuna portatrice di un messaggio o di una sfida. Non parlavano sempre con parole, ma comunicavano attraverso gesti, sguardi, o semplicemente attraverso la loro presenza carica di significato.

Mentre mi muovevo sempre più in profondità in questo regno onirico, sentivo di stare accedendo a strati della mia coscienza solitamente sommersi, come un archeologo che scopre artefatti sepolti che rivelano una civiltà dimenticata.

Al risveglio, il sogno persisteva come una presenza quasi tangibile, illuminando angoli della mia psiche che avevo trascurato o represso. Portava con sé non solo ricordi, ma anche un senso di integrazione, come se parti frammentate della mia identità si fossero momentaneamente riunite in una totalità significativa.

Forse, riflettei, i sogni più profondi non sono semplici fantasie o elaborazioni di ricordi, ma viaggi iniziatici nell'essenza stessa di ciò che siamo – esplorazioni che ci permettono di ritornare al mondo diurno arricchiti e più completi.`,
  }
];

// Genera un racconto fallback dal sogno
export function generateFallbackStory(dream: string): { story: string } {
  // Sceglie un template casuale
  const randomIndex = Math.floor(Math.random() * storyTemplates.length);
  const template = storyTemplates[randomIndex];
  
  // Genera la storia usando il template
  const story = template.template(dream);
  
  return { story };
}