export function about() {
    startTypingIntro();
}

function startTypingIntro() {
    const typingTarget = document.querySelector('#typing-text');
    if (!typingTarget) return;

    const text = "Hi! My name is SnugCode";
    let index = 0;

    const typeNextCharacter = () => {
        typingTarget.textContent = text.slice(0, index);

        if (index < text.length) {
            index += 1;
            setTimeout(typeNextCharacter, 90);
        }
    };

    typeNextCharacter();
}
