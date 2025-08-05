document.addEventListener('DOMContentLoaded', () => {
  const loginNavLink = document.querySelector('nav ul li a[href="login.html"]');
  if (loginNavLink) {
    loginNavLink.parentElement.remove();
  }

  const navUl = document.querySelector('nav ul');
  if (navUl) {
    if (!navUl.querySelector('a[href="developer.html"]')) {
      const devLi = document.createElement('li');
      const devA = document.createElement('a');
      devA.href = 'developer.html';
      devA.textContent = 'Developer';
      devLi.appendChild(devA);
      navUl.insertBefore(devLi, navUl.children[3] || null); 
    }
    if (!navUl.querySelector('a[href="manager.html"]')) {
      const manLi = document.createElement('li');
      const manA = document.createElement('a');
      manA.href = 'manager.html';
      manA.textContent = 'Manager';
      manLi.appendChild(manA);
      navUl.insertBefore(manLi, navUl.children[4] || null); 
    }
  }

  const userRole = localStorage.getItem('loggedInUserRole');
  if (userRole === 'developer' || userRole === 'manager') {
    const staffNavLink = document.querySelector('nav ul li a[href="staff.html"]');
    if (staffNavLink) {
      staffNavLink.parentElement.style.display = 'none';
    }
  }
});
