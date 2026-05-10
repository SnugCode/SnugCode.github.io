export function stack() { 
    const STACK_DATA_URL = 'data/stack.json';
    const ICON_BASE_PATH = 'assets/icons/';

    const stackContainers = document.querySelectorAll('.stack-grid[data-stack-group]');

    if (!stackContainers.length) {
        console.error('Stack containers not found in the DOM.');
        return;
    }

    if (Array.from(stackContainers).every(container => container.children.length)) return;

    getStackData()
        .then(data => {
            stackContainers.forEach(container => {
                const group = container.dataset.stackGroup;
                const items = data[group] || [];

                container.innerHTML = '';
                items.forEach(item => {
                    const tile = createStackTile(item, ICON_BASE_PATH);
                    container.appendChild(tile);
                });
            });
        })
        .catch(error => console.error('Error loading stack data:', error));

    async function getStackData() {
        const response = await fetch(STACK_DATA_URL);
        if (!response.ok) throw new Error('Failed to load stack.json');
        return response.json();
    }

    function createStackTile(item, iconBasePath) {
        const tile = document.createElement('div');
        tile.classList.add('stack-tile'); 

        const img = document.createElement('img');
        img.classList.add('stack-icon');
        img.src = getIconSource(item.icon, iconBasePath);
        img.alt = item.label || ' ';
        img.loading = 'lazy';
        img.decoding = 'async';

        const label = document.createElement('p');
        label.classList.add('stack-label');
        label.textContent = item.label || '';

        tile.appendChild(img);
        tile.appendChild(label);

        return tile;
    }

    function getIconSource(icon, iconBasePath) {
        const source = String(icon || '');
        if (source.startsWith('data:') || source.startsWith('http') || source.startsWith('/')) {
            return source;
        }

        return iconBasePath + source;
    }
}
