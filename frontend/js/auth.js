const API_URL = 'http://localhost:5000/api'

// Switch between login and register tabs
function showTab(tab) {
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none'
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none'

  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'register' && i === 1))
  })
}

// REGISTER
async function registerUser() {
  const name = document.getElementById('register-name').value
  const email = document.getElementById('register-email').value
  const password = document.getElementById('register-password').value

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      document.getElementById('register-error').textContent = data.message
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }))
    window.location.href = 'dashboard.html'

  } catch (error) {
    document.getElementById('register-error').textContent = 'Something went wrong'
  }
}

// LOGIN
async function loginUser() {
  const email = document.getElementById('login-email').value
  const password = document.getElementById('login-password').value

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      document.getElementById('login-error').textContent = data.message
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }))
    window.location.href = 'dashboard.html'

  } catch (error) {
    document.getElementById('login-error').textContent = 'Something went wrong'
  }
}

// Redirect to dashboard if already logged in
if (localStorage.getItem('token')) {
  window.location.href = 'dashboard.html'
}