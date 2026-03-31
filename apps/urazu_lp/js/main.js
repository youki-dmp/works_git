document.addEventListener('DOMContentLoaded', () => {
    // Basic Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Opting not to unobserve so animations happen multiple times if desired:
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all hidden elements and observe them
    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach(el => observer.observe(el));
});
