import { getPortfolioContent, isFirebaseConfigured } from "./firebase.js";

export function about() {
    startTypingIntro();
}

async function startTypingIntro() {
    const lineOne = document.querySelector('#typing-line-1');
    const lineTwo = document.querySelector('#typing-line-2');
    const cursor = document.querySelector('#typing-cursor');
    if (!lineOne || !lineTwo || !cursor) return;

    const typeLine = (target, text, delay, onComplete) => {
        let index = 0;
        target.insertAdjacentElement('afterend', cursor);

        const typeNextCharacter = () => {
            target.textContent = text.slice(0, index);
            target.insertAdjacentElement('afterend', cursor);

            if (index < text.length) {
                index += 1;
                setTimeout(typeNextCharacter, delay);
                return;
            }

            onComplete?.();
        };

        typeNextCharacter();
    };

    const eraseLine = (target, delay, onComplete) => {
        target.insertAdjacentElement('afterend', cursor);

        const eraseNextCharacter = () => {
            const currentText = target.textContent ?? "";
            target.textContent = currentText.slice(0, -1);
            target.insertAdjacentElement('afterend', cursor);

            if (target.textContent) {
                setTimeout(eraseNextCharacter, delay);
                return;
            }

            onComplete?.();
        };

        eraseNextCharacter();
    };

    const savedSequence = await getSavedIntroSequence();
    if (savedSequence.length) {
        lineOne.textContent = "";
        lineTwo.textContent = "";
        runSavedIntroSequence(savedSequence, typeLine, eraseLine, lineOne, lineTwo);
        return;
    }

    runOriginalIntro(typeLine, eraseLine, lineOne, lineTwo);
}

async function getSavedIntroSequence() {
    if (isFirebaseConfigured) {
        try {
            const content = await getPortfolioContent();
            const sequence = normalizeIntroSequence(content?.introSequence);
            if (sequence.length) return sequence;
        } catch (error) {
            console.error("Error loading Firebase intro sequence:", error);
        }
    }

    try {
        const sequence = JSON.parse(localStorage.getItem("snugcodeIntroSequence") || "[]");
        return normalizeIntroSequence(sequence);
    } catch {
        return [];
    }
}

async function runSavedIntroSequence(sequence, typeLine, eraseLine, lineOne, lineTwo) {
    const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
    const type = (target, text, speed) => new Promise((resolve) => typeLine(target, text, speed, resolve));
    const erase = (target, speed) => new Promise((resolve) => eraseLine(target, speed, resolve));
    let previousDelay = 0;

    for (const item of sequence) {
        await wait(Math.max(0, item.delay - previousDelay));

        if (item.line === 1) {
            if (lineTwo.textContent) await erase(lineTwo, 70);
            if (lineOne.textContent) await erase(lineOne, 70);
            await type(lineOne, item.text, item.speed);
        } else {
            if (lineTwo.textContent) await erase(lineTwo, 70);
            await type(lineTwo, item.text, item.speed);
        }

        previousDelay = item.delay;
    }
}

function runOriginalIntro(typeLine, eraseLine, lineOne, lineTwo) {
    typeLine(lineOne, "Hi!", 140, () => {
        setTimeout(() => {
            typeLine(lineTwo, "Nice to meet you.", 90, () => {
                setTimeout(() => {
                    eraseLine(lineTwo, 70, () => {
                        eraseLine(lineOne, 70, () => {
                            typeLine(lineOne, "My name is SnugCode.", 90, () => {
                                setTimeout(() => {
                                    eraseLine(lineOne, 70, () => {
                                        typeLine(lineOne, "Welcome to my portfolio.", 90, () => {
                                            setTimeout(() => {
                                                typeLine(lineTwo, "Feel free to poke around.", 90);
                                            }, 1400);
                                        });
                                    });
                                }, 1600);
                            });
                        });
                    });
                }, 1600);
            });
        }, 2200);
    });
}

function normalizeIntroSequence(sequence) {
    if (!Array.isArray(sequence)) return [];

    return sequence
        .map((item) => ({
            text: String(item.text ?? "").trim(),
            line: Number(item.line) === 2 ? 2 : 1,
            delay: Math.max(0, Number(item.delay) || 0),
            speed: Math.max(20, Number(item.speed) || 90)
        }))
        .filter((item) => item.text);
}
