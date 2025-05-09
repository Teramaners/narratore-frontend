export async function loginUser(email: string, password: string) {
  const response = await fetch('http://localhost:3001/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Errore di login');
  }

  return await response.json();
}
