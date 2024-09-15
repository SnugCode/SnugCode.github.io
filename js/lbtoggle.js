const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

toggleButton.addEventListener('click', function() {

    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');
});

// Set initial mode
window.onload = function() {

    body.classList.add('light-mode');
}