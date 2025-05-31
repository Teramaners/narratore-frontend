import { useEffect, useState } from 'react';

function Home() {
  const [messaggio, setMessaggio] = useState('');

  useEffect(() => {
    fetch('https://narratore-backend.onrender.com/api/messaggio')
      .then((res) => res.json())
      .then((data) => setMessaggio(data.messaggio))
      .catch((err) => console.error('Errore:', err));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Narratore di Sogni</h1>
      <p>{messaggio || 'Caricamento...'}</p>
    </div>
  );
}

export default Home;