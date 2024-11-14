// index.js

// Function to load HTML content
function loadHTML(id, url) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${url}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;
        })
        .catch(error => console.error(error));
}

// Load header and footer
loadHTML('header', 'header.html');
loadHTML('footer', 'footer.html');
