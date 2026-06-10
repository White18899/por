/**
 * Vajra Hub Startup Portfolio
 * Core Javascript and WebGL Interactions
 */

// --- PRELOADER REMOVAL ---
const handlePageLoad = () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('fade-out');
        }, 1000); // 1-second premium branding showcase
    }
};

if (document.readyState === 'complete') {
    handlePageLoad();
} else {
    window.addEventListener('load', handlePageLoad);
}

document.addEventListener('DOMContentLoaded', () => {
    // --- INIT CUSTOM CURSOR ---
    const cursor = document.getElementById('custom-icon-cursor');

    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
            
            // Show cursor on first movement
            if (cursor.style.opacity !== '1') {
                cursor.style.opacity = '1';
            }
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });

        // Hover effect for interactive elements
        const interactives = document.querySelectorAll('a, button, .card-glass, .mobile-menu-btn, input, textarea');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
        });
    }

    // --- NAVIGATION HEADER SCROLL EFFECT ---
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- MOBILE MENU NAVIGATION ---
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav a');

    const toggleMenu = () => {
        menuBtn.classList.toggle('open');
        mobileNav.classList.toggle('open');
        document.body.classList.toggle('overflow-hidden');
    };

    if (menuBtn) {
        menuBtn.addEventListener('click', toggleMenu);
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // --- SCROLL REVEAL (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Optional: Stop observing once revealed
                // revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // --- ACTIVE NAV ITEM HIGHLIGHT ON SCROLL ---
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 250)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').slice(1) === current) {
                item.classList.add('active');
            }
        });
    });

    // --- CONTACT FORM SUBMISSION ---
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Set sending state
            submitBtn.disabled = true;
            const btnSpan = submitBtn.querySelector('span');
            const btnIcon = submitBtn.querySelector('i');
            const originalText = btnSpan.textContent;
            
            btnSpan.textContent = 'Sending...';
            btnIcon.className = 'fa-solid fa-circle-notch fa-spin';

            // Simulate server request
            setTimeout(() => {
                formFeedback.className = 'form-feedback success';
                formFeedback.textContent = 'Thank you! Your message was sent successfully to Vajra Hub.';
                
                // Reset button
                submitBtn.disabled = false;
                btnSpan.textContent = originalText;
                btnIcon.className = 'fa-solid fa-paper-plane';
                
                // Clear inputs
                contactForm.reset();

                // Clear success message after 5 seconds
                setTimeout(() => {
                    formFeedback.textContent = '';
                    formFeedback.className = 'form-feedback';
                }, 5000);
            }, 1500);
        });
    }

    // --- THREE.JS WEBGL CONSTELLATION BACKGROUND ---
    initWebGLBackground();
});

