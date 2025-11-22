// Attach click handler to the submit button. Ensure handler is async so `await` works.
const submitBtn = document.getElementById('submitStatus');
if (submitBtn) {
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('User not logged in.');
            return;
        }

        const statusEl = document.querySelector('input[name="status"]:checked');
        const status = statusEl ? statusEl.value : null;
        const notes = (document.getElementById('notes') || { value: '' }).value.trim();
        const photoInput = document.getElementById('photo');
        const photoFile = photoInput && photoInput.files && photoInput.files[0] ? photoInput.files[0] : null;
        const accId = user.id;

        if (!status) {
            alert('Please select a status.');
            return;
        }

        // Resolve STUD_ID from backend using ACC_ID first
        try {
            const resolveResp = await fetch('http://127.0.0.1:5000/student/resolve_student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ acc_id: accId })
            });
            const resolveData = await resolveResp.json().catch(() => ({}));
            if (!resolveResp.ok) {
                alert(resolveData.error || 'Failed to resolve student id');
                return;
            }
            const studId = resolveData.stud_id;
            if (!studId) {
                alert('Student id not found for this account');
                return;
            }

            // Use FormData to include file upload; backend should accept multipart/form-data.
            const form = new FormData();
            form.append('stud_id', studId);
            form.append('status', status);
            form.append('notes', notes);
            if (photoFile) form.append('photo', photoFile);

            const endpoint = 'http://127.0.0.1:5000/student/submit_status_by_student';

            const response = await fetch(endpoint, {
                method: 'POST',
                // Do NOT set Content-Type when sending FormData; the browser sets the boundary
                body: form,
                credentials: 'include'
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                alert(data.message || 'Status submitted successfully.');
                window.location.href = '../Main.html';
            } else {
                alert(data.error || data.message || 'Failed to submit current status.');
            }
        } catch (error) {
            console.error('Submit status error', error);
            alert('An error occurred: ' + (error.message || error));
        }
    });
} else {
    console.warn('Submit button (#submitStatus) not found.');
}