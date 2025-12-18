/**
 * TICS Page Functions
 * CSP Compliant - No inline scripts
 */

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.animate-on-scroll, .feature-item, .exchange-item, .intro-text, .section-title, .chart-section, .tokenomics-section, .cta-buttons').forEach(el => {
    observer.observe(el);
});