function initWebGLBackground() {
    const canvas = document.getElementById('webgl-bg');
    if (!canvas) return;

    // 1. Scene & Setup
    const scene = new THREE.Scene();
    
    // Ambient fog for premium visual depth
    scene.fog = new THREE.FogExp2('#040405', 0.0015);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1500);
    camera.position.z = 500;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 4. Create Custom Radial Gradient Particle Texture
    function createCircleTexture() {
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 32;
        pCanvas.height = 32;
        const ctx = pCanvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 230, 100, 1)');
        gradient.addColorStop(0.2, 'rgba(212, 175, 55, 0.8)');
        gradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.15)');
        gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        
        return new THREE.CanvasTexture(pCanvas);
    }
    
    const particleTexture = createCircleTexture();

    // 5. Build Constellation System Nodes
    const particleCount = 105;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const minBound = -350;
    const maxBound = 350;

    for (let i = 0; i < particleCount; i++) {
        // Position
        positions[i * 3] = minBound + Math.random() * (maxBound - minBound);     // X
        positions[i * 3 + 1] = minBound + Math.random() * (maxBound - minBound); // Y
        positions[i * 3 + 2] = minBound + Math.random() * (maxBound - minBound); // Z

        // Velocities for dynamic float drift
        velocities.push({
            x: (Math.random() - 0.5) * 0.4,
            y: (Math.random() - 0.5) * 0.4,
            z: (Math.random() - 0.5) * 0.4
        });
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 8,
        map: particleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // 6. Connective Lines System
    // Each particle can link to others. We prepare a dynamic line segment geometry
    const lineMaxConnections = particleCount * 6; // Safety ceiling
    const linePositions = new Float32Array(lineMaxConnections * 3 * 2); // 2 points per line
    const lineColors = new Float32Array(lineMaxConnections * 3 * 2);

    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    linesGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    // Material with vertex coloring
    const linesMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        linewidth: 1 // Note: WebGL implementation ignores line thickness on most platforms, but we configure it.
    });

    const lineSegments = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(lineSegments);

    // 7. Mouse Interactivity Variables
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    
    document.addEventListener('mousemove', (e) => {
        // Track relative mouse position for scene tilt effect
        targetX = (e.clientX - window.innerWidth / 2) * 0.08;
        targetY = (e.clientY - window.innerHeight / 2) * 0.08;
    });

    // Touch screen tilt handler
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            targetX = (e.touches[0].clientX - window.innerWidth / 2) * 0.08;
            targetY = (e.touches[0].clientY - window.innerHeight / 2) * 0.08;
        }
    });

    // 8. Animation Cycle
    const animate = () => {
        // Float drift physics for particles
        const posArr = particlesGeometry.attributes.position.array;
        
        for (let i = 0; i < particleCount; i++) {
            // Update coordinates
            posArr[i * 3] += velocities[i].x;
            posArr[i * 3 + 1] += velocities[i].y;
            posArr[i * 3 + 2] += velocities[i].z;

            // Bounce check boundaries to keep points clustered within system limits
            if (posArr[i * 3] < minBound || posArr[i * 3] > maxBound) velocities[i].x *= -1;
            if (posArr[i * 3 + 1] < minBound || posArr[i * 3 + 1] > maxBound) velocities[i].y *= -1;
            if (posArr[i * 3 + 2] < minBound || posArr[i * 3 + 2] > maxBound) velocities[i].z *= -1;
        }
        particlesGeometry.attributes.position.needsUpdate = true;

        // Dynamic distance connections checking
        let lineIdx = 0;
        const linePosArr = linesGeometry.attributes.position.array;
        const lineColArr = linesGeometry.attributes.color.array;
        const thresholdDistance = 145; // Connection range

        // Color definitions for links (shining yellow gold theme)
        const goldColor = new THREE.Color('#d4af37');

        for (let i = 0; i < particleCount; i++) {
            const x1 = posArr[i * 3];
            const y1 = posArr[i * 3 + 1];
            const z1 = posArr[i * 3 + 2];

            for (let j = i + 1; j < particleCount; j++) {
                const x2 = posArr[j * 3];
                const y2 = posArr[j * 3 + 1];
                const z2 = posArr[j * 3 + 2];

                // Standard distance formula
                const dx = x1 - x2;
                const dy = y1 - y2;
                const dz = z1 - z2;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < thresholdDistance) {
                    // Calculate alpha opacity based on closeness (closer = brighter gold)
                    const alpha = 1.0 - (dist / thresholdDistance);
                    
                    // Line endpoint 1
                    linePosArr[lineIdx * 3] = x1;
                    linePosArr[lineIdx * 3 + 1] = y1;
                    linePosArr[lineIdx * 3 + 2] = z1;
                    
                    lineColArr[lineIdx * 3] = goldColor.r * alpha * 0.35;
                    lineColArr[lineIdx * 3 + 1] = goldColor.g * alpha * 0.35;
                    lineColArr[lineIdx * 3 + 2] = goldColor.b * alpha * 0.35;

                    lineIdx++;

                    // Line endpoint 2
                    linePosArr[lineIdx * 3] = x2;
                    linePosArr[lineIdx * 3 + 1] = y2;
                    linePosArr[lineIdx * 3 + 2] = z2;

                    lineColArr[lineIdx * 3] = goldColor.r * alpha * 0.35;
                    lineColArr[lineIdx * 3 + 1] = goldColor.g * alpha * 0.35;
                    lineColArr[lineIdx * 3 + 2] = goldColor.b * alpha * 0.35;

                    lineIdx++;

                    // Prevent overflow of array buffers
                    if (lineIdx >= lineMaxConnections * 2) break;
                }
            }
            if (lineIdx >= lineMaxConnections * 2) break;
        }

        // Clean out remaining segments of line arrays not written on this frame
        for (let k = lineIdx * 3; k < lineMaxConnections * 3 * 2; k++) {
            linePosArr[k] = 0;
            lineColArr[k] = 0;
        }

        linesGeometry.attributes.position.needsUpdate = true;
        linesGeometry.attributes.color.needsUpdate = true;

        // Camera movement lerp for smooth parallax reaction to mouse position
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;

        // Position camera to look slightly inward relative to tilt offset
        camera.position.x = currentX;
        camera.position.y = -currentY;
        camera.lookAt(scene.position);

        // Constant slow spin of the constellation system as an autonomous flow
        particleSystem.rotation.y += 0.0006;
        lineSegments.rotation.y += 0.0006;
        
        particleSystem.rotation.x += 0.0003;
        lineSegments.rotation.x += 0.0003;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    
    window.addEventListener('resize', handleResize);
}
