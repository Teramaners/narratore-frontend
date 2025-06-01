import { useEffect, useState } from 'react';

function Home() {
  const [messaggio, setMessaggio] = useState('');

  // Utilizza la variabile d'ambiente VITE_BACKEND_URL.
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    // Effettua la richiesta al backend usando la variabile d'ambiente.
    fetch(`${BACKEND_URL}/api/messaggio`)
      .then((res) => {
        if (!res.ok) { // Controlla se la risposta HTTP è un successo (status 2xx).
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setMessaggio(data.messaggio)) // Imposta il messaggio dal backend.
      .catch((err) => {
        console.error('Errore durante il recupero del messaggio:', err); // Logga l'errore.
        setMessaggio('Impossibile caricare il messaggio.'); // Messaggio per l'utente.
      });
  }, []); // L'array vuoto assicura che l'effetto venga eseguito solo una volta al mount.

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Narratore di Sogni</h1>
      <p>{messaggio || 'Caricamento...'}</p>
    </div>
  );
}

export default Home;