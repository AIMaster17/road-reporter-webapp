// public/js/main.js

// This function runs as soon as the page content is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateNav(); // Call the function to update the navigation bar
});

// The main function to update the UI based on login status
async function updateNav() {
    const token = localStorage.getItem('token');
    const navContainer = document.getElementById('nav-container');

    if (token) {
        // If a token exists, try to get user data from the server
        try {
            const res = await fetch('/api/users/me', {
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                const user = await res.json();
                // If user data is fetched successfully, show their name and a logout button
                navContainer.innerHTML = `
                    <span>Welcome, <strong>${user.username}</strong>!</span>
                    <a href="#" id="logoutBtn">Logout</a>
                `;

                const logoutBtn = document.getElementById('logoutBtn');
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    alert('You have been logged out.');
                    window.location.reload(); // Reload the page to update the UI
                });
            } else {
                // If token is invalid (e.g., expired), clear it and show login/register
                localStorage.removeItem('token');
                showLoggedOutNav();
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            showLoggedOutNav();
        }
    } else {
        // If no token exists, show login/register
        showLoggedOutNav();
    }
}

function showLoggedOutNav() {
    const navContainer = document.getElementById('nav-container');
    navContainer.innerHTML = `
        <a href="/register.html">Register</a>
        <a href="/login.html">Login</a>
    `;
}