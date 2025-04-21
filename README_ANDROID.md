# Istruzioni per la compilazione Android di Narratore di Sogni

Questo documento fornisce le istruzioni per compilare l'APK dell'applicazione "Narratore di Sogni" a partire dal codice sorgente.

## Prerequisiti

1. **Java Development Kit (JDK)** - Versione 11 o superiore
2. **Android Studio** - Ultima versione stabile
3. **Android SDK** - Con API level 33 (Android 13) o superiore
4. **Gradle** - Versione 7.6 o superiore (incluso in Android Studio)
5. **Node.js e npm** - Versione 16 o superiore

## Passaggi per la compilazione

### 1. Preparazione dell'ambiente di sviluppo

```bash
# Installare le dipendenze del progetto
npm install

# Eseguire la build dell'applicazione web
npm run build
```

### 2. Configurazione di Capacitor

Il file di configurazione `capacitor.config.ts` è già stato creato e configurato per l'applicazione.

### 3. Sincronizzazione del progetto Android

```bash
# Sincronizzare il progetto con gli ultimi cambiamenti
npx cap sync android
```

### 4. Apertura del progetto in Android Studio

```bash
# Aprire il progetto in Android Studio
npx cap open android
```

Dopo l'apertura in Android Studio:

1. Attendere che Gradle sincronizzi il progetto
2. Assicurarsi che tutti i plugin necessari siano installati
3. Risolvere eventuali problemi di dipendenze

### 5. Compilazione dell'APK

In Android Studio:

1. Selezionare dal menu "Build" -> "Build Bundle(s) / APK(s)" -> "Build APK(s)"
2. Attendere il completamento della compilazione
3. Cliccare su "locate" nel messaggio di conferma per trovare il file APK generato

In alternativa, da riga di comando:

```bash
cd android
./gradlew assembleDebug
```

L'APK si troverà in `android/app/build/outputs/apk/debug/app-debug.apk`

### 6. Firma dell'APK per la distribuzione

Per generare un APK firmato per la distribuzione:

1. In Android Studio, selezionare "Build" -> "Generate Signed Bundle / APK"
2. Selezionare "APK"
3. Creare o utilizzare una keystore esistente
4. Compilare i campi richiesti (alias, password)
5. Selezionare "release" come tipo di build
6. Cliccare su "Finish"

## Nota sulla configurazione di sicurezza

L'applicazione è configurata per utilizzare HTTPS come schema predefinito, con le seguenti impostazioni in `capacitor.config.ts`:

```typescript
server: {
  androidScheme: 'https',
  cleartext: true,
  allowNavigation: ['*']
}
```

## Risoluzione dei problemi comuni

1. **Errore di compilazione Gradle**: Assicurarsi che Gradle sia aggiornato e che le dipendenze siano risolte correttamente.
2. **Problemi con le API Android**: Verificare che il file `android/app/build.gradle` abbia le configurazioni corrette per le API Android target e minima.
3. **Errori di risorse**: Assicurarsi che tutte le risorse (immagini, font, ecc.) siano nei formati corretti e nelle cartelle appropriate.

## Personalizzazione dell'app

### Icona dell'applicazione

Per personalizzare l'icona dell'applicazione, sostituire i file nelle cartelle:
- `android/app/src/main/res/mipmap-*`

### Nome dell'applicazione

Il nome dell'applicazione è definito in:
- `android/app/src/main/res/values/strings.xml` nella proprietà `app_name`
- `capacitor.config.ts` nella proprietà `appName`

### Tema e colori

I colori principali dell'applicazione sono definiti in:
- `android/app/src/main/res/values/colors.xml`