const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

toggleButton.addEventListener('change', function() {

    if (this.checked) {

        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
    } else {

        body.classList.add('light-mode');
        body.classList.remove('dark-mode');
    }
});

// Set initial mode
window.onload = function() {
    body.classList.add('light-mode');
}
