export async function education() {
    const carousel = document.querySelector(".education-carousel");
    if (!carousel) return;

    if (carousel.querySelector(".education-tile")) {
        initEducationCarousel(carousel);
        return;
    }

    try {
        const educationData = await getEducationData();
        carousel.innerHTML = educationData.map((item, index) => `
            <article class="education-tile${index === 0 ? " is-active" : ""}">
                <img src="${esc(getLogoSource(item.logo))}" alt="${esc(item.alt || `${item.org} logo`)}" loading="lazy" decoding="async">
                <div class="education-copy">
                    <span class="education-org">${esc(item.org)}</span>
                    <span class="education-years">${esc(item.years)}</span>
                    <span class="education-context">${esc(item.context)}</span>
                </div>
            </article>
        `).join("");
    } catch (error) {
        console.error("Error loading education data:", error);
        carousel.innerHTML = '<p class="error">Failed to load education history.</p>';
        return;
    }

    initEducationCarousel(carousel);
}

async function getEducationData() {
    const response = await fetch("data/education.json");
    if (!response.ok) throw new Error("Failed to load education.json");
    return normalizeEducation(await response.json());
}

function initEducationCarousel(carousel) {
    const tiles = Array.from(carousel.querySelectorAll(".education-tile"));
    if (tiles.length === 0) return;

    let activeIndex = tiles.findIndex((tile) => tile.classList.contains("is-active"));
    if (activeIndex < 0) activeIndex = 0;
    let cycleTimer;
    let typingTimer;
    let typeStartTimer;

    tiles.forEach((tile) => {
        tile.querySelectorAll(".education-copy span").forEach((line) => {
            line.dataset.fullText = line.textContent.trim();
            line.textContent = "";
        });
    });

    const stopTimers = () => {
        window.clearTimeout(cycleTimer);
        window.clearTimeout(typingTimer);
        window.clearTimeout(typeStartTimer);
    };

    const typeActiveText = (tile) => {
        const lines = Array.from(tile.querySelectorAll(".education-copy span"));
        if (lines.length === 0) return;

        let lineIndex = 0;
        let characterIndex = 0;
        lines.forEach((line) => {
            line.textContent = "";
        });

        const typeNextCharacter = () => {
            const line = lines[lineIndex];
            const fullText = line.dataset.fullText || "";

            line.textContent = fullText.slice(0, characterIndex);
            characterIndex += 1;

            if (characterIndex <= fullText.length) {
                typingTimer = window.setTimeout(typeNextCharacter, 32);
                return;
            }

            lineIndex += 1;
            characterIndex = 0;

            if (lineIndex < lines.length) {
                typingTimer = window.setTimeout(typeNextCharacter, 120);
            }
        };

        typeNextCharacter();
    };

    const setActiveTile = (index) => {
        window.clearTimeout(typingTimer);
        activeIndex = index;
        const previousIndex = (activeIndex - 1 + tiles.length) % tiles.length;
        const nextIndex = (activeIndex + 1) % tiles.length;

        tiles.forEach((tile, tileIndex) => {
            const isActive = tileIndex === activeIndex;
            tile.classList.toggle("is-active", tileIndex === activeIndex);
            tile.classList.toggle("is-before", tileIndex === previousIndex);
            tile.classList.toggle("is-after", tileIndex === nextIndex);
            tile.classList.remove("is-dropping");

            if (!isActive) {
                tile.querySelectorAll(".education-copy span").forEach((line) => {
                    line.textContent = "";
                });
            }
        });

        window.clearTimeout(typeStartTimer);
        typeStartTimer = window.setTimeout(() => typeActiveText(tiles[activeIndex]), 900);
    };

    const queueNextTile = () => {
        if (tiles.length < 2) return;

        cycleTimer = window.setTimeout(() => {
            tiles[activeIndex].classList.add("is-dropping");

            cycleTimer = window.setTimeout(() => {
                setActiveTile((activeIndex + 1) % tiles.length);
                queueNextTile();
            }, 900);
        }, 6200);
    };

    tiles.forEach((tile, index) => {
        tile.addEventListener("click", () => {
            stopTimers();
            setActiveTile(index);
            queueNextTile();
        });
    });

    setActiveTile(activeIndex);
    queueNextTile();
}

function normalizeEducation(items) {
    if (!Array.isArray(items)) return [];

    return items
        .map((item) => ({
            logo: String(item.logo ?? "").trim(),
            alt: String(item.alt ?? "").trim(),
            org: String(item.org ?? "").trim(),
            years: String(item.years ?? "").trim(),
            context: String(item.context ?? "").trim()
        }))
        .filter((item) => item.logo && item.org && item.years && item.context);
}

function getLogoSource(logo) {
    const source = String(logo || "");
    if (source.startsWith("data:") || source.startsWith("http") || source.startsWith("/")) {
        return source;
    }

    return source;
}

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (match) => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[match]
    ));
}
