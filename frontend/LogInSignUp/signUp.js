const form = document.getElementById('signupForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const role = document.getElementById('role').value;
  const email = form.querySelector('input[name="email"]').value.trim();
  const password = form.querySelector('input[name="password"]').value;
  const confirm_password = form.querySelector('input[name="confirm"]').value;

  if (password !== confirm_password) {
    alert('Passwords do not match!');
    return;
  }

  // Build base payload
  let payLoad = {
    role,
    email,
    password,
    confirm_password
  };

  if (role === 'student') {
    payLoad = {
      ...payLoad,
      stud_idnum: form.querySelector('input[name="stud_idnum"]').value.trim(),
      stud_fname: form.querySelector('input[name="stud_fname"]').value.trim(),
      stud_mname: form.querySelector('input[name="stud_mname"]').value.trim(),
      stud_lname: form.querySelector('input[name="stud_lname"]').value.trim(),
      stud_program: form.querySelector('select[name="stud_program"]').value,
      stud_college: form.querySelector('select[name="stud_college"]').value,
      stud_year: form.querySelector('select[name="stud_year"]').value,
      stud_status: form.querySelector('select[name="stud_status"]').value,
    };
  } else if (role === 'admin') {
    payLoad = {
      ...payLoad,
      admin_fname: form.querySelector('input[name="admin_fname"]').value.trim(),
      admin_mname: form.querySelector('input[name="admin_mname"]').value.trim(),
      admin_lname: form.querySelector('input[name="admin_lname"]').value.trim(),
      admin_contact: form.querySelector('input[name="admin_contact"]').value.trim(),
    };
  }

  // Determine endpoint
  const endpoint = role === 'admin' ? 'http://127.0.0.1:5000/admin/submit' : 'http://127.0.0.1:5000/student/submit';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payLoad),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message || 'Account created successfully.');
      form.reset();

      // Reset custom select display for role
      const custom = document.querySelector('.custom-select[data-target="role"]');
      const native = document.getElementById('role');
      if (custom && native) {
        custom.querySelector('.selected').textContent = native.options[native.selectedIndex].text;
      }

      // Toggle fields to default student view
      toggleFields(native.value);

    } else {
      alert(data.error || data.message || 'Failed to create account.');
    }

  } catch (error) {
    alert('An error occurred: ' + error.message);
  }
});

// Your existing toggleFields function (to show/hide student/admin fields)
function toggleFields(role) {
  const student = document.getElementById('studentFields');
  const admin = document.getElementById('adminFields');

  if (role === 'student') {
    student.classList.remove('hidden');
    admin.classList.add('hidden');
  } else {
    admin.classList.remove('hidden');
    student.classList.add('hidden');
  }
}

// Initialize on page load (if you want)
toggleFields(document.getElementById('role').value);
