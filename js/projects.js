export async function projects() {
    const showcase = document.querySelector('.project-showcase');
    if (!showcase) return;

    let data;
    try {
        data = await getProjectData();
    } catch (e) {
        console.error('Error loading projects:', e);
        showcase.innerHTML = '<p class="error">Failed to load projects.</p>';
        return;
    }

    if (!data.length) return;

    let current = 0;
    let busy = false;

    function render(idx) {
        const p = data[idx];
        const n = data.length;

        showcase.innerHTML = `
            <div class="project-showcase-meta">
                <span class="project-showcase-index">${pad(idx + 1)}</span>
                <span aria-hidden="true"> / </span>
                <span class="project-showcase-total">${pad(n)}</span>
            </div>
            <div class="project-showcase-body">
                <div class="project-showcase-info">
                    <h2 class="project-showcase-title">${esc(p.title)}</h2>
                    <p class="project-showcase-summary">${esc(p.summary)}</p>
                    ${techHTML(p)}
                    ${statusHTML(p)}
                    <div class="project-actions">${actionsHTML(p)}</div>
                </div>
                ${mediaHTML(p)}
            </div>
            <div class="project-showcase-nav">
                <button class="project-nav-btn project-nav-prev" aria-label="Previous project">&#8592;</button>
                <div class="project-nav-dots">
                    ${data.map((d, i) => `<button class="project-nav-dot${i === idx ? ' is-active' : ''}" aria-label="${esc(d.title)}" data-index="${i}"></button>`).join('')}
                </div>
                <button class="project-nav-btn project-nav-next" aria-label="Next project">&#8594;</button>
            </div>`;

        showcase.querySelector('.project-nav-prev').addEventListener('click', () => go(-1));
        showcase.querySelector('.project-nav-next').addEventListener('click', () => go(1));
        showcase.querySelectorAll('.project-nav-dot').forEach(dot => {
            dot.addEventListener('click', () => goTo(+dot.dataset.index));
        });
    }

    function go(dir) {
        goTo((current + dir + data.length) % data.length);
    }

    function goTo(idx) {
        if (busy || idx === current) return;
        busy = true;

        const body = showcase.querySelector('.project-showcase-body');
        body.classList.add('is-leaving');

        setTimeout(() => {
            current = idx;
            render(idx);
            const newBody = showcase.querySelector('.project-showcase-body');
            newBody.classList.add('is-entering');
            requestAnimationFrame(() => requestAnimationFrame(() => {
                newBody.classList.remove('is-entering');
                busy = false;
            }));
        }, 200);
    }

    render(0);

    const section = document.getElementById('projects');
    window.addEventListener('keydown', e => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.65 && rect.bottom > window.innerHeight * 0.35) {
            if (e.key === 'ArrowLeft') go(-1);
            if (e.key === 'ArrowRight') go(1);
        }
    });
}

async function getProjectData() {
    const res = await fetch('data/projects.json');
    if (!res.ok) throw new Error('Failed to fetch projects data');
    return res.json();
}

function pad(n) {
    return String(n).padStart(2, '0');
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
);

function mediaHTML(p) {
    if (p.image) {
        return `<div class="project-showcase-media">
            <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" decoding="async">
        </div>`;
    }
    return `<div class="project-showcase-media project-showcase-placeholder" aria-hidden="true">
        <span>${esc(p.title).slice(0, 1)}</span>
    </div>`;
}

function techHTML(p) {
    if (!p.tech?.length) return '';
    return `<div class="project-tech">${p.tech.map(t => `<span class="project-tech-tag">${esc(t)}</span>`).join('')}</div>`;
}

function statusHTML(p) {
    if (!p.status) return '';
    const cls = String(p.status).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `<p class="project-status">Status: <span class="project-status-${esc(cls)}">${esc(p.status)}</span></p>`;
}

function actionsHTML(p) {
    const repo = p.repoPrivate
        ? `<a class="project-action-disabled" aria-label="GitHub" aria-disabled="true" data-tooltip="This Github Repo is Private">${iconGitHub}</a>`
        : p.repo
            ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener" aria-label="GitHub" data-tooltip="GitHub Repo">${iconGitHub}</a>`
            : '';
    const live = p.live
        ? `<a href="${esc(p.live)}" target="_blank" rel="noopener" aria-label="Live site" data-tooltip="Go to Live Website">${iconExternal}</a>`
        : '';
    const thoughts = p.thoughts
        ? p.thoughtsWip
            ? `<a class="project-action-disabled" aria-label="My thoughts" aria-disabled="true" data-tooltip="My Thoughts are WIP">${iconNotes}</a>`
            : `<a href="${esc(p.thoughts)}" aria-label="My thoughts" data-tooltip="My Thoughts">${iconNotes}</a>`
        : '';
    return repo + live + thoughts;
}

const iconGitHub = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5A12 12 0 0 0 0 12.7c0 5.4 3.4 9.9 8.2 11.5.6.1.8-.3.8-.6v-2c-3.3.8-4-1.5-4-1.5-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.3 1.8 1.3 1.1 1.9 3 1.3 3.7 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.4-5.5-6.1 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.4 1.2a11.3 11.3 0 0 1 6.2 0c2.4-1.5 3.4-1.2 3.4-1.2.6 1.7.2 3 .1 3.3.8.9 1.2 2 1.2 3.3 0 4.8-2.8 5.8-5.5 6.1.5.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.5A12 12 0 0 0 12 .5Z"/></svg>`;

const iconExternal = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/></svg>`;

const iconNotes = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 2h9a3 3 0 0 1 3 3v15a2 2 0 0 1-2 2H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Zm2 6h7v2H8V8Zm0 4h7v2H8v-2Z"/></svg>`;
