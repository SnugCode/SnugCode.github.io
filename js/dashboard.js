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
let defaultIntroSequence = [];

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

function renderIntroSequence() {
    const list = document.querySelector("#intro-sequence-list");
    const sequence = getIntroSequence().sort((a, b) => a.delay - b.delay);

    if (!sequence.length) {
        list.innerHTML = '<p class="dashboard-empty-copy">No custom intro text yet. The portfolio will use the original intro.</p>';
        return;
    }

    list.innerHTML = sequence.map((item, index) => `
        <div class="dashboard-list-item">
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

function setStatus(message) {
    const status = document.querySelector("#dashboard-status");
    if (status) status.textContent = message;
}

function initIntroEditor() {
    const form = document.querySelector("#intro-form");
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

        const sequence = getIntroSequence().sort((a, b) => a.delay - b.delay);
        sequence.splice(Number(removeButton.dataset.introRemove), 1);
        saveIntroSequence(sequence);
        setStatus("Intro item removed from local draft.");
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

    if (!isFirebaseConfigured) {
        authPanel.classList.add("dashboard-auth-warning");
        setStatus("Paste your Firebase config in js/firebase.js to enable login and publishing.");
        publishButton.disabled = true;
        return;
    }

    watchAuth((user) => {
        const isSignedIn = Boolean(user);
        document.documentElement.dataset.dashboardAuth = isSignedIn ? "signed-in" : "signed-out";
        publishButton.disabled = !isSignedIn;
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

    projectList.innerHTML = projects.map((project) => `
        <div class="dashboard-list-item">
            <div>
                <h3>${esc(project.title)}</h3>
                <p>${esc(project.summary)}</p>
            </div>
            <div class="dashboard-tags">
                <span>${esc(project.status || "Unknown")}</span>
                ${project.repoPrivate ? "<span>Private repo</span>" : ""}
                ${project.live ? "<span>Live</span>" : ""}
            </div>
        </div>
    `).join("");

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

async function initDashboard() {
    const [projectsResponse, stackResponse] = await Promise.all([
        fetch("data/projects.json", { cache: "no-store" }),
        fetch("data/stack.json", { cache: "no-store" })
    ]);
    const projects = await projectsResponse.json();
    const stack = await stackResponse.json();
    const stackCount = Object.values(stack).reduce((total, group) => total + group.length, 0);

    document.querySelector("#project-count").textContent = projects.length;
    document.querySelector("#ongoing-count").textContent = projects.filter((project) => project.status === "Ongoing").length;
    document.querySelector("#private-count").textContent = projects.filter((project) => project.repoPrivate).length;
    document.querySelector("#stack-count").textContent = stackCount;

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
    initDashboard().catch((error) => {
        console.error("Error loading dashboard:", error);
    });
});
