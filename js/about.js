export function about() {
    startCarousel();
}

function startCarousel() {
    const images = document.querySelectorAll('#about .carousel img');
    if (!images.length) return;
    
    let index = 0;

    images[index].classList.add('active');

    setInterval(() => {
        images[index].classList.remove('active');
        index = (index + 1) % images.length;
        images[index].classList.add('active');
    }, 4000);
}