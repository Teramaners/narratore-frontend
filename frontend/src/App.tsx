import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  // Utilizza la variabile d'ambiente VITE_BACKEND_URL.
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    // Effettua la richiesta al backend usando la variabile d'ambiente.
    fetch(`${BACKEND_URL}/api/hello`)
      .then(res => {
        if (!res.ok) { // Controlla se la risposta HTTP è un successo.
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setMessage(data.message)) // Imposta il messaggio.
      .catch(err => {
        console.error('Errore durante il recupero del messaggio di benvenuto:', err); // Logga l'errore.
        setMessage('Impossibile caricare il messaggio di benvenuto.'); // Messaggio per l'utente.
      });
  }, []);

  return (
    <div>
      <h1>Narratore di Sogni</h1>
      <p>{message || 'Caricamento messaggio iniziale...'}</p>
    </div>
  );
}

export default App;