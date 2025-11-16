window.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));

  console.log('user:', user);
  console.log('user.email:', user?.email);
  console.log('nameEl:', nameEl);

  
  if (!user) {
    window.location.href = '../LogInSignUp/login.html';
    return;
  }

  const nameEl = document.querySelector('.name1');

  if (nameEl) {
    let email = user.email || 'holaaa';
    nameEl.textContent = email.length > 15 ? email.slice(0, 15) + '...' : email;
  }

});
