import React, { useEffect, useRef } from 'react';
import './Background.css';

// The original Three.js code uses global variables and functions. 
// We must wrap the entire Three.js application code into a single function 
// that is called inside the useEffect hook.
const initSolarSystem = (containerRef) => {
    // Check if scripts are already loaded to prevent duplicates
    if (window.THREE && window.THREE.OrbitControls) {
        // If already loaded, just re-initialize
        return startThreeJS(containerRef.current);
    }

    // Dynamic script loading for three.js and OrbitControls
    const loadScript = (url, callback) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = callback;
        document.head.appendChild(script);
    };

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", () => {
        // Now THREE is available globally
        loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js", () => {
            // Now OrbitControls is available globally as THREE.OrbitControls
            startThreeJS(containerRef.current);
        });
    });

    // Main Three.js setup function
    const startThreeJS = (containerElement) => {
        // --- Global Variables ---
        let scene, camera, renderer, controls, starField;
        const planets = [];
        const sunRotationSpeed = 0.005;

        // Base speed factor for slower, more realistic dynamic movement
        const GLOBAL_SPEED_FACTOR = 0.18; // Reduced to slow down all movement
        
        // Use a flag to control the animation loop
        let animationFrameId;

        /**
         * Generates a random speed multiplier and direction for dynamic orbits.
         * @param {number} base - The base speed value (e.g., related to inverse distance).
         * @returns {number} The randomized speed, which can be positive or negative.
         */
        function getRandomOrbitalSpeed(base) {
            // Random speed between 0.8x and 1.2x the base, scaled by GLOBAL_SPEED_FACTOR, and random direction (+/-)
            const direction = Math.random() < 0.5 ? 1 : -1;
            const variation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
            return base * variation * GLOBAL_SPEED_FACTOR * direction;
        }
        
        // Helper function to create a radial gradient texture for the sun's glow
        function createSunGlowTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const context = canvas.getContext('2d');
            const gradient = context.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width / 2
            );
            // Stronger, deeper orange/red glow for the fire effect
            gradient.addColorStop(0, 'rgba(255, 255, 0, 1)'); // Bright white-yellow center
            gradient.addColorStop(0.2, 'rgba(255, 120, 0, 0.8)'); // Orange fading
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fully transparent edge

            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);

            return new window.THREE.CanvasTexture(canvas);
        }

        /**
         * Creates a simple banded texture for gas giants like Jupiter using Canvas.
         * @param {number} baseColorHex - The primary color of the planet.
         * @returns {THREE.CanvasTexture} The generated texture.
         */
        function createBandedTexture(baseColorHex) {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const context = canvas.getContext('2d');
            const baseColor = new window.THREE.Color(baseColorHex);

            for (let y = 0; y < canvas.height; y++) {
                // Create subtle, procedural bands
                // 10 is the frequency, making the bands tighter
                const noise = Math.sin(y * 0.05 * 10) * 0.5 + 0.5; 
                const colorFactor = 0.7 + noise * 0.3; // Factor between 0.7 and 1.0

                const r = Math.floor(baseColor.r * 255 * colorFactor);
                const g = Math.floor(baseColor.g * 255 * colorFactor);
                const b = Math.floor(baseColor.b * 255 * colorFactor);

                context.fillStyle = `rgb(${r}, ${g}, ${b})`;
                context.fillRect(0, y, canvas.width, 1);
            }

            const texture = new window.THREE.CanvasTexture(canvas);
            texture.wrapS = window.THREE.RepeatWrapping;
            texture.wrapT = window.THREE.RepeatWrapping;
            texture.needsUpdate = true;
            return texture;
        }

        // Initialize Three.js components
        function init() {
            // Scene Setup
            scene = new window.THREE.Scene();
            
            // Camera Setup (Perspective camera to simulate depth)
            camera = new window.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 100; // Move camera back to view the full system

            // Renderer Setup
            renderer = new window.THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            // *** IMPORTANT: Append the renderer to the container element, not document.body ***
            containerElement.appendChild(renderer.domElement); 

            // Controls Setup (Allow user to orbit/zoom)
            controls = new window.THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true; // smooth camera movement
            controls.dampingFactor = 0.05;

            // Lights
            createLights();

            // Solar System Objects
            createSun();
            createPlanets();

            // Background Starfield
            createStarField();

            // Handle window resizing
            window.addEventListener('resize', onWindowResize, false);
        }

        function createLights() {
            // Ambient light for general scene illumination (very low in space)
            const ambientLight = new window.THREE.AmbientLight(0x222222);
            scene.add(ambientLight);

            // Point light at the Sun's position to illuminate planets
            const sunLight = new window.THREE.PointLight(0xffffff, 3, 500); // Increased intensity to 3
            scene.add(sunLight);
        }

        function createSun() {
            // SUN MESH: A sphere with a strong emissive property for a 'burning' look
            const sunGeometry = new window.THREE.SphereGeometry(5, 32, 32);
            const sunMaterial = new window.THREE.MeshStandardMaterial({
                color: 0xffaa00, // Orange-yellow base
                emissive: 0xff9900, // Strong emissive for the fiery glow
                emissiveIntensity: 3.5 // Increased intensity for a "burning" effect
            });
            const sun = new window.THREE.Mesh(sunGeometry, sunMaterial);
            sun.name = 'Sun';
            scene.add(sun);
            
            // The Sun rotates on its axis at a fixed rate
            planets.push({ mesh: sun, rotationSpeed: sunRotationSpeed, orbitalSpeed: 0, distance: 0 }); 
            
            // SUN GLOW (Using a sprite for a non-3D halo effect)
            const spriteMaterial = new window.THREE.SpriteMaterial({
                map: createSunGlowTexture(), // Generate a simple radial gradient texture
                color: 0xff8800, // Deep orange glow color
                blending: window.THREE.AdditiveBlending, // Makes it bright and transparent
                depthTest: false,
                transparent: true
            });
            const sprite = new window.THREE.Sprite(spriteMaterial);
            sprite.scale.set(30, 30, 1.0); // Make the glow large
            sprite.name = 'SunGlow';
            scene.add(sprite);
        }
        

        function createPlanets() {
            // Updated PLANET DATA: [Name, Size, Distance, Base Color, Shininess, Specular Color, MaterialType]
            const planetData = [
                // Name, Size, Distance, Base Color, Shininess, Specular Color, MaterialType
                ['Mercury', 0.5, 10, 0x555555, 10, 0x333333, 'rocky'],
                ['Venus', 0.8, 15, 0xE0C060, 80, 0xAAAAAA, 'cloudy'],
                ['Earth', 1.0, 20, 0x114488, 50, 0x555555, 'rocky'],
                ['Mars', 0.6, 25, 0xCC5533, 10, 0x222222, 'rocky'],
                ['Jupiter', 3.0, 40, 0xCCAA88, 20, 0x444444, 'gas'],
                ['Saturn', 2.5, 55, 0xDDBB88, 20, 0x444444, 'gas'], 
                ['Uranus', 1.8, 70, 0x99CCEE, 5, 0x333333, 'gas'],
                ['Neptune', 1.7, 85, 0x3366FF, 5, 0x333333, 'gas'],
            ];

            const planetGeometry = new window.THREE.SphereGeometry(1, 32, 32);

            planetData.forEach(([name, size, distance, color, shininess, specularColor, materialType]) => {
                let material;
                
                // Procedural texture for gas giant, plain color for rocky
                if (materialType === 'gas') {
                    const texture = createBandedTexture(color);
                    material = new window.THREE.MeshPhongMaterial({
                        map: texture,
                        shininess: shininess,
                        specular: specularColor 
                    });
                } else {
                    // MeshPhongMaterial for realistic lighting and specular highlights on rocky/cloudy bodies
                    material = new window.THREE.MeshPhongMaterial({ 
                        color: color,
                        shininess: shininess,
                        specular: specularColor
                    });
                }

                const mesh = new window.THREE.Mesh(planetGeometry, material);
                mesh.scale.set(size, size, size);
                mesh.position.x = distance; // Initial position on the x-axis
                mesh.name = name;

                // 2. Pivot Group (Handles the revolution/orbit around the sun)
                const pivot = new window.THREE.Object3D();
                pivot.add(mesh);
                scene.add(pivot);

                // --- Random Axis/Inclination ---
                const maxInclination = Math.PI / 6; // Max 30 degrees of tilt
                pivot.rotation.x = window.THREE.MathUtils.randFloat(-maxInclination, maxInclination);
                pivot.rotation.z = window.THREE.MathUtils.randFloat(-maxInclination, maxInclination); 
                
                // --- Random Speeds ---
                const baseOrbitSpeed = 1.0 / Math.pow(distance, 1.5) * 10; // Inverse square root relationship (Kepler's Law approx.)
                const planetOrbitalSpeed = getRandomOrbitalSpeed(baseOrbitSpeed);
                
                // Axial rotation speed (spin) - randomized and faster than Earth
                const planetRotationSpeed = getRandomOrbitalSpeed(0.015);

                // Store object for animation
                planets.push({
                    mesh: mesh,
                    pivot: pivot,
                    rotationSpeed: planetRotationSpeed, 
                    orbitalSpeed: planetOrbitalSpeed,
                    distance: distance
                });
            });
        }

        function createStarField() {
            const starGeometry = new window.THREE.BufferGeometry();
            const starCount = 10000; // Number of stars
            const positions = [];
            const colors = [];
            const color = new window.THREE.Color();
            
            // Create random positions and colors for the stars
            for (let i = 0; i < starCount; i++) {
                // Generate position: Spread out over a large cube/sphere
                const x = window.THREE.MathUtils.randFloatSpread(1000);
                const y = window.THREE.MathUtils.randFloatSpread(1000);
                const z = window.THREE.MathUtils.randFloatSpread(1000);
                positions.push(x, y, z);
                
                // Set color: Random brightness for twinkling effect
                color.setHSL(0.6, 0.0, Math.random() * 0.5 + 0.5);
                colors.push(color.r, color.g, color.b);
            }

            starGeometry.setAttribute('position', new window.THREE.Float32BufferAttribute(positions, 3));
            starGeometry.setAttribute('color', new window.THREE.Float32BufferAttribute(colors, 3));

            // Material for the stars (PointsMaterial for particle effect)
            const starMaterial = new window.THREE.PointsMaterial({
                size: 0.5,
                vertexColors: true,
                sizeAttenuation: true // Stars appear smaller further away
            });

            starField = new window.THREE.Points(starGeometry, starMaterial);
            scene.add(starField);
        }

        // --- Animation Loop ---
        function animate() {
            animationFrameId = requestAnimationFrame(animate);

            const elapsedTime = performance.now() * 0.001; // Time in seconds

            // 1. Sun Fire Pulse Effect
            const sunMesh = scene.getObjectByName('Sun');
            if (sunMesh) {
                // Subtle scale change for breathing fire effect
                const scaleFactor = 1.0 + Math.sin(elapsedTime * 2.0) * 0.02; // Pulse scale by max 2%
                sunMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
            }
            // Ensure the glow sprite stays centered with the sun and scales slightly too
            const sunGlow = scene.getObjectByName('SunGlow');
            if (sunGlow) {
                const glowScaleFactor = 30 + Math.sin(elapsedTime * 2.0) * 1.0;
                sunGlow.scale.set(glowScaleFactor, glowScaleFactor, 1.0);
            }


            // 2. Animate Solar System
            planets.forEach(p => {
                // Axial Rotation (Spin on its own axis)
                p.mesh.rotation.y += p.rotationSpeed;
                
                // Revolution (Orbit around the sun) - only for planets
                if (p.pivot) {
                    // p.pivot.rotation.y handles the orbit around the sun
                    // This is cumulative to achieve continuous motion
                    p.pivot.rotation.y += p.orbitalSpeed;
                }
            });

            // 3. Animate Star Field (Subtle motion for immersion)
            starField.rotation.y -= 0.00005;

            // 4. Update Controls and Render
            controls.update();
            renderer.render(scene, camera);
        }

        // --- Event Handlers ---
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // Start the application
        init();
        animate();
        
        // Return a cleanup function for React's useEffect
        return () => {
            // Remove event listener
            window.removeEventListener('resize', onWindowResize);
            // Stop animation loop
            cancelAnimationFrame(animationFrameId);
            // Dispose of resources and remove canvas from DOM
            if (containerElement && renderer) {
                containerElement.removeChild(renderer.domElement);
                renderer.dispose();
                // Dispose of scene objects, geometries, materials, and textures if necessary
            }
        };
    };
};

const Background = () => {
    // Use a ref to attach the Three.js renderer's canvas to a specific DOM node
    const containerRef = useRef(null);

    // useEffect runs once after the component is mounted
    useEffect(() => {
        // Call the setup function and get the cleanup function
        const cleanup = initSolarSystem(containerRef);

        // This is the cleanup function that runs when the component unmounts
        return cleanup;
    }, []); // Empty dependency array ensures it runs only once

    return (
        <div className="background-wrapper">
            {/* Info Overlay from original HTML */}
            
            
            {/* Three.js canvas will be injected here */}
            <div id="threejs-container" ref={containerRef}>
                {/* The canvas is injected into this div by the Three.js script */}
            </div>
        </div>
    );
};

export default Background;