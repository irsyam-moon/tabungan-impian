const form = document.getElementById('auth-form');
const errorBox = document.getElementById('error');

if (localStorage.getItem('token')) location.href = 'home.html';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.textContent = '';
  const body = Object.fromEntries(new FormData(form));
  try {
    const data = await api('/auth/' + form.dataset.mode, { method: 'POST', body });
    localStorage.setItem('token', data.token);
    localStorage.setItem('name', data.user.name);
    location.href = 'home.html';
  } catch (err) {
    errorBox.textContent = err.message;
  }
});