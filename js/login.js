import { isFirebaseConfigured, login, watchAuth } from "../storage/firebase.js";

const logoSources = {
    dark: "../../assets/Logo/LogoWhite.png",
    light: "../../assets/Logo/LogoBlack.png"
};

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

function setStatus(message) {
    document.querySelector("#login-status").textContent = message;
}

document.addEventListener("DOMContentLoaded", () => {
    const storedTheme = localStorage.getItem("theme") || "dark";
    const themeToggle = document.querySelector(".theme-toggle");
    const form = document.querySelector("#login-form");

    setTheme(storedTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
            setTheme(nextTheme);
        });
    }

    if (!isFirebaseConfigured) {
        setStatus("Firebase is not configured.");
        return;
    }

    watchAuth((user) => {
        if (user) window.location.href = "dashboard.html";
    }).catch((error) => {
        setStatus(error.message);
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        setStatus("Signing in...");

        try {
            await login(
                document.querySelector("#login-email").value.trim(),
                document.querySelector("#login-password").value
            );
            window.location.href = "dashboard.html";
        } catch (error) {
            setStatus(error.message);
        }
    });
});
