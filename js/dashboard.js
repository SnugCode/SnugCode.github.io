import {
    getPortfolioContent,
    isFirebaseConfigured,
    login,
    logout,
    savePortfolioContent,
    watchAuth
} from "./firebase.js";

const logoSources = {
    dark: "assets/Logo/LogoWhite.png",
    light: "assets/Logo/LogoBlack.png"
};
const introStorageKey = "snugcodeIntroSequence";
const projectsStorageKey = "snugcodeProjects";
let defaultIntroSequence = [];
let defaultProjects = [];

const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (match) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[match]
));

function setTheme(theme) {
    const selectedTheme = theme === "light" ? "light" : "dark";
    const isDark = selectedTheme === "dark";
    const themeToggle = document.querySelector(".theme-toggle");

    document.documentElement.dataset.theme = selectedTheme;
    localStorage.setItem("theme", selectedTheme);

    document.querySelectorAll(".theme-logo").forEach((logo) => {
        logo.src = logoSources[selectedTheme];
    });

    if (themeToggle) {
        themeToggle.setAttribute("aria-pressed", String(isDark));
        themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
        themeToggle.querySelector(".theme-toggle-icon").textContent = isDark ? "☾" : "☀";
    }
}

function getIntroSequence() {
    try {
        const saved = JSON.parse(localStorage.getItem(introStorageKey) || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveIntroSequence(sequence) {
    localStorage.setItem(introStorageKey, JSON.stringify(sequence));
    renderIntroSequence();
}

function getProjectsDraft() {
    try {
        const saved = JSON.parse(localStorage.getItem(projectsStorageKey) || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveProjectsDraft(projects) {
    localStorage.setItem(projectsStorageKey, JSON.stringify(projects));
    renderProjects(projects);
    updateProjectStats(projects);
}

function renderIntroSequence() {
    const list = document.querySelector("#intro-sequence-list");
    const sequence = getIntroSequence();

    if (!sequence.length) {
        list.innerHTML = '<p class="dashboard-empty-copy">No custom intro text yet. The portfolio will use the original intro.</p>';
        return;
    }

    list.innerHTML = sequence.map((item, index) => `
        <div class="dashboard-list-item dashboard-draggable-item" draggable="true" data-intro-index="${index}">
            <span class="dashboard-drag-handle" aria-hidden="true">::</span>
            <div>
                <h3>${esc(item.text)}</h3>
                <p>Line ${esc(item.line)} · appears after ${esc(item.delay)}ms · speed ${esc(item.speed)}ms</p>
            </div>
            <button class="dashboard-small-button" type="button" data-intro-remove="${index}">Remove</button>
        </div>
    `).join("");
}

async function loadDefaultIntroSequence() {
    const response = await fetch("data/intro.json", { cache: "no-store" });
    defaultIntroSequence = await response.json();

    if (!getIntroSequence().length) {
        saveIntroSequence(defaultIntroSequence);
        setStatus("Current intro loaded as the local draft.");
    }
}

async function loadDefaultProjects() {
    const response = await fetch("data/projects.json", { cache: "no-store" });
    defaultProjects = await response.json();

    if (!getProjectsDraft().length) {
        saveProjectsDraft(defaultProjects);
    }
}

function setStatus(message) {
    const status = document.querySelector("#dashboard-status");
    if (status) status.textContent = message;
}

function initIntroEditor() {
    const form = document.querySelector("#intro-form");
    if (!form) return;

    const resetButton = document.querySelector("#intro-reset");
    const clearButton = document.querySelector("#intro-clear");
    const publishButton = document.querySelector("#intro-publish");
    const list = document.querySelector("#intro-sequence-list");

    renderIntroSequence();

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const textInput = document.querySelector("#intro-text");
        const text = textInput.value.trim();
        if (!text) return;

        const sequence = getIntroSequence();
        sequence.push({
            text,
            line: Number(document.querySelector("#intro-line").value),
            delay: Math.max(0, Number(document.querySelector("#intro-delay").value) || 0),
            speed: Math.max(20, Number(document.querySelector("#intro-speed").value) || 90)
        });

        saveIntroSequence(sequence);
        form.reset();
        document.querySelector("#intro-delay").value = 0;
        document.querySelector("#intro-speed").value = 90;
        textInput.focus();
        setStatus("Intro draft saved in this browser.");
    });

    resetButton.addEventListener("click", () => {
        saveIntroSequence(defaultIntroSequence);
        setStatus("Intro draft reset.");
    });

    clearButton.addEventListener("click", () => {
        localStorage.removeItem(introStorageKey);
        renderIntroSequence();
        setStatus("Local intro draft cleared.");
    });

    publishButton.addEventListener("click", async () => {
        try {
            await savePortfolioContent({ introSequence: getIntroSequence() });
            setStatus("Intro published to Firebase.");
        } catch (error) {
            setStatus(error.message);
        }
    });

    list.addEventListener("click", (event) => {
        const removeButton = event.target.closest("[data-intro-remove]");
        if (!removeButton) return;

        const sequence = getIntroSequence();
        sequence.splice(Number(removeButton.dataset.introRemove), 1);
        saveIntroSequence(sequence);
        setStatus("Intro item removed from local draft.");
    });

    list.addEventListener("dragstart", (event) => {
        const item = event.target.closest("[data-intro-index]");
        if (!item) return;

        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", item.dataset.introIndex);
        item.classList.add("is-dragging");
    });

    list.addEventListener("dragend", (event) => {
        event.target.closest("[data-intro-index]")?.classList.remove("is-dragging");
    });

    list.addEventListener("dragover", (event) => {
        if (!event.target.closest("[data-intro-index]")) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    });

    list.addEventListener("drop", (event) => {
        const dropTarget = event.target.closest("[data-intro-index]");
        if (!dropTarget) return;

        event.preventDefault();
        const fromIndex = Number(event.dataTransfer.getData("text/plain"));
        const toIndex = Number(dropTarget.dataset.introIndex);
        if (fromIndex === toIndex) return;

        const sequence = getIntroSequence();
        const [movedItem] = sequence.splice(fromIndex, 1);
        sequence.splice(toIndex, 0, movedItem);
        saveIntroSequence(sequence);
        setStatus("Intro order updated.");
    });
}

async function loadPublishedIntro() {
    if (!isFirebaseConfigured) return;

    try {
        const content = await getPortfolioContent();
        if (Array.isArray(content?.introSequence)) {
            saveIntroSequence(content.introSequence);
            setStatus("Published Firebase intro loaded.");
        }
    } catch (error) {
        setStatus(error.message);
    }
}

function initAuth() {
    const authPanel = document.querySelector("#dashboard-auth");
    const authForm = document.querySelector("#dashboard-login-form");
    const logoutButton = document.querySelector("#dashboard-logout");
    const publishButton = document.querySelector("#intro-publish");
    const projectsPublishButton = document.querySelector("#projects-publish");

    if (!isFirebaseConfigured) {
        authPanel.classList.add("dashboard-auth-warning");
        setStatus("Paste your Firebase config in js/firebase.js to enable login and publishing.");
        if (publishButton) publishButton.disabled = true;
        if (projectsPublishButton) projectsPublishButton.disabled = true;
        return;
    }

    watchAuth((user) => {
        const isSignedIn = Boolean(user);
        document.documentElement.dataset.dashboardAuth = isSignedIn ? "signed-in" : "signed-out";
        if (publishButton) publishButton.disabled = !isSignedIn;
        if (projectsPublishButton) projectsPublishButton.disabled = !isSignedIn;
        setStatus(isSignedIn ? `Signed in as ${user.email}.` : "Sign in to publish dashboard changes.");
    }).catch((error) => {
        setStatus(error.message);
    });

    authForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.querySelector("#dashboard-email").value.trim();
        const password = document.querySelector("#dashboard-password").value;

        try {
            await login(email, password);
        } catch (error) {
            setStatus(error.message);
        }
    });

    logoutButton.addEventListener("click", async () => {
        await logout();
    });
}

function renderProjects(projects) {
    const projectList = document.querySelector("#dashboard-projects");
    const writingList = document.querySelector("#dashboard-writing");
    const thoughts = projects.filter((project) => project.thoughts);
    const canRemoveProjects = Boolean(document.querySelector("#project-form"));

    if (projectList) {
        projectList.innerHTML = projects.map((project, index) => `
        <div class="dashboard-list-item">
            <div>
                <h3>${esc(project.title)}</h3>
                <p>${esc(project.summary)}</p>
            </div>
            <div class="dashboard-tags">
                <span>${esc(project.status || "Unknown")}</span>
                ${project.repoPrivate ? "<span>Private repo</span>" : ""}
                ${project.repo ? "<span>GitHub</span>" : ""}
                ${project.live ? "<span>Live</span>" : ""}
                ${project.thoughts ? "<span>Blog</span>" : ""}
                ${canRemoveProjects ? `<button class="dashboard-small-button" type="button" data-project-remove="${index}">Remove</button>` : ""}
            </div>
        </div>
        `).join("");
    }

    if (writingList) {
        writingList.innerHTML = thoughts.map((project) => `
        <div class="dashboard-list-item">
            <div>
                <h3>${esc(project.title)}</h3>
                <p>${project.title === "Kubera" ? "Published" : "WIP"}</p>
            </div>
            <div class="dashboard-tags">
                <span>${project.title === "Kubera" ? "Ready" : "Draft"}</span>
            </div>
        </div>
        `).join("");
    }
}

function updateProjectStats(projects) {
    const projectCount = document.querySelector("#project-count");
    const ongoingCount = document.querySelector("#ongoing-count");
    const privateCount = document.querySelector("#private-count");

    if (projectCount) projectCount.textContent = projects.length;
    if (ongoingCount) ongoingCount.textContent = projects.filter((project) => project.status === "Ongoing").length;
    if (privateCount) privateCount.textContent = projects.filter((project) => project.repoPrivate).length;
}

function initProjectEditor() {
    const form = document.querySelector("#project-form");
    if (!form) return;

    const resetButton = document.querySelector("#projects-reset");
    const publishButton = document.querySelector("#projects-publish");
    const projectList = document.querySelector("#dashboard-projects");

    renderProjects(getProjectsDraft());

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const titleInput = document.querySelector("#project-title");
        const summaryInput = document.querySelector("#project-summary");
        const title = titleInput.value.trim();
        const summary = summaryInput.value.trim();
        if (!title || !summary) return;

        const project = {
            title,
            summary,
            repo: document.querySelector("#project-repo").value.trim(),
            live: document.querySelector("#project-live").value.trim(),
            thoughts: document.querySelector("#project-thoughts").value.trim(),
            status: document.querySelector("#project-status").value,
            repoPrivate: document.querySelector("#project-private").checked
        };
        const projects = getProjectsDraft();
        projects.push(Object.fromEntries(Object.entries(project).filter(([, value]) => value !== "" && value !== false)));
        saveProjectsDraft(projects);
        form.reset();
        titleInput.focus();
        setStatus("Project draft saved in this browser.");
    });

    resetButton.addEventListener("click", () => {
        saveProjectsDraft(defaultProjects);
        setStatus("Project draft reset.");
    });

    publishButton.addEventListener("click", async () => {
        try {
            await savePortfolioContent({ projects: getProjectsDraft() });
            setStatus("Projects published to Firebase.");
        } catch (error) {
            setStatus(error.message);
        }
    });

    projectList.addEventListener("click", (event) => {
        const removeButton = event.target.closest("[data-project-remove]");
        if (!removeButton) return;

        const projects = getProjectsDraft();
        projects.splice(Number(removeButton.dataset.projectRemove), 1);
        saveProjectsDraft(projects);
        setStatus("Project removed from local draft.");
    });
}

