import { about } from "./about.js";
import { projects } from "./projects.js";
import { stack } from "./stack.js";
import { education } from "./education.js";
import { timeline } from "./timeline.js";

const siteTitle = "SnugCode Portfolio";
const currentYear = new Date().getFullYear();
const logoSources = {
    dark: "assets/Logo/LogoWhite.png",
    light: "assets/Logo/LogoBlack.png"
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

function initTheme() {
    const storedTheme = localStorage.getItem("theme") || "dark";
    const themeToggle = document.querySelector(".theme-toggle");

    setTheme(storedTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
            setTheme(nextTheme);
        });
    }
}

function init() {
    console.log("Welcome to " + siteTitle + " - " + currentYear);
    initTheme();
    about();
    projects();
    stack(); 
    education();
    timeline();
}

document.addEventListener("DOMContentLoaded", init);
