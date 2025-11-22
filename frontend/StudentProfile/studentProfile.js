(async () => {
  console.log('studentProfile.js: init');

  // Get user from localStorage (only "user" key for simplicity like login)
  const userString = localStorage.getItem('user');
  if (!userString) {
    console.error('No user found in localStorage under key "user"');
    return;
  }

  let user;
  try {
    user = JSON.parse(userString);
  } catch {
    console.error('Failed to parse user from localStorage');
    return;
  }

  const accId = user.id;
  const email = user.email;

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || 'Not set';
  }

  // Build URL using accId if available, else fallback to email
  let url;
  if (accId) {
    url = `http://127.0.0.1:5000/student/get_profile?acc_id=${encodeURIComponent(accId)}`;
  } else if (email) {
    url = `http://127.0.0.1:5000/student/get_profile?email=${encodeURIComponent(email)}`;
  } else {
    console.warn('No accId or email to fetch profile');
    // Populate from localStorage user fields as fallback
    setText('fullName', user.name || user.email || 'Not set');
    setText('studentId', user.stud_idnum || 'Not set');
    setText('program', user.stud_program || 'Not set');
    setText('yearLevel', user.stud_yearlevel || 'Not set');
    setText('contactNumber', user.phone || user.contactNumber || 'Not set');
    return;
  }

  try {
    const response = await fetch(url, { credentials: 'include' });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch profile');
    }

    const p = data.profile || {};

    const full = [p.stud_fname, p.stud_mname, p.stud_lname].filter(Boolean).join(' ');

    setText('fullName', full || p.stud_email || 'Not set');
    setText('studentId', p.stud_idnum || 'Not set');
    setText('program', p.stud_program || 'Not set');
    setText('yearLevel', p.stud_yearlevel || 'Not set');
    setText('contactNumber', p.stud_contact || p.stud_phone || 'Not set');
    setText('barangay', p.stud_barangay || 'Not set');
    setText('address', p.stud_address || 'Not set');
    setText('emName', p.em_name || 'Not set');
    setText('emNumber', p.em_phone || 'Not set');
  } catch (error) {
    console.error('Profile load error:', error);
  }
  // Wire up the Set Up Profile button to open a modal popup
  const setupBtn = document.getElementById('setupProfileBtn');
  if (setupBtn) {
    setupBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        // Fetch the popup fragment relative to this script's location so it works
        // when the fragment is injected by the SPA loader. Avoid assuming the
        // backend (5000) serves frontend static files — that causes 404s.
        const scriptEl = document.currentScript;
        let baseUrlForPopup;
        if (scriptEl && scriptEl.src) {
          baseUrlForPopup = new URL('.', scriptEl.src).href;
        } else {
          // Fallback: assume a `StudentProfile` folder at the current origin
          baseUrlForPopup = `${location.origin}/StudentProfile/`;
        }

        let popupUrl = new URL('profileSetupPopup.html', baseUrlForPopup).href;
        console.debug('studentProfile.js: loading popup from', popupUrl);
        let resp = await fetch(popupUrl).catch((e) => { console.debug('popup fetch failed', e); return null; });
        if (!resp || !resp.ok) {
          // Try one more likely variant if your server serves files under `/frontend/`
          const alt = `${location.origin}/frontend/StudentProfile/profileSetupPopup.html`;
          console.debug('studentProfile.js: trying alt popup URL', alt);
          resp = await fetch(alt).catch((e) => { console.debug('popup alt fetch failed', e); return null; });
          if (!resp || !resp.ok) {
            const bodyText = resp ? await resp.text().catch(() => null) : null;
            console.debug('popup fetch final failure, resp=', resp, 'body=', bodyText);
            throw new Error('Failed to load popup');
          }
          popupUrl = alt;
        }
        const html = await resp.text();
        // Insert into DOM
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        const modal = wrapper.firstElementChild;
        if (!modal) throw new Error('Invalid popup HTML');
        document.body.appendChild(modal);
        // Prevent background scroll
        document.documentElement.style.overflow = 'hidden';

        // Close helpers
        function closeModal() {
          if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
          document.documentElement.style.overflow = '';
        }

        // Close buttons
        modal.querySelectorAll('.modal-close, .btn.cancel').forEach(btn => {
          btn.addEventListener('click', () => closeModal());
        });

        // Form submit: POST to backend to persist, then update DOM and close
        const form = modal.querySelector('#profileSetupForm');
        if (form) {
          form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const fd = new FormData(form);
            const contactNumber = fd.get('contactNumber');
            const barangay = fd.get('barangay');
            const address = fd.get('address');
            const emName = fd.get('emName');
            const emNumber = fd.get('emNumber');

            // Attempt to persist to backend
            try {
              const payload = {
                acc_id: accId,
                contactNumber,
                barangay,
                address,
                emName,
                emNumber
              };
              const updateUrl = `http://127.0.0.1:5000/student/update_profile`;
              const r = await fetch(updateUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
              });
              const resJson = await r.json().catch(() => ({}));
              if (!r.ok) {
                console.error('Update failed', resJson);
                alert(resJson.error || 'Failed to save profile');
                return;
              }
            } catch (err) {
              console.error('Failed to POST profile update', err);
              alert('Failed to save profile');
              return;
            }

            // If persisted, update page fields
            setText('contactNumber', contactNumber || 'Not set');
            setText('barangay', barangay || 'Not set');
            setText('address', address || 'Not set');
            setText('emName', emName || 'Not set');
            setText('emNumber', emNumber || 'Not set');

            closeModal();
          });
        }
      } catch (err) {
        console.error('Failed to open profile setup popup', err);
      }
    });
  }

})();
