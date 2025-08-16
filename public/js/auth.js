// public/js/auth.js

// This script will run on both login.html and register.html
// We first check which form exists on the current page.

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the form from reloading the page

        // Get the form data
        const username = registerForm.username.value;
        const email = registerForm.email.value;
        const password = registerForm.password.value;

        try {
            // Send the data to our backend registration API
            const res = await fetch('/api/users/register', {
                method: 'POST',
                body: JSON.stringify({ username, email, password }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();
            
            if (data.token) {
                // If registration is successful, save the token and redirect to the map
                localStorage.setItem('token', data.token);
                alert('Registration successful!');
                window.location.href = '/'; // Redirect to the main map page (index.html)
            } else {
                // Handle errors (e.g., user already exists)
                alert(data.msg || 'Registration failed.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred. Please try again.');
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get the form data
        const email = loginForm.email.value;
        const password = loginForm.password.value;

        try {
            // Send the data to our backend login API
            const res = await fetch('/api/users/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (data.token) {
                // If login is successful, save the token and redirect to the map
                localStorage.setItem('token', data.token);
                alert('Login successful!');
                window.location.href = '/'; // Redirect to the main map page
            } else {
                // Handle errors (e.g., invalid credentials)
                alert(data.msg || 'Login failed.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred. Please try again.');
        }
    });
}