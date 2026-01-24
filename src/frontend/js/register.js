// Registration page functionality
document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // If already logged in, redirect to dashboard
    if (api.isLoggedIn()) {
        const role = api.getRole();
        if (role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'student-dashboard.html';
        }
        return;
    }

    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const course = document.getElementById('course').value;
        const year = document.getElementById('year').value;

        // Hide any previous messages
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';

        try {
            const result = await api.registerStudent({
                name,
                email,
                password,
                course,
                year: parseInt(year)
            });

            if (result.ok) {
                // Show success message
                successMessage.textContent = 'Registration successful! Redirecting to login...';
                successMessage.style.display = 'block';

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                // Show error message
                errorMessage.textContent = result.error || 'Registration failed. Please try again.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Registration error:', error);
            errorMessage.textContent = 'Connection error. Please make sure the server is running.';
            errorMessage.style.display = 'block';
        }
    });
});
