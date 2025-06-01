import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');
  const navigate = useNavigate();

  // Utilizza la variabile d'ambiente VITE_BACKEND_URL.
  // Se non definita (es. in sviluppo locale), userà 'http://localhost:3001'.
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrore(''); // Resetta l'errore ad ogni tentativo di login.
    try {
      // Costruisce l'URL usando la variabile d'ambiente.
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      // Controlla il successo della risposta HTTP (status 2xx).
      if (response.ok) {
        localStorage.setItem('token', data.token); // Salva il token se il login ha successo.
        navigate('/home'); // Reindirizza alla home page.
      } else {
        // Mostra un messaggio di errore dal backend o un messaggio generico.
        setErrore(data.message || 'Credenziali non valide');
      }
    } catch (err) {
      console.error("Errore durante il login:", err); // Logga l'errore completo per il debug.
      setErrore('Errore di rete. Impossibile connettersi al server.'); // Messaggio user-friendly.
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username: </label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Accedi</button>
      </form>
      {errore && <p style={{ color: 'red' }}>{errore}</p>}
    </div>
  );
};

export default Login;