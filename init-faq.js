/**
 * FAQ Page Functions
 * CSP Compliant - No inline scripts
 */

function toggleFaq(button) {
    const answer = button.nextElementSibling;
    const isActive = button.classList.contains('active');
    
    // Close all other answers
    document.querySelectorAll('.faq-question').forEach(q => {
        q.classList.remove('active');
        q.nextElementSibling.classList.remove('active');
    });
    
    // Toggle current answer
    if (!isActive) {
        button.classList.add('active');
        answer.classList.add('active');
    }
}
