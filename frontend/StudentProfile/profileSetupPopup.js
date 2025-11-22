document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const acc_id = JSON.parse(localStorage.getItem('user')).id;
    const contactNumber = document.getElementById('contactNumber').value.trim();
    const barangay = document.getElementById('barangay').value.trim();
    const address = document.getElementById('address').value.trim();
    const emName = document.getElementById('emName').value.trim();
    const emNumber = document.getElementById('emNumber').value.trim();

    try {
        let response = await fetch('http://127.0.0.1:5000/student/update_profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acc_id, contactNumber, barangay, address, emName, emNumber })
        });
        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        let data = await response.json();

        if (response.ok) {
            alert(data.message)
            window.location.href = '../StudentProfile.html';
        } else {
            alert(data.error || 'Failed to update profile');
        }

    } catch (error) {
        console.error('Error updating profile:', error);
    }
    
})