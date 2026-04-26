export function education() {
    const tiles = Array.from(document.querySelectorAll(".education-tile"));
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
