export function about() {
    startTypingIntro();
}

function startTypingIntro() {
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
