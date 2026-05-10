export function initTheme() {
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

function setTheme(theme) {
    const selectedTheme = theme === "light" ? "light" : "dark";
    const isDark = selectedTheme === "dark";
    const themeToggle = document.querySelector(".theme-toggle");

    document.documentElement.dataset.theme = selectedTheme;
    localStorage.setItem("theme", selectedTheme);

    document.querySelectorAll(".theme-logo").forEach((logo) => {
        setLogoSources(logo);
        logo.src = selectedTheme === "dark" ? logo.dataset.darkSrc : logo.dataset.lightSrc;
    });

    document.querySelectorAll(".theme-icon").forEach((icon) => {
        icon.src = selectedTheme === "dark" ? icon.dataset.darkSrc : icon.dataset.lightSrc;
    });

    if (themeToggle) {
        themeToggle.setAttribute("aria-pressed", String(isDark));
        themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
        themeToggle.querySelector(".theme-toggle-icon").textContent = isDark ? "☾" : "☀";
    }
}

function setLogoSources(logo) {
    if (logo.dataset.darkSrc && logo.dataset.lightSrc) return;

    const currentSource = logo.getAttribute("src") || "";
    logo.dataset.darkSrc = currentSource.replace(/Logo(?:White|Black)\.png$/, "LogoWhite.png");
    logo.dataset.lightSrc = currentSource.replace(/Logo(?:White|Black)\.png$/, "LogoBlack.png");
}
