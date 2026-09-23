// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// Lenis Smooth Scroll Initialization
// ==========================================================================
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Removed redundant requestAnimationFrame loop to prevent double-calling lenis.raf

// Integrate Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// ==========================================================================
// Preloader Animation
// ==========================================================================
window.addEventListener('load', () => {
    let counterElement = document.querySelector('.counter');
    let count = 0;
    
    // Fake loading counter
    let interval = setInterval(() => {
        count += Math.floor(Math.random() * 10) + 1;
        if(count > 100) count = 100;
        counterElement.innerText = count + '%';
        
        if(count === 100) {
            clearInterval(interval);
            
            // Animate preloader away
            gsap.to('.preloader', {
                yPercent: -100,
                duration: 1,
                onComplete: () => {
                    document.querySelector('.preloader').style.display = 'none';
                    initHeroAnimations();
                }
            });
        }
    }, 30);
});

// ==========================================================================
// Page Animations
// ==========================================================================
function initHeroAnimations() {
    // Hero Text Clip-path reveal
    gsap.fromTo('.hero-title', 
        { clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)', y: 100 },
        { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', y: 0, duration: 1.5, stagger: 0.2, ease: "power4.out" }
    );
    
    // Hero Image Clip-path reveal
    gsap.to('.hero-image-container', {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        duration: 1.5,
        ease: "power4.inOut",
        delay: 0.5
    });
    
    // Fade in small text
    gsap.fromTo('.fade-in-text', 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.2, delay: 1 }
    );

    initScrollTriggers();
}

function initScrollTriggers() {
    // Parallax on Hero Image
    gsap.to('.parallax-img', {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // Massive Text Split Animation
    const splitTypes = document.querySelectorAll('.split-text');
    splitTypes.forEach((char,i) => {
        const text = new SplitType(char, { types: 'chars,words' });
        
        gsap.to(text.chars, {
            scrollTrigger: {
                trigger: char,
                start: 'top 80%',
                end: 'top 20%',
                scrub: true,
            },
            y: 0,
            opacity: 1,
            stagger: 0.1,
            ease: "power2.out"
        });
    });

    // Horizontal Scroll for Projects
    // Use GSAP matchMedia for responsive ScrollTriggers
    let mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
        let projectsContainer = document.querySelector(".projects-container");
        
        gsap.to(projectsContainer, {
            x: () => -(projectsContainer.scrollWidth - window.innerWidth) + "px",
            ease: "none",
            scrollTrigger: {
                trigger: ".projects-horizontal",
                pin: true,
                scrub: 1,
                end: () => "+=" + projectsContainer.scrollWidth
            }
        });
    });
}

// ==========================================================================
// Custom Magnetic Cursor
// ==========================================================================
const cursor = document.getElementById('custom-cursor');
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

// Update cursor target based on mouse move
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Animate cursor to target using requestAnimationFrame
function animateCursor() {
    let speed = 0.2; // Ease speed
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    requestAnimationFrame(animateCursor);
}

if (window.matchMedia("(pointer: fine)").matches) {
    animateCursor();
    
    // Add active state on links and buttons
    const hoverables = document.querySelectorAll('a, button, .magnetic-btn');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('active'));
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            // Reset magnetic button position
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        });
        
        // Magnetic button physics
        if(el.classList.contains('magnetic-btn')) {
            el.addEventListener('mousemove', (e) => {
                const strength = el.dataset.strength || 20;
                const rect = el.getBoundingClientRect();
                const offsetX = e.clientX - rect.left - rect.width / 2;
                const offsetY = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(el, {
                    x: (offsetX / rect.width) * strength,
                    y: (offsetY / rect.height) * strength,
                    duration: 0.5,
                    ease: "power2.out"
                });
            });
            
            // Robust click handling to avoid drag/transform cancellation
            let isClickValid = false;
            el.addEventListener('mousedown', () => isClickValid = true);
            el.addEventListener('mouseleave', () => isClickValid = false);
            
            el.addEventListener('mouseup', (e) => {
                if (isClickValid && el.tagName.toLowerCase() === 'a') {
                    const href = el.getAttribute('href');
                    if (href) {
                        const tempLink = document.createElement('a');
                        tempLink.href = href;
                        if (el.getAttribute('target')) {
                            tempLink.target = el.getAttribute('target');
                        }
                        document.body.appendChild(tempLink);
                        tempLink.click();
                        document.body.removeChild(tempLink);
                    }
                }
                isClickValid = false;
            });
            
            // Prevent native click to avoid double navigation, and prevent drag
            el.addEventListener('click', (e) => e.preventDefault());
            el.ondragstart = () => false;
        }
    });
}