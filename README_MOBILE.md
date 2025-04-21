# Narratore di Sogni - Versione Mobile

Questa documentazione fornisce istruzioni dettagliate per generare e utilizzare la versione mobile dell'applicazione "Narratore di Sogni".

## Struttura del Progetto Android

Il progetto Android è stato strutturato utilizzando Capacitor, un framework che permette di convertire applicazioni web in applicazioni native per dispositivi mobili. La struttura principale del progetto Android si trova nella cartella `android/`.

## Come Generare l'APK

Per generare l'APK dell'applicazione "Narratore di Sogni", segui questi passaggi:

### Prerequisiti

- Java Development Kit (JDK) 11 o superiore
- Android Studio
- Android SDK con API level 33 o superiore
- Node.js e npm

### Passaggi per la Compilazione

1. **Clona il repository** di "Narratore di Sogni"

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Esegui la build dell'applicazione web**
   ```bash
   npm run build
   ```

4. **Sincronizza il progetto Android**
   ```bash
   npx cap sync
   ```

5. **Apri il progetto in Android Studio**
   ```bash
   npx cap open android
   ```

6. **In Android Studio**:
   - Attendi che Gradle sincronizzi il progetto
   - Risolvi eventuali problemi di dipendenze
   - Seleziona "Build" → "Build Bundle(s) / APK(s)" → "Build APK(s)"
   - Attendi il completamento della compilazione
   - L'APK sarà generato in `android/app/build/outputs/apk/debug/app-debug.apk`

## Configurazione dell'Applicazione

L'applicazione è configurata per utilizzare HTTPS come schema predefinito, con le seguenti impostazioni in `capacitor.config.ts`:

```typescript
server: {
  androidScheme: 'https',
  cleartext: true,
  allowNavigation: ['*']
}
```

Questo permette all'applicazione di accedere a risorse web in modo sicuro.

## Permessi Richiesti dall'Applicazione

L'applicazione richiede i seguenti permessi:

- Accesso a Internet (`android.permission.INTERNET`)
- Lettura della memoria esterna (`android.permission.READ_EXTERNAL_STORAGE`)
- Scrittura nella memoria esterna (`android.permission.WRITE_EXTERNAL_STORAGE`)
- Registrazione audio (`android.permission.RECORD_AUDIO`)

Questi permessi sono necessari per il corretto funzionamento delle funzionalità dell'applicazione.

## Personalizzazione dell'Applicazione

### Icona e Splash Screen

L'icona dell'applicazione è configurata in:
- `android/app/src/main/res/drawable/icon.png`
- La splash screen è configurata in `android/app/src/main/res/drawable/splash.xml`

### Colori dell'Applicazione

I colori principali sono definiti in:
- `android/app/src/main/res/values/colors.xml`

### Nome dell'Applicazione

Il nome dell'applicazione è definito in:
- `android/app/src/main/res/values/strings.xml`

## Risoluzione dei Problemi Comuni

1. **Errore di compilazione Gradle**: Assicurati che Gradle sia aggiornato alla versione più recente e che le dipendenze siano risolte correttamente.

2. **Problemi con le API Android**: Verifica che il file `android/app/build.gradle` abbia le configurazioni corrette per le API Android target e minima.

3. **Errori di risorse**: Assicurati che tutte le risorse (immagini, font, ecc.) siano nei formati corretti e nelle cartelle appropriate.

4. **Errori di WebView**: Se l'applicazione mostra una schermata bianca, verifica che la configurazione del WebView sia corretta e che l'applicazione abbia i permessi necessari per accedere a Internet.

## Versione Web

Se non è possibile generare l'APK, l'applicazione può essere utilizzata tramite browser navigando all'URL: https://narratore-di-sogni.replit.app/

La versione web offre le stesse funzionalità della versione mobile, ma senza la necessità di installare l'applicazione sul dispositivo.

## Supporto

Per qualsiasi problema o domanda riguardante l'applicazione "Narratore di Sogni", contatta il team di sviluppo.