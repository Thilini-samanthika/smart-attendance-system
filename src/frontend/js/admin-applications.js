document.addEventListener('DOMContentLoaded', async function () {
    requireAdmin();

    const logoutBtn = document.getElementById('logoutBtn');
    const applicationsContainer = document.getElementById('applications-container');
    const statusFilter = document.getElementById('statusFilter');

    let allApplications = [];

    // Logout functionality
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        api.logout();
    });

    // Load applications
    try {
        const result = await api.getAllApplications();

        if (result.ok) {
            allApplications = result.data;
            renderApplications(allApplications);
        } else {
            applicationsContainer.innerHTML = '<div class="alert alert-danger">Failed to load applications.</div>';
        }
    } catch (error) {
        console.error('Error loading applications:', error);
        applicationsContainer.innerHTML = '<div class="alert alert-danger">Error loading applications.</div>';
    }

    // Filter functionality
    statusFilter.addEventListener('change', function () {
        const status = this.value;
        if (status) {
            const filtered = allApplications.filter(app => app.status === status);
            renderApplications(filtered);
        } else {
            renderApplications(allApplications);
        }
    });

    function renderApplications(applications) {
        if (!applications || applications.length === 0) {
            applicationsContainer.innerHTML = `
                <div class="text-center p-5 bg-light rounded">
                    <h4>No applications found</h4>
                </div>
            `;
            return;
        }

        applicationsContainer.innerHTML = applications.map(app => {
            let statusBadge = 'bg-secondary';
            if (app.status === 'Approved') statusBadge = 'bg-success';
            if (app.status === 'Rejected') statusBadge = 'bg-danger';
            if (app.status === 'Pending') statusBadge = 'bg-warning text-dark';

            // Show actions only for pending applications
            const showActions = app.status === 'Pending';

            return `
                <div class="card mb-3 shadow-sm application-card" data-id="${app.id}">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="d-flex align-items-center mb-2">
                                    <h5 class="card-title mb-0 me-2">${app.student_name}</h5>
                                    <span class="badge ${statusBadge}">${app.status}</span>
                                </div>
                                <h6 class="text-muted mb-2">Applied for: ${app.title} (${app.company})</h6>
                                <p class="mb-1"><strong>Email:</strong> ${app.student_email}</p>
                                <p class="mb-1"><strong>Course:</strong> ${app.course} (Year ${app.year})</p>
                                
                                <div class="mt-3 p-3 bg-light rounded">
                                    <strong>Cover Letter:</strong>
                                    <p class="mb-0 small">${app.cover_letter || 'No cover letter.'}</p>
                                </div>
                                
                                ${app.cv_file ? `
                                    <div class="mt-2">
                                        <i class="bi bi-paperclip"></i> 
                                        <span class="text-muted">CV Attached: ${app.cv_file}</span>
                                        <!-- Note: Real download would link to backend file URL -->
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="col-md-4 d-flex flex-column justify-content-center align-items-end border-start">
                                <div class="text-end mb-3">
                                    <small class="text-muted">Applied: ${new Date(app.applied_at).toLocaleDateString()}</small>
                                </div>
                                
                                ${showActions ? `
                                    <div class="d-grid gap-2 w-100">
                                        <button class="btn btn-success action-btn" onclick="updateStatus(${app.id}, 'approve')">
                                            Accept Application
                                        </button>
                                        <button class="btn btn-danger action-btn" onclick="updateStatus(${app.id}, 'reject')">
                                            Reject Application
                                        </button>
                                    </div>
                                ` : `
                                    <div class="alert ${app.status === 'Approved' ? 'alert-success' : 'alert-danger'} w-100 text-center mb-0">
                                        Application ${app.status}
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Expose function to window for onclick handlers
    window.updateStatus = async function (id, action) {
        if (!confirm(`Are you sure you want to ${action} this application?`)) return;

        const btn = document.querySelector(`.application-card[data-id="${id}"] .action-btn`);
        if (btn) btn.disabled = true; // Disable buttons to prevent double click

        try {
            let result;
            if (action === 'approve') {
                result = await api.approveApplication(id);
            } else {
                result = await api.rejectApplication(id);
            }

            if (result.ok) {
                // Update local state and re-render
                const appIndex = allApplications.findIndex(a => a.id === id);
                if (appIndex !== -1) {
                    allApplications[appIndex].status = action === 'approve' ? 'Approved' : 'Rejected';

                    // Re-apply filter if needed
                    const currentFilter = statusFilter.value;
                    if (currentFilter) {
                        const filtered = allApplications.filter(a => a.status === currentFilter);
                        renderApplications(filtered);
                    } else {
                        renderApplications(allApplications);
                    }
                }
            } else {
                alert('Failed to update status: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Connection error');
        }
    };
});
