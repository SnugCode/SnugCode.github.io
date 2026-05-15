const TRANSITION_DELAY = 520;
const LOGO_SRC = new URL("../assets/logo/LogoWhite.png", import.meta.url).href;

function createTransition() {
    const transition = document.createElement("div");
    transition.className = "page-transition is-active";
    transition.setAttribute("aria-hidden", "true");
    transition.innerHTML = `
        <div class="page-transition__panel">
            <div class="page-transition__mark">
                <img class="page-transition__logo" src="${LOGO_SRC}" alt="">
                <span class="page-transition__glitch-line page-transition__glitch-line--top"></span>
                <span class="page-transition__glitch-line page-transition__glitch-line--bottom"></span>
            </div>
            <p class="page-transition__text" data-text="Loading">Loading</p>
            <div class="page-transition__bar"></div>
        </div>
    `;

    document.body.append(transition);
    requestAnimationFrame(() => transition.classList.remove("is-active"));

    return transition;
}

function isModifiedClick(event) {
    return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function shouldTransition(link) {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("#") || link.hasAttribute("download")) {
        return false;
    }

    if (link.target && link.target !== "_self") {
        return false;
    }

    const url = new URL(href, window.location.href);

    if (url.origin !== window.location.origin) {
        return false;
    }

    if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return url.hash !== window.location.hash && !url.hash;
    }

    return true;
}

function initPageTransition() {
    const transition = createTransition();
    let isTransitioning = false;

    function transitionTo(url) {
        if (isTransitioning) {
            return;
        }

        isTransitioning = true;
        transition.classList.add("is-active");

        window.setTimeout(() => {
            window.location.href = url;
        }, TRANSITION_DELAY);
    }

    window.SnugCodeTransition = { go: transitionTo };

    window.addEventListener("pageshow", () => {
        isTransitioning = false;
        transition.classList.remove("is-active");
    });

    document.addEventListener("click", (event) => {
        const link = event.target.closest("a[href]");

        if (!link || isModifiedClick(event) || !shouldTransition(link)) {
            return;
        }

        event.preventDefault();
        transitionTo(link.href);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPageTransition, { once: true });
} else {
    initPageTransition();
}
