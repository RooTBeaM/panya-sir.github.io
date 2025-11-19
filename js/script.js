document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const themeLabel = document.getElementById('theme-label');
    const currentTheme = localStorage.getItem('theme');

    function updateLabel(theme) {
        themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }

    if (currentTheme) {
        document.body.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
            updateLabel('dark');
        } else {
            updateLabel('light');
        }
    }

    function switchTheme(e) {
        if (e.target.checked) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            updateLabel('dark');
        } else {
            document.body.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            updateLabel('light');
        }
    }

    toggleSwitch.addEventListener('change', switchTheme, false);

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Network Animation
    const canvas = document.getElementById('network-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    function getVisibleSlides() {
        if (window.innerWidth >= 1200) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = document.querySelector('.hero').offsetHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = (Math.random() - 0.5) * 1;
            this.size = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw(color) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const particleCount = Math.floor(window.innerWidth / 10); // Responsive count
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const particleColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
        const lineColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        particles.forEach((particle, index) => {
            particle.update();
            particle.draw(particleColor);

            for (let i = index + 1; i < particles.length; i++) {
                const dx = particle.x - particles[i].x;
                const dy = particle.y - particles[i].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(particles[i].x, particles[i].y);
                    ctx.stroke();
                }
            }
        });

        animationFrameId = requestAnimationFrame(animate);
    }

    initParticles();
    animate();

    // Project Carousel Logic
    const track = document.querySelector('.carousel-track');
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const dotsContainer = document.querySelector('.carousel-dots');

    let slides = Array.from(track.children);
    const totalSlides = slides.length;

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            // Optional: Implement dot click navigation if needed, 
            // but for continuous scroll it's complex to map directly without cloning.
            // For now, dots just indicate progress.
        });
        dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    function updateDots() {
        // Find the slide that is currently "first" in the visual order (based on DOM order)
        // The original index is stored in a data attribute we should add, or we track it.
        // Simpler: We track the "active" index logically.
    }

    // We need to track the logical index of the first visible item
    let activeIndex = 0;

    function updateCarouselState(direction) {
        if (direction === 'next') {
            activeIndex = (activeIndex + 1) % totalSlides;
        } else {
            activeIndex = (activeIndex - 1 + totalSlides) % totalSlides;
        }

        dots.forEach(dot => dot.classList.remove('active'));
        dots[activeIndex].classList.add('active');
    }

    let isTransitioning = false;

    nextButton.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;

        const slideWidth = track.children[0].getBoundingClientRect().width;
        const gap = 30; // Matches CSS gap

        track.style.transition = 'transform 0.5s ease-in-out';
        track.style.transform = `translateX(-${slideWidth + gap}px)`;

        updateCarouselState('next');

        track.addEventListener('transitionend', () => {
            track.style.transition = 'none';
            track.appendChild(track.firstElementChild);
            track.style.transform = 'translateX(0)';
            isTransitioning = false;
        }, { once: true });
    });

    prevButton.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;

        const slideWidth = track.children[0].getBoundingClientRect().width;
        const gap = 30; // Matches CSS gap

        // Move last item to front immediately, shifted left
        track.style.transition = 'none';
        track.insertBefore(track.lastElementChild, track.firstElementChild);
        track.style.transform = `translateX(-${slideWidth + gap}px)`;

        // Force reflow
        void track.offsetWidth;

        // Animate to 0
        track.style.transition = 'transform 0.5s ease-in-out';
        track.style.transform = 'translateX(0)';

        updateCarouselState('prev');

        track.addEventListener('transitionend', () => {
            isTransitioning = false;
        }, { once: true });
    });

    // Update on resize - just ensure transform is reset
    window.addEventListener('resize', () => {
        track.style.transition = 'none';
        track.style.transform = 'translateX(0)';
    });
});
