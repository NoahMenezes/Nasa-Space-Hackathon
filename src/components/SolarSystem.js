import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const SolarSystem = () => {
  const mountRef = useRef(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for better performance
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.autoClear = true;
    
    // Append renderer to DOM
    const container = mountRef.current;
    container.innerHTML = ''; // Clear any existing content
    container.appendChild(renderer.domElement);
    
    // Handle window resize
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    
    // Initial size
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);

    // Camera position
    camera.position.set(0, 80, 200);
    camera.lookAt(0, 0, 0);

    // Starfield with varying sizes
    const createStarfield = () => {
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.2,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
      });

      const starsVertices = [];
      const starsSizes = [];
      for (let i = 0; i < 20000; i++) {
        const x = (Math.random() - 0.5) * 5000;
        const y = (Math.random() - 0.5) * 5000;
        const z = (Math.random() - 0.5) * 5000;
        starsVertices.push(x, y, z);
        starsSizes.push(Math.random() * 2);
      }

      starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
      const stars = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(stars);
    };
    createStarfield();

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x222222, 0.3);
    scene.add(ambientLight);

    // Create realistic burning sun with texture-like appearance
    const createRealisticSun = () => {
      const sunGroup = new THREE.Group();
      
      // Main sun sphere with complex material
      const sunGeometry = new THREE.SphereGeometry(18, 128, 128);
      
      // Create a custom shader for the sun's burning surface
      const sunMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0xff6b00) },
          color2: { value: new THREE.Color(0xffeb3b) },
          color3: { value: new THREE.Color(0xff3d00) }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          varying vec3 vNormal;
          uniform float time;
          
          // Noise function
          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
          vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
          
          float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i  = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
          }
          
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            
            vec3 pos = position;
            float noise = snoise(pos * 0.3 + time * 0.5) * 0.4;
            noise += snoise(pos * 0.6 + time * 0.3) * 0.2;
            pos += normal * noise;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            vPosition = mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          uniform vec3 color3;
          uniform float time;
          varying vec2 vUv;
          varying vec3 vPosition;
          varying vec3 vNormal;
          
          float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
          }
          
          void main() {
            float noise1 = random(vUv * 10.0 + time * 0.1);
            float noise2 = random(vUv * 5.0 - time * 0.15);
            float noise3 = random(vUv * 20.0 + time * 0.05);
            
            float pattern = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
            
            vec3 color = mix(color3, color1, pattern);
            color = mix(color, color2, noise2);
            
            // Add bright spots
            if (pattern > 0.7) {
              color = mix(color, vec3(1.0, 1.0, 0.9), (pattern - 0.7) * 3.0);
            }
            
            // Add dark spots for depth
            if (pattern < 0.3) {
              color *= 0.5 + pattern;
            }
            
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        side: THREE.DoubleSide
      });
      
      const sun = new THREE.Mesh(sunGeometry, sunMaterial);
      sunGroup.add(sun);
      
      // Inner glow layers
      for (let i = 0; i < 3; i++) {
        const glowSize = 20 + i * 2;
        const glowGeometry = new THREE.SphereGeometry(glowSize, 64, 64);
        const glowMaterial = new THREE.ShaderMaterial({
          uniforms: {
            c: { value: 0.3 - i * 0.05 },
            p: { value: 4.0 + i * 0.5 },
            glowColor: { value: new THREE.Color(0xffaa00) }
          },
          vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 glowColor;
            uniform float c;
            uniform float p;
            varying vec3 vNormal;
            void main() {
              float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
              gl_FragColor = vec4(glowColor, 1.0) * intensity;
            }
          `,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        sunGroup.add(glow);
      }
      
      // Corona flares
      const coronaGeometry = new THREE.SphereGeometry(25, 64, 64);
      const coronaMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          c: { value: 0.15 },
          p: { value: 6.0 },
          glowColor: { value: new THREE.Color(0xff8800) }
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec2 vUv;
          uniform float time;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          uniform float c;
          uniform float p;
          uniform float time;
          varying vec3 vNormal;
          varying vec2 vUv;
          
          float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
          }
          
          void main() {
            float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
            float flare = random(vUv * 5.0 + time * 0.1) * 0.5;
            intensity *= (0.7 + flare);
            gl_FragColor = vec4(glowColor, 1.0) * intensity;
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      });
      const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
      sunGroup.add(corona);
      
      return { group: sunGroup, material: sunMaterial, coronaMaterial: coronaMaterial };
    };
    
    const sunData = createRealisticSun();
    scene.add(sunData.group);

    // Powerful sun light
    const sunLight = new THREE.PointLight(0xffaa44, 3.5, 1500);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Additional directional light for better planet illumination
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 0, 0);
    scene.add(directionalLight);

    // Planet data with ultra-realistic colors
    const planetsData = [
      { 
        name: 'Mercury', 
        size: 2.4, 
        distance: 35, 
        color: 0x8c8c8c, 
        emissive: 0x4a4a4a,
        roughness: 0.9,
        metalness: 0.2,
        speed: 0.15, 
        info: 'Closest to the Sun' 
      },
      { 
        name: 'Venus', 
        size: 6, 
        distance: 50, 
        color: 0xffc649, 
        emissive: 0xff9800,
        roughness: 0.4,
        metalness: 0.3,
        speed: 0.12, 
        info: 'Hottest planet' 
      },
      { 
        name: 'Earth', 
        size: 6.3, 
        distance: 70, 
        color: 0x1976d2, 
        emissive: 0x0d47a1,
        roughness: 0.7,
        metalness: 0.1,
        speed: 0.10, 
        info: 'Our home planet' 
      },
      { 
        name: 'Mars', 
        size: 3.3, 
        distance: 90, 
        color: 0xd84315, 
        emissive: 0xbf360c,
        roughness: 0.95,
        metalness: 0.1,
        speed: 0.09, 
        info: 'The Red Planet' 
      },
      { 
        name: 'Jupiter', 
        size: 11, 
        distance: 140, 
        color: 0xffab40, 
        emissive: 0xff6f00,
        roughness: 0.6,
        metalness: 0.2,
        speed: 0.06, 
        info: 'Largest planet' 
      },
      { 
        name: 'Saturn', 
        size: 9.5, 
        distance: 195, 
        color: 0xffd54f, 
        emissive: 0xffa000,
        roughness: 0.5,
        metalness: 0.3,
        speed: 0.05, 
        info: 'Planet with rings' 
      },
      { 
        name: 'Uranus', 
        size: 8, 
        distance: 250, 
        color: 0x26c6da, 
        emissive: 0x0097a7,
        roughness: 0.5,
        metalness: 0.4,
        speed: 0.04, 
        info: 'Ice giant' 
      },
      { 
        name: 'Neptune', 
        size: 7.7, 
        distance: 300, 
        color: 0x1e88e5, 
        emissive: 0x0d47a1,
        roughness: 0.5,
        metalness: 0.3,
        speed: 0.035, 
        info: 'Farthest from Sun' 
      }
    ];

    const planets = [];
    const orbits = [];

    planetsData.forEach((data) => {
      // Orbit line
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitPoints = [];
      for (let i = 0; i <= 128; i++) {
        const angle = (i / 128) * Math.PI * 2;
        orbitPoints.push(
          Math.cos(angle) * data.distance,
          0,
          Math.sin(angle) * data.distance
        );
      }
      orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
      const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: 0x333333, 
        transparent: true, 
        opacity: 0.2 
      });
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbit);
      orbits.push(orbit);

      // Realistic planet with detailed materials
      const geometry = new THREE.SphereGeometry(data.size, 64, 64);
      const material = new THREE.MeshStandardMaterial({
        color: data.color,
        emissive: data.emissive,
        emissiveIntensity: 0.6,
        metalness: data.metalness,
        roughness: data.roughness
      });
      const planet = new THREE.Mesh(geometry, material);
      
      // Add atmospheric glow for gas giants
      if (['Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(data.name)) {
        const glowGeometry = new THREE.SphereGeometry(data.size * 1.15, 64, 64);
        const glowMaterial = new THREE.ShaderMaterial({
          uniforms: {
            c: { value: 0.4 },
            p: { value: 3.0 },
            glowColor: { value: new THREE.Color(data.emissive) }
          },
          vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 glowColor;
            uniform float c;
            uniform float p;
            varying vec3 vNormal;
            void main() {
              float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
              gl_FragColor = vec4(glowColor, 1.0) * intensity;
            }
          `,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        planet.add(glow);
      }
      
      // Planet group for rotation
      const planetGroup = new THREE.Group();
      planetGroup.add(planet);
      scene.add(planetGroup);

      planets.push({
        group: planetGroup,
        mesh: planet,
        angle: Math.random() * Math.PI * 2,
        ...data
      });

      // Saturn rings - highly detailed
      if (data.name === 'Saturn') {
        const ringGeometry = new THREE.RingGeometry(data.size * 1.5, data.size * 2.5, 128);
        const ringMaterial = new THREE.MeshStandardMaterial({
          color: 0xffecb3,
          emissive: 0xffa726,
          emissiveIntensity: 0.3,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
          metalness: 0.3,
          roughness: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planetGroup.add(ring);
      }
    });

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        camera.position.x += deltaX * 0.15;
        camera.position.y -= deltaY * 0.15;
        camera.lookAt(0, 0, 0);
      }

      previousMousePosition = { x: e.clientX, y: e.clientY };

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

      if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
      }
    };

    const onMouseDown = () => {
      isDragging = true;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

      if (intersects.length > 0) {
        const clickedPlanet = planets.find(p => p.mesh === intersects[0].object);
        setSelectedPlanet(clickedPlanet);
      } else {
        setSelectedPlanet(null);
      }
    };

    const onWheel = (e) => {
      const zoomSpeed = 0.15;
      const delta = e.deltaY * zoomSpeed;
      
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      
      camera.position.addScaledVector(direction, -delta);
      
      const minDistance = 25;
      const maxDistance = 500;
      const distance = camera.position.length();
      
      if (distance < minDistance) {
        camera.position.normalize().multiplyScalar(minDistance);
      } else if (distance > maxDistance) {
        camera.position.normalize().multiplyScalar(maxDistance);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('click', onClick);
    window.addEventListener('wheel', onWheel);

    // Initial renderer size setup
    updateRendererSize();
    
    // Resize handler
    const onResize = () => {
      updateRendererSize();
    };
    
    // Use ResizeObserver for better performance with CSS transforms
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          updateRendererSize();
        }
      }
    });
    
    resizeObserver.observe(container);

    // Animation setup
    let animationFrameId;
    let lastTime = 0;
    let sunMaterial = sunData?.material; // Get sunMaterial from sunData
    
    const animate = (time) => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Calculate delta time for smooth animation
      const deltaTime = time - lastTime;
      lastTime = time;
      
      // Update sun shader time
      if (sunMaterial) {
        sunMaterial.uniforms.time.value += deltaTime * 0.001;
      }
      
      // Rotate the scene
      scene.rotation.y += 0.0005 * deltaTime;
      
      // Update planet positions
      planets.forEach(planet => {
        planet.angle += planet.speed * deltaTime * 0.001;
        const x = Math.cos(planet.angle) * planet.distance;
        const z = Math.sin(planet.angle) * planet.distance;
        
        // Smooth movement with lerp
        planet.group.position.lerp(new THREE.Vector3(x, 0, z), 0.1);
        
        // Smooth rotation
        planet.mesh.rotation.y += 0.001 * deltaTime;
      });
      
      // Render scene
      renderer.render(scene, camera);
    };

    // Start animation
    setIsLoading(false);
    animate();

    // Cleanup function
    return () => {
      // Cancel animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Remove event listeners
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      
      // Dispose of renderer
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
      
      // Dispose of geometries and materials
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      // Clear the scene
      while(scene.children.length > 0) { 
        scene.remove(scene.children[0]); 
      }
      // Remove mouse event listeners if they exist
      if (onMouseDown) window.removeEventListener('mousedown', onMouseDown);
      if (onMouseUp) window.removeEventListener('mouseup', onMouseUp);
      if (onClick) window.removeEventListener('click', onClick);
      if (onWheel) window.removeEventListener('wheel', onWheel);
      
      // Clean up ResizeObserver
      if (resizeObserver && container) {
        resizeObserver.unobserve(container);
        resizeObserver.disconnect();
      }
      
      // Clean up any remaining resources
      if (mountRef.current) {
        // Clear the container
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="solar-system-container">
      <div ref={mountRef} className="canvas-container" />
      
      {/* UI Overlay */}
      <div className="ui-overlay">
        <h1>SOLAR SYSTEM</h1>
        <p>PHOTOREALISTIC EXPLORER</p>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="controls-inner">
          <p>
            <span>🖱️</span> Drag to rotate view
          </p>
          <p>
            <span>🔍</span> Scroll to zoom in/out
          </p>
          <p>
            <span>👆</span> Click planets for details
          </p>
        </div>
      </div>

      {/* Planet Info */}
      {selectedPlanet && (
        <div className="planet-info">
          <div className="planet-card">
            <div className="planet-header">
              <div 
                className="planet-icon"
                style={{ 
                  backgroundColor: `#${selectedPlanet.color.toString(16)}`,
                  boxShadow: `0 0 30px #${selectedPlanet.emissive.toString(16)}`
                }}
              />
              <h2 className="planet-name">{selectedPlanet.name}</h2>
            </div>
            <p className="planet-description">{selectedPlanet.info}</p>
            <div className="planet-stats">
              <div className="stat-row">
                <span className="stat-label">Distance from Sun</span>
                <span className="stat-value">{selectedPlanet.distance} AU</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Diameter</span>
                <span className="stat-value">{(selectedPlanet.size * 10000).toLocaleString()} km</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Orbital Speed</span>
                <span className="stat-value">{(selectedPlanet.speed * 10).toFixed(2)} km/s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-text">INITIALIZING SOLAR SYSTEM...</div>
        </div>
      )}
    </div>
  );
}
export default SolarSystem;