window.addEventListener('DOMContentLoaded', async () => {
  const list = document.getElementById('staffList');
  if (!list) return;

  try {
    const res = await fetch('http://localhost:3000/api/staff');
    const data = await res.json();
    list.innerHTML = '';

    data.forEach(user => {
      const div = document.createElement('div');
      div.textContent = `${user.username} (${user.role})`;
      list.appendChild(div);
    });
  } catch (err) {
    list.textContent = 'Failed to load staff data.';
  }
});