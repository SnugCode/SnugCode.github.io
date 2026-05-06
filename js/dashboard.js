import {
    getPortfolioContent,
    isFirebaseConfigured,
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
const stackStorageKey = "snugcodeStack";
let defaultIntroSequence = [];
let defaultProjects = [];
let defaultStack = {};
let uploadedStackIcon = "";

const stackSections = {
    frontend: "Frontend",
    backend: "Backend",
    dataCloud: "Data & Cloud",
    systemsTools: "Systems & Tools"
};

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

function getStackDraft() {
    try {
        const saved = JSON.parse(localStorage.getItem(stackStorageKey) || "{}");
        return normalizeStack(saved);
    } catch {
        return normalizeStack({});
    }
}

function saveStackDraft(stack) {
    localStorage.setItem(stackStorageKey, JSON.stringify(normalizeStack(stack)));
    renderStack();
    updateStackStats();
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

async function loadDefaultStack() {
    const response = await fetch("data/stack.json", { cache: "no-store" });
    defaultStack = normalizeStack(await response.json());

    if (!Object.values(getStackDraft()).some((items) => items.length)) {
        saveStackDraft(defaultStack);
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
    const logoutButton = document.querySelector("#dashboard-logout");
    const publishButton = document.querySelector("#intro-publish");
    const projectsPublishButton = document.querySelector("#projects-publish");
    const stackPublishButton = document.querySelector("#stack-publish");

    if (!isFirebaseConfigured) {
        authPanel.classList.add("dashboard-auth-warning");
        document.documentElement.dataset.dashboardAuth = "signed-out";
        setStatus("Unauthorized access.");
        if (publishButton) publishButton.disabled = true;
        if (projectsPublishButton) projectsPublishButton.disabled = true;
        if (stackPublishButton) stackPublishButton.disabled = true;
        return;
    }

    watchAuth((user) => {
        const isSignedIn = Boolean(user);
        document.documentElement.dataset.dashboardAuth = isSignedIn ? "signed-in" : "signed-out";
        if (publishButton) publishButton.disabled = !isSignedIn;
        if (projectsPublishButton) projectsPublishButton.disabled = !isSignedIn;
        if (stackPublishButton) stackPublishButton.disabled = !isSignedIn;
        setStatus(isSignedIn ? `Signed in as ${user.email}.` : "Unauthorized access.");
    }).catch((error) => {
        document.documentElement.dataset.dashboardAuth = "signed-out";
        setStatus(error.message);
    });

    logoutButton.addEventListener("click", async () => {
        await logout();
        window.location.href = "login.html";
    });
}

function normalizeStack(stack) {
    return Object.keys(stackSections).reduce((normalized, section) => {
        const items = Array.isArray(stack?.[section]) ? stack[section] : [];
        normalized[section] = items
            .map((item) => ({
                label: String(item.label ?? "").trim(),
                icon: String(item.icon ?? "").trim()
            }))
            .filter((item) => item.label && item.icon);
        return normalized;
    }, {});
}

function getStackIconSource(icon) {
    const source = String(icon || "");
    if (source.startsWith("data:") || source.startsWith("http") || source.startsWith("/")) {
        return source;
    }

    return `assets/icons/${source}`;
}

function renderStack() {
    const list = document.querySelector("#dashboard-stack");
    if (!list) return;

    const stack = getStackDraft();
    const rows = Object.entries(stack).flatMap(([section, items]) => (
        items.map((item, index) => ({ ...item, section, index }))
    ));

    if (!rows.length) {
        list.innerHTML = '<p class="dashboard-empty-copy">No stack items yet.</p>';
        return;
    }

    list.innerHTML = rows.map((item) => `
        <div class="dashboard-list-item">
            <img class="dashboard-stack-icon" src="${esc(getStackIconSource(item.icon))}" alt="">
            <div>
                <h3>${esc(item.label)}</h3>
                <p>${esc(stackSections[item.section])}</p>
            </div>
            <div class="dashboard-tags">
                <button class="dashboard-small-button" type="button" data-stack-edit-section="${esc(item.section)}" data-stack-edit-index="${item.index}">Edit</button>
                <button class="dashboard-small-button" type="button" data-stack-remove-section="${esc(item.section)}" data-stack-remove-index="${item.index}">Remove</button>
            </div>
        </div>
    `).join("");
}

function updateStackStats() {
    const stackCountElement = document.querySelector("#stack-count");
    if (!stackCountElement) return;

    const stack = getStackDraft();
    stackCountElement.textContent = Object.values(stack).reduce((total, group) => total + group.length, 0);
}

function readSvgFile(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve("");
            return;
        }

        if (file.type !== "image/svg+xml" && !file.name.toLowerCase().endsWith(".svg")) {
            reject(new Error("Please upload an SVG file."));
            return;
        }

        if (file.size > 200 * 1024) {
            reject(new Error("Please keep SVG icons under 200 KB."));
            return;
        }

        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(String(reader.result || "")));
        reader.addEventListener("error", () => reject(new Error("Could not read the SVG file.")));
        reader.readAsDataURL(file);
    });
}

