document.addEventListener('DOMContentLoaded', async function () {
    requireStudent();

    const studentNameElement = document.getElementById('student-name');
    const applicationsContainer = document.getElementById('applications-container');
    const logoutBtn = document.getElementById('logoutBtn');

    // Logout functionality
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        api.logout();
    });

    try {
        // Load user info
        const user = await api.getCurrentUser();
        studentNameElement.textContent = user.name || 'Student';

        // Load applications
        const result = await api.getApplicationStatus();

        if (result.ok) {
            renderApplications(result.data);
        } else {
            applicationsContainer.innerHTML = '<div class="alert alert-danger">Failed to load applications.</div>';
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        applicationsContainer.innerHTML = '<div class="alert alert-danger">Error loading dashboard. Please try again later.</div>';
    }

    function renderApplications(applications) {
        if (!applications || applications.length === 0) {
            applicationsContainer.innerHTML = `
                <div class="col-12 text-center p-5 bg-light rounded">
                    <h4>No applications yet</h4>
                    <p>Browse internships and apply to get started!</p>
                    <a href="internships.html" class="btn btn-primary mt-2">Browse Internships</a>
                </div>
            `;
            return;
        }

        let html = '<div class="row">';

        applications.forEach(app => {
            let statusClass = 'bg-secondary';
            if (app.status === 'Approved') statusClass = 'bg-success';
            if (app.status === 'Rejected') statusClass = 'bg-danger';
            if (app.status === 'Pending') statusClass = 'bg-warning text-dark';

            html += `
                <div class="col-md-6 mb-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title">${app.title || app.internship_title || 'Internship'}</h5>
                                <span class="badge ${statusClass}">${app.status}</span>
                            </div>
                            <h6 class="card-subtitle mb-3 text-muted">${app.company || app.company_name || 'Company'}</h6>
                            <p class="card-text"><small class="text-muted">Applied on: ${new Date(app.applied_at).toLocaleDateString()}</small></p>
                            
                            <hr>
                            <h6>My Application:</h6>
                            <p class="card-text small">${app.cover_letter || 'No cover letter submitted.'}</p>
                            ${app.cv_file ? `<p class="mb-0 small"><i class="bi bi-file-earmark-text"></i> CV: ${app.cv_file}</p>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        applicationsContainer.innerHTML = html;
    }
});
