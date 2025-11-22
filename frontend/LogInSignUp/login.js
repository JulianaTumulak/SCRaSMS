document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  localStorage.setItem('user', JSON.stringify({ id: 4, email: 'test@example.com', role: 'student' }));

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    // Try student login first
    let response = await fetch('http://127.0.0.1:5000/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    let data = await response.json();

    // If student login failed with 401, try admin login endpoint as a fallback
    if (!response.ok && response.status === 401) {
      response = await fetch('http://127.0.0.1:5000/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      data = await response.json();
    }

    if (response.ok) {
      // Save user info for session persistence
      localStorage.setItem('user', JSON.stringify(data.user));

      alert(data.message);
      window.location.href = '../Main.html';
    } else {
      alert(data.error || 'Invalid credentials');
    }
  } catch (error) {
    alert('Account did not exist. Please sign up first.');
    console.error(error);
  }
});