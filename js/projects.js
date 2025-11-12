export async function projects() {
    const grid = document.querySelector(".grid");
    if (!grid) return;

    try {
        const res = await fetch('../data/projects.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch projects data'); 
        const projects = await res.json();
        grid.innerHTML = projects.map(cardHTML).join('');
    } catch (e) {
        console.error('Error loading projects:', e); 
        grid.innerHTML = '<p class="error">Failed to load projects. Please try again later.</p>';
    }
}

function cardHTML(p) {
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]
        )
    );
    return `
        <article class="project-card">
            <figure class="project-media">
                <img src="${esc(p.image)}" alt="${esc(p.title)} cover">
            </figure>
            <div class="project-body">
                <h3>${esc(p.title)}</h3>
                <p>${esc(p.summary)}</p>
            </div>
            <div class="project-actions">
                ${p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener" aria-label="GitHub">${iconGitHub}</a>` : ''}
                ${p.live ? `<a href="${esc(p.live)}" target="_blank" rel="noopener" aria-label="Live site">${iconExternal}</a>` : ''}
                ${p.thoughts ? `<a href="${esc(p.thoughts)}" aria-label="My thoughts">${iconNotes}</a>` : ''}
            </div>
        </article>`;
} 

const iconGitHub = `
<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M12 .5A12 12 0 0 0 0 12.7c0 5.4 3.4 9.9 8.2 11.5.6.1.8-.3.8-.6v-2c-3.3.8-4-1.5-4-1.5-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.3 1.8 1.3 1.1 1.9 3 1.3 3.7 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.4-5.5-6.1 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.4 1.2a11.3 11.3 0 0 1 6.2 0c2.4-1.5 3.4-1.2 3.4-1.2.6 1.7.2 3 .1 3.3.8.9 1.2 2 1.2 3.3 0 4.8-2.8 5.8-5.5 6.1.5.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.5A12 12 0 0 0 12 .5Z"/>
</svg>`; 

const iconExternal = `
<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/>
</svg>`;

const iconNotes = `
<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M6 2h9a3 3 0 0 1 3 3v15a2 2 0 0 1-2 2H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Zm2 6h7v2H8V8Zm0 4h7v2H8v-2Z"/>
</svg>`;
