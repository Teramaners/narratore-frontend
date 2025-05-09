import React, { useState } from 'react';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? 'http://localhost:3001/login' : 'http://localhost:3001/register';

    const payload = isLogin
      ? { email, password }
      : { name, email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Successo: ${data.message || 'Operazione riuscita!'}`);
      } else {
        setMessage(`Errore: ${data.error || 'Qualcosa è andato storto'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Errore di connessione al server.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Narratore di Sogni</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          {isLogin ? 'Accedi' : 'Registrati'}
        </button>
      </form>
      <p style={styles.toggleText}>
        {isLogin ? 'Non hai un account?' : 'Hai già un account?'}{' '}
        <span
          onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
          style={styles.toggleLink}
        >
          {isLogin ? 'Registrati' : 'Accedi'}
        </span>
      </p>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
  },
  input: {
    padding: '10px',
    marginBottom: '15px',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  button: {
    padding: '10px',
    fontSize: '1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  toggleText: {
    marginTop: '15px',
    fontSize: '0.9rem',
  },
  toggleLink: {
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  message: {
    marginTop: '15px',
    fontSize: '1rem',
    color: '#333',
    textAlign: 'center',
    maxWidth: '300px',
  },
};

export default App;