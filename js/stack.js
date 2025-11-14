export function stack() { 
    const STACK_DATA_URL = '../data/stack.json';
    const ICON_BASE_PATH = '../assets/icons/';

    const coreContainer = document.querySelector('.stack-grid[data-stack-group="core"]');
    const familiarContainer = document.querySelector('.stack-grid[data-stack-group="familiar"]');

    if (!coreContainer || !familiarContainer) {
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
            const { core = [], familiar = []} = data; 

            core.forEach(item => {
                const tile = createStackTile(item, ICON_BASE_PATH);
                coreContainer.appendChild(tile);
            }); 

            familiar.forEach(item => {
                const tile = createStackTile(item, ICON_BASE_PATH); 
                familiarContainer.appendChild(tile);
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