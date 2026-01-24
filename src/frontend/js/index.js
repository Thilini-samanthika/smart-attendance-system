document.addEventListener('DOMContentLoaded', async function () {
    const internshipsContainer = document.getElementById('internships-container');
    const navUl = document.querySelector('.navbar-nav');

    // Check login state and update nav
    if (api.isLoggedIn()) {
        const role = api.getRole();
        const dashboardLink = role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html';

        navUl.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="${dashboardLink}">Dashboard</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" id="logoutBtn">Logout</a>
            </li>
        `;

        document.getElementById('logoutBtn').addEventListener('click', function (e) {
            e.preventDefault();
            api.logout();
        });
    }

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
        internshipsContainer.innerHTML = '<div class="alert alert-danger">Error loading internships.</div>';
    }

    function renderInternships(internships) {
        if (!internships || internships.length === 0) {
            internshipsContainer.innerHTML = `
                <div class="col-12 text-center p-5 bg-light rounded">
                    <h4>No internships available at the moment</h4>
                </div>
            `;
            return;
        }

        // Show only first 3 internships on home page
        const recentInternships = internships.slice(0, 3);

        internshipsContainer.innerHTML = recentInternships.map(internship => `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${internship.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${internship.company}</h6>
                        <p class="card-text">${internship.description.substring(0, 100)}...</p>
                        <span class="badge bg-primary">${internship.slots} Slots</span>
                    </div>
                </div>
            </div>
        `).join('');

        if (internships.length > 3) {
            internshipsContainer.innerHTML += `
                <div class="col-12 text-center mt-3">
                    <a href="${api.isLoggedIn() ? 'internships.html' : 'login.html'}" class="btn btn-outline-primary">View All Internships</a>
                </div>
            `;
        }
    }
});