function resetStackForm() {
    const form = document.querySelector("#stack-form");
    if (!form) return;

    form.reset();
    uploadedStackIcon = "";
    document.querySelector("#stack-edit-index").value = "";
    document.querySelector("#stack-submit").textContent = "Add Stack Item";
    document.querySelector("#stack-cancel-edit").hidden = true;
}

function initStackEditor() {
    const form = document.querySelector("#stack-form");
    if (!form) return;

    const iconInput = document.querySelector("#stack-icon");
    const resetButton = document.querySelector("#stack-reset");
    const publishButton = document.querySelector("#stack-publish");
    const cancelEditButton = document.querySelector("#stack-cancel-edit");
    const list = document.querySelector("#dashboard-stack");

    renderStack();

    iconInput.addEventListener("change", async () => {
        try {
            uploadedStackIcon = await readSvgFile(iconInput.files[0]);
            setStatus(uploadedStackIcon ? "SVG icon ready." : "No SVG selected.");
        } catch (error) {
            uploadedStackIcon = "";
            iconInput.value = "";
            setStatus(error.message);
        }
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const label = document.querySelector("#stack-title").value.trim();
        const section = document.querySelector("#stack-section").value;
        const editIndex = document.querySelector("#stack-edit-index").value;
        const stack = getStackDraft();

        if (!label || !section) return;

        if (editIndex) {
            const [oldSection, oldIndexValue] = editIndex.split(":");
            const oldIndex = Number(oldIndexValue);
            const currentItem = stack[oldSection]?.[oldIndex];
            if (!currentItem) return;

            const nextItem = {
                label,
                icon: uploadedStackIcon || currentItem.icon
            };
            stack[oldSection].splice(oldIndex, 1);
            stack[section].push(nextItem);
            saveStackDraft(stack);
            resetStackForm();
            setStatus("Stack item updated.");
            return;
        }

        if (!uploadedStackIcon) {
            setStatus("Upload an SVG icon before adding the stack item.");
            return;
        }

        stack[section].push({ label, icon: uploadedStackIcon });
        saveStackDraft(stack);
        resetStackForm();
        setStatus("Stack item added to local draft.");
    });

    resetButton.addEventListener("click", () => {
        saveStackDraft(defaultStack);
        resetStackForm();
        setStatus("Stack draft reset.");
    });

    publishButton.addEventListener("click", async () => {
        try {
            await savePortfolioContent({ stack: getStackDraft() });
            setStatus("Stack published to Firebase.");
        } catch (error) {
            setStatus(error.message);
        }
    });

    cancelEditButton.addEventListener("click", () => {
        resetStackForm();
        setStatus("Stack edit cancelled.");
    });

    list.addEventListener("click", (event) => {
        const editButton = event.target.closest("[data-stack-edit-section]");
        const removeButton = event.target.closest("[data-stack-remove-section]");
        const stack = getStackDraft();

        if (editButton) {
            const section = editButton.dataset.stackEditSection;
            const index = Number(editButton.dataset.stackEditIndex);
            const item = stack[section]?.[index];
            if (!item) return;

            document.querySelector("#stack-title").value = item.label;
            document.querySelector("#stack-section").value = section;
            document.querySelector("#stack-edit-index").value = `${section}:${index}`;
            document.querySelector("#stack-submit").textContent = "Update Stack Item";
            cancelEditButton.hidden = false;
            uploadedStackIcon = "";
            iconInput.value = "";
            setStatus("Editing stack item. Upload a new SVG only if you want to replace the icon.");
            return;
        }

        if (removeButton) {
            const section = removeButton.dataset.stackRemoveSection;
            const index = Number(removeButton.dataset.stackRemoveIndex);
            stack[section]?.splice(index, 1);
            saveStackDraft(stack);
            resetStackForm();
            setStatus("Stack item removed from local draft.");
        }
    });
}

async function loadPublishedStack() {
    if (!isFirebaseConfigured) return;

    try {
        const content = await getPortfolioContent();
        if (content?.stack && typeof content.stack === "object") {
            saveStackDraft(content.stack);
            setStatus("Published Firebase stack loaded.");
        }
    } catch (error) {
        setStatus(error.message);
    }
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
    const projects = getProjectsDraft();

    updateStackStats();
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
    loadDefaultStack()
        .then(() => {
            initStackEditor();
            loadPublishedStack();
        })
        .catch((error) => {
            console.error("Error loading stack:", error);
            setStatus(error.message);
        });
});
