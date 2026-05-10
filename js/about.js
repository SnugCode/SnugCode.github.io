export function about() {
    startTypingIntro();
}

async function startTypingIntro() {
    const lineOne = document.querySelector('#typing-line-1');
    const lineTwo = document.querySelector('#typing-line-2');
    const cursor = document.querySelector('#typing-cursor');
    const wave = document.querySelector('.intro-wave');
    const nameMark = document.querySelector('.intro-name-mark');
    const emailAction = document.querySelector('.intro-email-action');
    const linkedInAction = document.querySelector('.intro-linkedin-action');
    const blogAction = document.querySelector('.intro-blog-action');
    const scrollCue = document.querySelector('.intro-scroll-cue');
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

    runIntroSequence({
        typeLine,
        eraseLine,
        lineOne,
        lineTwo,
        wave,
        nameMark,
        emailAction,
        linkedInAction,
        blogAction,
        scrollCue
    });
}

async function runIntroSequence({
    typeLine,
    eraseLine,
    lineOne,
    lineTwo,
    wave,
    nameMark,
    emailAction,
    linkedInAction,
    blogAction,
    scrollCue
}) {
    const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
    const type = (target, text, speed) => new Promise((resolve) => typeLine(target, text, speed, resolve));
    const erase = (target, speed) => new Promise((resolve) => eraseLine(target, speed, resolve));
    const clearLines = async () => {
        if (lineTwo.textContent) await erase(lineTwo, 50);
        if (lineOne.textContent) await erase(lineOne, 50);
    };

    wave?.classList.add("is-visible");
    await type(lineOne, "Hi!", 140);
    await wait(450);
    await type(lineTwo, "Nice to meet you.", 85);

    await wait(1800);
    wave?.classList.remove("is-visible");
    await clearLines();

    await type(lineOne, "My name is", 85);
    nameMark?.classList.add("is-visible");

    await wait(1800);
    nameMark?.classList.remove("is-visible");
    await clearLines();

    await type(lineOne, "Welcome to my portfolio.", 80);
    await wait(500);
    const explorePrompt = getExplorePrompt();
    await type(lineTwo, explorePrompt, 80);
    if (explorePrompt.includes("scroll down")) {
        scrollCue?.classList.add("is-visible");
    }

    await wait(1700);
    scrollCue?.classList.remove("is-visible");
    await clearLines();

    await type(lineOne, "If you wanna get in touch with me;", 62);
    await wait(350);
    await type(lineTwo, "These are for you.", 70);
    emailAction?.classList.add("is-visible");
    linkedInAction?.classList.add("is-visible");

    await wait(1900);
    emailAction?.classList.remove("is-visible");
    linkedInAction?.classList.remove("is-visible");
    await wait(320);
    emailAction?.classList.add("is-retired");
    linkedInAction?.classList.add("is-retired");
    await clearLines();

    await type(lineOne, "If you want to read my thoughts?", 62);
    await wait(350);
    await type(lineTwo, "Feel free to checkout my blog page.", 62);
    blogAction?.classList.add("is-visible");
}

function getExplorePrompt() {
    return window.matchMedia("(max-width: 780px)").matches
        ? "Feel free to poke around."
        : "Feel free to scroll down.";
}
