// This file can be used for any global functionality needed across pages

document.addEventListener('DOMContentLoaded', function() {
    // Any global initialization code can go here
    console.log('SmartStudy app initialized');
    
    // Example: Add click effect to all buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(1px)';
        });
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(0)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Check if we need to show any notifications
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('registered')) {
        alert('Registration successful! Please login with your new account.');
    }
});