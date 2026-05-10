export function initSectionMarker() {
    const marker = document.querySelector(".section-marker");
    if (!marker) return;

    const sections = [
        ["#intro", "/intro.mp4"],
        ["#projects", "projects/"],
        ["#stack", "stack/"],
        ["#education", "education/"],
        ["footer", "footer/"]
    ].map(([selector, label]) => ({
        element: document.querySelector(selector),
        label
    })).filter((item) => item.element);

    if (!sections.length) return;

    if (!("IntersectionObserver" in window)) {
        marker.textContent = sections[0].label;
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        const activeEntry = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!activeEntry) return;

        const activeSection = sections.find((section) => section.element === activeEntry.target);
        if (!activeSection || marker.textContent === activeSection.label) return;

        marker.classList.add("is-changing");
        window.setTimeout(() => {
            marker.textContent = activeSection.label;
            marker.classList.remove("is-changing");
        }, 120);
    }, {
        threshold: [0.32, 0.5, 0.68],
        rootMargin: "-20% 0px -20% 0px"
    });

    sections.forEach((section) => observer.observe(section.element));
}
