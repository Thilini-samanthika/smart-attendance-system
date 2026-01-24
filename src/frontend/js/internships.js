document.addEventListener('DOMContentLoaded', async function () {
    // Check if user is logged in (optional for viewing, required for applying)
    const isLoggedIn = api.isLoggedIn();
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        if (!isLoggedIn) {
            logoutBtn.textContent = 'Login';
            logoutBtn.href = 'login.html';
        } else {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                api.logout();
            });
        }
    }

    const internshipsContainer = document.getElementById('internships-container');
    const applicationForm = document.getElementById('applicationForm');
    const applicationModal = new bootstrap.Modal(document.getElementById('applicationModal'));
    const modalInternshipId = document.getElementById('modal-internship-id');
    const submitBtn = document.getElementById('submitApplication');
    const applicationError = document.getElementById('application-error');

    // Load internships
    try {
        const result = await api.getInternships();

        if (result.ok) {
            renderInternships(result.data);
        } else {
            internshipsContainer.innerHTML = '<div class="alert alert-danger">Failed to load internships.</div>';
        }
    } catch (error) {
        console.error('Error loading internships:', error);
        internshipsContainer.innerHTML = '<div class="alert alert-danger">Error loading internships. Please try again later.</div>';
    }

    function renderInternships(internships) {
        if (!internships || internships.length === 0) {
            internshipsContainer.innerHTML = `
                <div class="col-12 text-center p-5 bg-light rounded">
                    <h4>No internships available</h4>
                    <p>Please check back later for new opportunities.</p>
                </div>
            `;
            return;
        }

        internshipsContainer.innerHTML = internships.map(internship => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${internship.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${internship.company}</h6>
                        <span class="badge bg-info mb-2">${internship.duration}</span>
                        <span class="badge bg-primary mb-2">${internship.slots} Slots</span>
                        <p class="card-text mt-3">${internship.description}</p>
                    </div>
                    <div class="card-footer bg-white border-top-0 pb-3">
                        <button class="btn btn-outline-primary w-100 apply-btn" 
                                data-id="${internship.id}" 
                                ${!isLoggedIn || api.getRole() !== 'student' ? 'disabled' : ''}>
                            ${!isLoggedIn ? 'Login to Apply' : (api.getRole() !== 'student' ? 'Student Only' : 'Apply Now')}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to apply buttons
        if (isLoggedIn && api.getRole() === 'student') {
            document.querySelectorAll('.apply-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    modalInternshipId.value = id;
                    applicationError.style.display = 'none';
                    applicationForm.reset();
                    applicationModal.show();
                });
            });
        }
    }

    // Handle application submission
    submitBtn.addEventListener('click', async function () {
        if (!applicationForm.checkValidity()) {
            applicationForm.reportValidity();
            return;
        }

        const internshipId = modalInternshipId.value;
        const coverLetter = document.getElementById('cover-letter').value;
        const cvFile = document.getElementById('cv-file').files[0];

        if (!cvFile) {
            showError('Please upload your CV');
            return;
        }

        const formData = new FormData();
        formData.append('internship_id', internshipId);
        formData.append('cover_letter', coverLetter);
        formData.append('cv', cvFile);

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            const result = await api.applyForInternship(formData);

            if (result.ok) {
                applicationModal.hide();
                alert('Application submitted successfully!');
                // Optional: redirect to dashboard
                window.location.href = 'student-dashboard.html';
            } else {
                showError(result.error || 'Failed to submit application');
            }
        } catch (error) {
            console.error('Error applying:', error);
            showError('Connection error. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Application';
        }
    });

    function showError(msg) {
        applicationError.textContent = msg;
        applicationError.style.display = 'block';
    }
});
