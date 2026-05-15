export function initSectionMarker() {
    const marker = document.querySelector(".section-marker");
    if (!marker) return;

    const sections = [
        ["#intro", "#intro", "intro.mp4"],
        ["#projects", "#projects", "projects"],
        ["#stack", "#stack", "stack"],
        ["#education", "#education", "education"],
        ["footer", "#intro", "footer"]
    ].map(([selector, href, current]) => ({
        element: document.querySelector(selector),
        href,
        current
    })).filter((item) => item.element);

    if (!sections.length) return;

    function renderPath(section) {
        marker.replaceChildren();

        [
            { label: "..", href: "root.html" },
            { label: "professional", href: "#intro" },
            { label: section.current, href: section.href, current: true }
        ].forEach((part) => {
            const link = document.createElement("a");
            link.href = part.href;
            link.textContent = part.label;

            if (part.current) {
                link.setAttribute("aria-current", "location");
            }

            marker.append(link);
        });
    }

    renderPath(sections[0]);

    if (!("IntersectionObserver" in window)) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        const activeEntry = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!activeEntry) return;

        const activeSection = sections.find((section) => section.element === activeEntry.target);
        if (!activeSection || marker.querySelector('[aria-current="location"]')?.textContent === activeSection.current) return;

        marker.classList.add("is-changing");
        window.setTimeout(() => {
            renderPath(activeSection);
            marker.classList.remove("is-changing");
        }, 120);
    }, {
        threshold: [0.32, 0.5, 0.68],
        rootMargin: "-20% 0px -20% 0px"
    });

    sections.forEach((section) => observer.observe(section.element));
}
