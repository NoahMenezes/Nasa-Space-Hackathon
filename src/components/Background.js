import React, { useEffect, useRef } from "react";
// Note: Assuming 'Background.css' is now redundant as styles are in App.css/Component CSS

// --- Helper Functions (Declared ONCE outside initSolarSystem) ---

const GLOBAL_SPEED_FACTOR = 0.18;

function getRandomOrbitalSpeed(base) {
  // Helper must be defined once, outside startThreeJS scope
  const direction = Math.random() < 0.5 ? 1 : -1;
  const variation = 0.8 + Math.random() * 0.4;
  return base * variation * GLOBAL_SPEED_FACTOR * direction;
}

function createSunGlowTexture() {
  // Helper must be defined once
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2,
  );
  gradient.addColorStop(0, "rgba(255, 255, 0, 1)");
  gradient.addColorStop(0.2, "rgba(255, 120, 0, 0.8)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  return new window.THREE.CanvasTexture(canvas);
}

function createBandedTexture(baseColorHex) {
  // Helper must be defined once
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const baseColor = new window.THREE.Color(baseColorHex);

  for (let y = 0; y < canvas.height; y++) {
    // Create subtle, procedural bands
    const noise = Math.sin(y * 0.05 * 10) * 0.5 + 0.5;
    const colorFactor = 0.7 + noise * 0.3;

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

// Main function to initialize the Three.js scene
const initSolarSystem = (containerRef) => {
  // Helper for loading external scripts
  const loadScript = (url, callback) => {
    // Check if scripts are already loaded
    if (
      window.THREE &&
      window.THREE.OrbitControls &&
      url.includes("OrbitControls.js")
    ) {
      callback();
      return;
    }

    const script = document.createElement("script");
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
  };

  // --- DEFINE startThreeJS FIRST (FIXES THE REFERENCE ERROR) ---
  // We use a function declaration here for safe hoisting within this scope,
  // though using 'const' before the dynamic loading sequence would also work.

  function startThreeJS(containerElement) {
    let scene, camera, renderer, controls, starField;
    const planets = [];
    const sunRotationSpeed = 0.005;
    let animationFrameId;

    function init() {
      scene = new window.THREE.Scene();

      camera = new window.THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );
      camera.position.z = 100;

      renderer = new window.THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      containerElement.appendChild(renderer.domElement);

      controls = new window.THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.2;

      createLights();
      createSun();
      createPlanets();
      createStarField();
      setupMouseInteraction();

      window.addEventListener("resize", onWindowResize, false);
    }

    function createLights() {
      const ambientLight = new window.THREE.AmbientLight(0x222222);
      scene.add(ambientLight);

      const sunLight = new window.THREE.PointLight(0xffffff, 3, 500);
      scene.add(sunLight);
    }

    function createSun() {
      const sunGeometry = new window.THREE.SphereGeometry(5, 32, 32);
      const sunMaterial = new window.THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xff9900,
        emissiveIntensity: 3.5,
      });
      const sun = new window.THREE.Mesh(sunGeometry, sunMaterial);
      sun.name = "Sun";
      scene.add(sun);

      planets.push({
        mesh: sun,
        rotationSpeed: sunRotationSpeed,
        orbitalSpeed: 0,
        distance: 0,
      });

      const spriteMaterial = new window.THREE.SpriteMaterial({
        map: createSunGlowTexture(),
        color: 0xff8800,
        blending: window.THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
      });
      const sprite = new window.THREE.Sprite(spriteMaterial);
      sprite.scale.set(30, 30, 1.0);
      sprite.name = "SunGlow";
      scene.add(sprite);
    }

    function createPlanets() {
      const planetData = [
        ["Mercury", 0.5, 10, 0x555555, 10, 0x333333, "rocky"],
        ["Venus", 0.8, 15, 0xe0c060, 80, 0xaaaaaa, "cloudy"],
        ["Earth", 1.0, 20, 0x114488, 50, 0x555555, "rocky"],
        ["Mars", 0.6, 25, 0xcc5533, 10, 0x222222, "rocky"],
        ["Jupiter", 3.0, 40, 0xccaa88, 20, 0x444444, "gas"],
        ["Saturn", 2.5, 55, 0xddbb88, 20, 0x444444, "gas"],
        ["Uranus", 1.8, 70, 0x99ccee, 5, 0x333333, "gas"],
        ["Neptune", 1.7, 85, 0x3366ff, 5, 0x333333, "gas"],
      ];

      const planetGeometry = new window.THREE.SphereGeometry(1, 32, 32);

      planetData.forEach(
        ([
          name,
          size,
          distance,
          color,
          shininess,
          specularColor,
          materialType,
        ]) => {
          let material;

          if (materialType === "gas") {
            // Uses the helper defined in the outer scope
            const texture = createBandedTexture(color);
            material = new window.THREE.MeshPhongMaterial({
              map: texture,
              shininess: shininess,
              specular: specularColor,
            });
          } else {
            material = new window.THREE.MeshPhongMaterial({
              color: color,
              shininess: shininess,
              specular: specularColor,
            });
          }

          const mesh = new window.THREE.Mesh(planetGeometry, material);
          mesh.scale.set(size, size, size);
          mesh.position.x = distance;
          mesh.name = name;

          const pivot = new window.THREE.Object3D();
          pivot.add(mesh);
          scene.add(pivot);

          const maxInclination = Math.PI / 6;
          pivot.rotation.x = window.THREE.MathUtils.randFloat(
            -maxInclination,
            maxInclination,
          );
          pivot.rotation.z = window.THREE.MathUtils.randFloat(
            -maxInclination,
            maxInclination,
          );

          const baseOrbitSpeed = (1.0 / Math.pow(distance, 1.5)) * 10;
          // Uses the helper defined in the outer scope
          const planetOrbitalSpeed = getRandomOrbitalSpeed(baseOrbitSpeed);
          const planetRotationSpeed = getRandomOrbitalSpeed(0.015);

          planets.push({
            mesh: mesh,
            pivot: pivot,
            rotationSpeed: planetRotationSpeed,
            orbitalSpeed: planetOrbitalSpeed,
            distance: distance,
          });
        },
      );
    }

    function createStarField() {
      const starGeometry = new window.THREE.BufferGeometry();
      const starCount = 10000;
      const positions = [];
      const colors = [];
      const color = new window.THREE.Color();

      for (let i = 0; i < starCount; i++) {
        const x = window.THREE.MathUtils.randFloatSpread(1000);
        const y = window.THREE.MathUtils.randFloatSpread(1000);
        const z = window.THREE.MathUtils.randFloatSpread(1000);
        positions.push(x, y, z);

        color.setHSL(0.6, 0.0, Math.random() * 0.5 + 0.5);
        colors.push(color.r, color.g, color.b);
      }

      starGeometry.setAttribute(
        "position",
        new window.THREE.Float32BufferAttribute(positions, 3),
      );
      starGeometry.setAttribute(
        "color",
        new window.THREE.Float32BufferAttribute(colors, 3),
      );

      const starMaterial = new window.THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        sizeAttenuation: true,
      });

      starField = new window.THREE.Points(starGeometry, starMaterial);
      scene.add(starField);
    }

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = performance.now() * 0.001;

      const sunMesh = scene.getObjectByName("Sun");
      if (sunMesh) {
        const scaleFactor = 1.0 + Math.sin(elapsedTime * 2.0) * 0.02;
        sunMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
      }
      const sunGlow = scene.getObjectByName("SunGlow");
      if (sunGlow) {
        const glowScaleFactor = 30 + Math.sin(elapsedTime * 2.0) * 1.0;
        sunGlow.scale.set(glowScaleFactor, glowScaleFactor, 1.0);
      }

      planets.forEach((p, index) => {
        p.mesh.rotation.y += p.rotationSpeed;
        if (p.pivot) {
          p.pivot.rotation.y += p.orbitalSpeed;

          // Add subtle mouse-influenced wobble to planets
          const wobbleX = Math.sin(elapsedTime * 0.5 + index) * 0.02;
          const wobbleZ = Math.cos(elapsedTime * 0.3 + index) * 0.02;
          p.pivot.rotation.x = wobbleX;
          p.pivot.rotation.z = wobbleZ;
        }
      });

      starField.rotation.y -= 0.00005;

      // Subtle star field pulsing effect
      const positions = starField.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] += Math.sin(elapsedTime * 2 + i) * 0.01;
      }
      starField.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    }

    let onMouseMove;

    function setupMouseInteraction() {
      const mouse = new window.THREE.Vector2();

      onMouseMove = function (event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Smooth camera movement based on mouse position
        const targetX = mouse.x * 20;
        const targetY = mouse.y * 10;

        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (targetY - camera.position.y) * 0.02;

        // Adjust auto-rotation speed based on mouse movement
        controls.autoRotateSpeed = 0.2 + Math.abs(mouse.x) * 0.3;
      };

      window.addEventListener("mousemove", onMouseMove, false);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Start the application after setup
    init();
    animate();

    // Return cleanup function
    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (containerElement && renderer) {
        containerElement.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }
  // --- END OF startThreeJS DEFINITION ---

  // Now call the script loading sequence, which safely calls the defined startThreeJS
  if (window.THREE && window.THREE.OrbitControls) {
    // If already loaded, just re-initialize
    return startThreeJS(containerRef.current);
  }

  loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
    () => {
      loadScript(
        "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js",
        () => {
          startThreeJS(containerRef.current);
        },
      );
    },
  );
};

const Background = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const cleanup = initSolarSystem(containerRef);
      return cleanup;
    }
  }, []);

  return (
    <div
      id="threejs-container"
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "auto", // Enable mouse interaction
        cursor: "grab",
      }}
    >
      {/* The canvas is injected into this div by the Three.js script */}
    </div>
  );
};

export default Background;
