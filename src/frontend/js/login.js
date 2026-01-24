// Login page functionality
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    // If already logged in, redirect to appropriate dashboard
    if (api.isLoggedIn()) {
        const role = api.getRole();
        if (role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'student-dashboard.html';
        }
        return;
    }

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Hide any previous error
        errorMessage.style.display = 'none';

        try {
            const result = await api.login(email, password);

            if (result.ok && result.access_token) {
                // Store token and role
                api.setToken(result.access_token);
                api.setRole(result.role);

                // Redirect based on role
                if (result.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'student-dashboard.html';
                }
            } else {
                // Show error message
                errorMessage.textContent = result.error || 'Login failed. Please check your credentials.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'Connection error. Please make sure the server is running.';
            errorMessage.style.display = 'block';
        }
    });
});
