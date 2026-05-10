export function initFooterTyping() {
    const footer = document.querySelector("footer");
    if (!footer || footer.dataset.typingInitialized) return;

    footer.dataset.typingInitialized = "true";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        showContactIcons();
        return;
    }

    const groups = getFooterTypingGroups(footer);
    if (!groups.length) return;

    const startTyping = () => {
        if (footer.dataset.typingViewed) return;
        footer.dataset.typingViewed = "true";
        typeFooterGroups(groups);
    };

    if (!("IntersectionObserver" in window)) {
        startTyping();
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        startTyping();
    }, {
        threshold: 0.2
    });

    observer.observe(footer);
}

function getFooterTypingGroups(footer) {
    return [
        [footer.querySelector(".footer-brand p")],
        Array.from(footer.querySelectorAll(".footer-section h4")),
        [
            ...footer.querySelectorAll(".footer-section a:not(.contact-icons a)"),
            ...footer.querySelectorAll(".contact-icons span")
        ],
        [footer.querySelector(".copyright small")]
    ].map((group) => group.filter((item) => item?.textContent.trim()))
        .filter((group) => group.length);
}

async function typeFooterGroups(groups) {
    const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

    groups.flat().forEach(prepareTypingItem);

    for (const group of groups) {
        await Promise.all(group.map((item) => typeText(item, item.dataset.footerText || "")));
        group.forEach((item) => item.classList.remove("is-typing"));
        revealContactIconsAfterHeading(group);
        await wait(140);
    }
}

function revealContactIconsAfterHeading(group) {
    if (!group.some((item) => item.matches(".footer-section h4") && item.textContent.trim() === "Get in Touch")) {
        return;
    }

    showContactIcons();
}

function showContactIcons() {
    document.querySelectorAll(".contact-icons li").forEach((item, index) => {
        item.style.setProperty("--contact-icon-delay", `${index * 90}ms`);
        item.classList.add("is-visible");
    });
}

function prepareTypingItem(item) {
    const text = item.textContent;
    const rect = item.getBoundingClientRect();

    item.dataset.footerText = text;
    item.style.minWidth = `${Math.ceil(rect.width)}px`;
    item.style.minHeight = `${Math.ceil(rect.height)}px`;

    if (getComputedStyle(item).display === "inline") {
        item.style.display = "inline-block";
    }

    item.textContent = "";
}

function typeText(item, text) {
    return new Promise((resolve) => {
        let index = 0;
        item.classList.add("is-typing");

        const typeNext = () => {
            item.textContent = text.slice(0, index);

            if (index < text.length) {
                index += 1;
                window.setTimeout(typeNext, 42);
                return;
            }

            resolve();
        };

        typeNext();
    });
}
