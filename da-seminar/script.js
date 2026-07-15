/**
 * Data Analytics Seminar - Core Interaction Engine
 * Features: Scroll-spy, Interactive Quizzes, Progress Tracking, Accordion
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollSpy();
    initProgressBar();
    initMobileMenu();
    initAccordions();
    animateOnScroll();
    initQuizzes();
});

// 1. Progress Bar Logic
function initProgressBar() {
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        document.getElementById('progressBar').style.width = scrolled + "%";
    });
}

// 2. Scroll Spy Navigation
function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.toc-list a');

    window.addEventListener('scroll', () => {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
}

// 3. Quiz Interaction
function initQuizzes() {
    const quizOptions = document.querySelectorAll('.quiz-option');
    quizOptions.forEach(button => {
        button.addEventListener('click', () => {
            const container = button.closest('.checkpoint');
            const feedback = container.querySelector('.quiz-feedback');
            const allOptions = container.querySelectorAll('.quiz-option');
            const isCorrect = button.getAttribute('data-correct') === 'true';
            const feedbackText = button.getAttribute('data-feedback');

            // Disable all buttons after selection
            allOptions.forEach(opt => opt.disabled = true);

            if (isCorrect) {
                button.classList.add('correct');
                feedback.innerText = "✓ " + feedbackText;
                feedback.className = "quiz-feedback correct";
            } else {
                button.classList.add('incorrect');
                feedback.innerText = "✗ " + feedbackText;
                feedback.className = "quiz-feedback incorrect";
            }
        });
    });
}

// 4. Accordion Logic
function initAccordions() {
    const triggers = document.querySelectorAll('.accordion-trigger');
    
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const expanded = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', !expanded);
            
            const panel = trigger.nextElementSibling;
            if (!expanded) {
                panel.style.maxHeight = panel.scrollHeight + "px";
            } else {
                panel.style.maxHeight = "0";
            }
        });
    });
}

// 5. Mobile Menu
function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const toc = document.querySelector('.toc');
    const links = document.querySelectorAll('.toc-list a');

    toggle.addEventListener('click', () => {
        const isOpen = toc.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen);
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            toc.classList.remove('open');
        });
    });
}

// 6. Intersection Observer for Scroll Animations
function animateOnScroll() {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

// (End of script.js)

