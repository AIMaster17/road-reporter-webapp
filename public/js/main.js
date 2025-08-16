// public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const navContainer = document.getElementById('nav-container');

    if (token) {
        // If the user is logged in
        // For now, we don't know the username, so we'll just show a generic greeting.
        // In a more advanced version, we'd get the username from the server.
        navContainer.innerHTML = `
            <span>Welcome!</span>
            <a href="#" id="logoutBtn">Logout</a>
        `;

        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token'); // Remove the token
            alert('You have been logged out.');
            window.location.href = '/login.html'; // Redirect to login page
        });
    } else {
        // If the user is not logged in
        navContainer.innerHTML = `
            <a href="/register.html">Register</a>
            <a href="/login.html">Login</a>
        `;
    }
});