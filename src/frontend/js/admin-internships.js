document.addEventListener('DOMContentLoaded', async function () {
    requireAdmin();

    const logoutBtn = document.getElementById('logoutBtn');
    const internshipsContainer = document.getElementById('internships-container');
    const createForm = document.getElementById('createInternshipForm');
    const modal = new bootstrap.Modal(document.getElementById('createInternshipModal'));
    const submitBtn = document.getElementById('submitInternship');
    const createError = document.getElementById('create-error');

    // Logout functionality
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        api.logout();
    });

    // Load internships
    loadInternships();

    async function loadInternships() {
        try {
            const result = await api.getInternships();

            if (result.ok) {
                renderInternships(result.data);
            } else {
                internshipsContainer.innerHTML = '<div class="alert alert-danger">Failed to load internships.</div>';
            }
        } catch (error) {
            console.error('Error loading internships:', error);
            internshipsContainer.innerHTML = '<div class="alert alert-danger">Error loading internships.</div>';
        }
    }

    function renderInternships(internships) {
        if (!internships || internships.length === 0) {
            internshipsContainer.innerHTML = `
                <div class="col-12 text-center p-5 bg-light rounded">
                    <h4>No internships created yet</h4>
                    <p>Click the "Create New Internship" button to add one.</p>
                </div>
            `;
            return;
        }

        internshipsContainer.innerHTML = internships.map(internship => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title">${internship.title}</h5>
                            <span class="badge bg-primary">${internship.slots} Slots</span>
                        </div>
                        <h6 class="card-subtitle mb-2 text-muted">${internship.company}</h6>
                        <span class="badge bg-info text-dark mb-2">${internship.duration}</span>
                        <p class="card-text mt-2 small text-muted">Posted: ${new Date(internship.date_posted).toLocaleDateString()}</p>
                        <p class="card-text">${internship.description.substring(0, 100)}...</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Handle form submission
    submitBtn.addEventListener('click', async function () {
        if (!createForm.checkValidity()) {
            createForm.reportValidity();
            return;
        }

        const internshipData = {
            title: document.getElementById('title').value,
            company: document.getElementById('company').value,
            description: document.getElementById('description').value,
            duration: document.getElementById('duration').value,
            slots: parseInt(document.getElementById('slots').value)
        };

        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
        createError.style.display = 'none';

        try {
            // Since we don't have a direct helper for creating internships in api.js yet (only public get), 
            // we'll make a fetch call here or assume api.js might handle it. 
            // Wait, looking at api.js I created earlier, it DOES NOT have createInternship.
            // Let me use fetch directly with api.getHeaders()

            const response = await fetch(`${API_BASE_URL}/internships`, {
                method: 'POST',
                headers: api.getHeaders(),
                body: JSON.stringify(internshipData)
            });

            const result = await response.json();

            if (response.ok) {
                modal.hide();
                createForm.reset();
                loadInternships(); // Reload list
                alert('Internship created successfully!');
            } else {
                createError.textContent = result.error || 'Failed to create internship';
                createError.style.display = 'block';
            }
        } catch (error) {
            console.error('Error creating internship:', error);
            createError.textContent = 'Connection error. Please try again.';
            createError.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Internship';
        }
    });
});
