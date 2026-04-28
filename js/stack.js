export function stack() { 
    const STACK_DATA_URL = '../data/stack.json';
    const ICON_BASE_PATH = '../assets/icons/';

    const stackContainers = document.querySelectorAll('.stack-grid[data-stack-group]');

    if (!stackContainers.length) {
        console.error('Stack containers not found in the DOM.');
        return;
    }

    fetch(STACK_DATA_URL) 
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load stack.json');
            }
            return response.json();
        })
        .then(data => { 
            stackContainers.forEach(container => {
                const group = container.dataset.stackGroup;
                const items = data[group] || [];

                items.forEach(item => {
                    const tile = createStackTile(item, ICON_BASE_PATH);
                    container.appendChild(tile);
                });
            });
        })
        .catch(error => console.error('Error loading stack data:', error));

    function createStackTile(item, iconBasePath) {
        const tile = document.createElement('div');
        tile.classList.add('stack-tile'); 

        const img = document.createElement('img');
        img.classList.add('stack-icon');
        img.src = iconBasePath + item.icon; 
        img.alt = item.label || ' ';

        const label = document.createElement('p');
        label.classList.add('stack-label');
        label.textContent = item.label || '';

        tile.appendChild(img);
        tile.appendChild(label);

        return tile;
    }
}