async function loadPublishedProjects() {
    if (!isFirebaseConfigured) return;

    try {
        const content = await getPortfolioContent();
        if (Array.isArray(content?.projects)) {
            saveProjectsDraft(content.projects);
            setStatus("Published Firebase projects loaded.");
        }
    } catch (error) {
        setStatus(error.message);
    }
}

async function initDashboard() {
    const stackResponse = await fetch("data/stack.json", { cache: "no-store" });
    const stack = await stackResponse.json();
    const stackCount = Object.values(stack).reduce((total, group) => total + group.length, 0);
    const projects = getProjectsDraft();

    const stackCountElement = document.querySelector("#stack-count");
    if (stackCountElement) stackCountElement.textContent = stackCount;
    updateProjectStats(projects);
    renderProjects(projects);
}

document.addEventListener("DOMContentLoaded", () => {
    const storedTheme = localStorage.getItem("theme") || "dark";
    const themeToggle = document.querySelector(".theme-toggle");

    setTheme(storedTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
            setTheme(nextTheme);
        });
    }

    initAuth();
    loadDefaultIntroSequence()
        .catch((error) => setStatus(error.message))
        .finally(() => {
            initIntroEditor();
            loadPublishedIntro();
        });
    loadDefaultProjects()
        .then(() => {
            initProjectEditor();
            loadPublishedProjects();
            return initDashboard();
        })
        .catch((error) => {
            console.error("Error loading dashboard:", error);
            setStatus(error.message);
        });
});
