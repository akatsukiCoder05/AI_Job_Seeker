import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface MascotProps {
  size?: number;
  className?: string;
}

export const Mascot: React.FC<MascotProps> = ({ size = 400, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // ── Scene Setup ────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 0.3, 4.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    // ── Materials ──────────────────────────────────────────
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      metalness: 0.85,
      roughness: 0.15,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x2563EB,
      metalness: 0.9,
      roughness: 0.1,
      emissive: new THREE.Color(0x1D4ED8),
      emissiveIntensity: 0.4,
    });
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x06B6D4,
      emissive: new THREE.Color(0x06B6D4),
      emissiveIntensity: 1.2,
      metalness: 0.0,
      roughness: 0.0,
      transparent: true,
      opacity: 0.95,
    });
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x60A5FA,
      emissive: new THREE.Color(0x3B82F6),
      emissiveIntensity: 0.8,
      metalness: 0.0,
      roughness: 0.0,
      transparent: true,
      opacity: 0.7,
    });
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      metalness: 0.7,
      roughness: 0.3,
    });

    // ── Robot Group ────────────────────────────────────────
    const robot = new THREE.Group();
    scene.add(robot);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(1.2, 1.4, 0.7, 2, 2, 2);
    const torso = new THREE.Mesh(torsoGeo, bodyMat);
    torso.position.y = -0.3;
    torso.castShadow = true;
    robot.add(torso);

    // Chest Panel
    const chestGeo = new THREE.BoxGeometry(0.8, 0.5, 0.05);
    const chest = new THREE.Mesh(chestGeo, accentMat);
    chest.position.set(0, -0.15, 0.38);
    robot.add(chest);

    // Chest glow strip
    const stripGeo = new THREE.BoxGeometry(0.55, 0.06, 0.06);
    const strip = new THREE.Mesh(stripGeo, glowMat);
    strip.position.set(0, -0.15, 0.41);
    robot.add(strip);

    // Shoulders
    [-0.75, 0.75].forEach((x) => {
      const sGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.35, 16);
      const s = new THREE.Mesh(sGeo, accentMat);
      s.position.set(x, 0.25, 0);
      s.rotation.z = Math.PI / 2;
      robot.add(s);
    });

    // Arms
    [-0.85, 0.85].forEach((x) => {
      const aGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.9, 12);
      const a = new THREE.Mesh(aGeo, bodyMat);
      a.position.set(x, -0.3, 0);
      robot.add(a);

      const handGeo = new THREE.SphereGeometry(0.15, 16, 16);
      const hand = new THREE.Mesh(handGeo, accentMat);
      hand.position.set(x, -0.78, 0);
      robot.add(hand);
    });

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.3, 12);
    const neck = new THREE.Mesh(neckGeo, panelMat);
    neck.position.y = 0.45;
    robot.add(neck);

    // Head
    const headGeo = new THREE.BoxGeometry(1.0, 0.85, 0.75, 2, 2, 2);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.y = 1.0;
    head.castShadow = true;
    robot.add(head);

    // Head accent strips
    const hStripGeo = new THREE.BoxGeometry(1.02, 0.07, 0.08);
    [-0.1, 0.15].forEach((y) => {
      const hs = new THREE.Mesh(hStripGeo, accentMat);
      hs.position.set(0, 1.0 + y, 0.38);
      robot.add(hs);
    });

    // Visor (front glass panel)
    const visorGeo = new THREE.BoxGeometry(0.7, 0.28, 0.05);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.05, 0.39);
    robot.add(visor);

    // Eyes (inside visor)
    const eyePositions = [[-0.18, 1.06], [0.18, 1.06]];
    const eyeMeshes: THREE.Mesh[] = [];
    eyePositions.forEach(([ex, ey]) => {
      const eGeo = new THREE.SphereGeometry(0.07, 16, 16);
      const eMat = new THREE.MeshStandardMaterial({
        color: 0x22D3EE,
        emissive: new THREE.Color(0x06B6D4),
        emissiveIntensity: 2.0,
      });
      const eye = new THREE.Mesh(eGeo, eMat);
      eye.position.set(ex, ey, 0.41);
      robot.add(eye);
      eyeMeshes.push(eye);
    });

    // Antenna
    const antBase = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12);
    const ant = new THREE.Mesh(antBase, panelMat);
    ant.position.set(0, 1.55, 0);
    robot.add(ant);

    const antTipGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const antTip = new THREE.Mesh(antTipGeo, glowMat);
    antTip.position.set(0, 1.75, 0);
    robot.add(antTip);

    // Ear panels
    [-0.52, 0.52].forEach((x) => {
      const earGeo = new THREE.BoxGeometry(0.08, 0.4, 0.45);
      const ear = new THREE.Mesh(earGeo, panelMat);
      ear.position.set(x, 1.0, 0);
      robot.add(ear);

      const earGlowGeo = new THREE.BoxGeometry(0.04, 0.14, 0.14);
      const earGlow = new THREE.Mesh(earGlowGeo, glowMat);
      earGlow.position.set(x, 1.0, 0);
      robot.add(earGlow);
    });

    // Legs
    [-0.3, 0.3].forEach((x) => {
      const legGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.75, 12);
      const leg = new THREE.Mesh(legGeo, bodyMat);
      leg.position.set(x, -1.25, 0);
      robot.add(leg);

      const footGeo = new THREE.BoxGeometry(0.35, 0.18, 0.5);
      const foot = new THREE.Mesh(footGeo, accentMat);
      foot.position.set(x, -1.68, 0.05);
      robot.add(foot);
    });

    // ── Orbital Objects ────────────────────────────────────
    const orbitalGroup = new THREE.Group();
    scene.add(orbitalGroup);

    // Resume card
    const resumeGeo = new THREE.BoxGeometry(0.7, 0.9, 0.04);
    const resumeMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      metalness: 0.3,
      roughness: 0.5,
      emissive: new THREE.Color(0x2563EB),
      emissiveIntensity: 0.05,
    });
    const resume = new THREE.Mesh(resumeGeo, resumeMat);
    const resumeLines = new THREE.Group();
    [0.25, 0.1, -0.05, -0.2].forEach((y, i) => {
      const lGeo = new THREE.BoxGeometry(i === 0 ? 0.45 : 0.35, 0.04, 0.05);
      const lMat = new THREE.MeshStandardMaterial({
        color: i === 0 ? 0x3B82F6 : 0x334155,
        emissive: i === 0 ? new THREE.Color(0x3B82F6) : new THREE.Color(0),
        emissiveIntensity: i === 0 ? 0.5 : 0,
      });
      const line = new THREE.Mesh(lGeo, lMat);
      line.position.set(i === 0 ? 0 : -0.04, y, 0.03);
      resumeLines.add(line);
    });
    const resumeOrb = new THREE.Group();
    resumeOrb.add(resume);
    resumeOrb.add(resumeLines);
    resumeOrb.position.set(2.2, 0.4, 0);
    orbitalGroup.add(resumeOrb);

    // Job match badge
    const badgeGeo = new THREE.CircleGeometry(0.3, 32);
    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0x2563EB,
      emissive: new THREE.Color(0x1D4ED8),
      emissiveIntensity: 0.6,
      side: THREE.DoubleSide,
    });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    const badgeOrb = new THREE.Group();
    badgeOrb.add(badge);
    badgeOrb.position.set(-2.0, 0.8, 0.5);
    orbitalGroup.add(badgeOrb);

    // Floating skill spheres
    const skillColors = [0x2563EB, 0x06B6D4, 0x7C3AED, 0x10B981, 0xF59E0B];
    const skillOrbs: THREE.Mesh[] = [];
    skillColors.forEach((col, i) => {
      const sGeo = new THREE.SphereGeometry(0.1 + Math.random() * 0.08, 16, 16);
      const sMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: new THREE.Color(col),
        emissiveIntensity: 0.7,
        metalness: 0.3,
        roughness: 0.2,
      });
      const orb = new THREE.Mesh(sGeo, sMat);
      const angle = (i / skillColors.length) * Math.PI * 2;
      const r = 2.0 + Math.random() * 0.8;
      orb.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * 2.5, Math.sin(angle) * 0.5);
      skillOrbs.push(orb);
      orbitalGroup.add(orb);
    });

    // Ring around robot
    const ringGeo = new THREE.TorusGeometry(1.6, 0.025, 8, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x2563EB,
      emissive: new THREE.Color(0x2563EB),
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.5,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    scene.add(ring);

    // Particles
    const particleCount = 80;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x3B82F6,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // ── Lighting ───────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x1a2744, 3.0));

    const keyLight = new THREE.DirectionalLight(0x3B82F6, 2.5);
    keyLight.position.set(3, 4, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x06B6D4, 1.5);
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x7C3AED, 1.0);
    rimLight.position.set(0, -3, -3);
    scene.add(rimLight);

    const pointLight1 = new THREE.PointLight(0x2563EB, 3, 8);
    pointLight1.position.set(0, 2, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06B6D4, 2, 8);
    pointLight2.position.set(-3, -1, 2);
    scene.add(pointLight2);

    // ── Mouse Interaction ──────────────────────────────────
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: -((e.clientY - rect.top) / rect.height - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // ── Animation Loop ─────────────────────────────────────
    let reqId: number;
    let blinkTimer = 0;
    let blinkOpen = true;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;

      // Robot hover + gentle mouse follow
      robot.position.y = Math.sin(t * 0.7) * 0.12;
      robot.rotation.y += (mouseRef.current.x * 0.25 - robot.rotation.y) * 0.06;
      robot.rotation.x += (mouseRef.current.y * 0.1 - robot.rotation.x) * 0.06;

      // Antenna pulse
      antTip.scale.setScalar(1 + Math.sin(t * 4) * 0.25);

      // Blink
      blinkTimer += 0.016;
      if (blinkTimer > 3.5) {
        blinkOpen = false;
        if (blinkTimer > 3.65) { blinkOpen = true; blinkTimer = 0; }
      }
      eyeMeshes.forEach((e) => {
        e.scale.y = blinkOpen ? 1 : 0.08;
      });

      // Orbital spin
      orbitalGroup.rotation.y = t * 0.18;
      resumeOrb.rotation.y = -t * 0.5;
      badgeOrb.rotation.z = t * 0.4;

      // Skill orbs hover
      skillOrbs.forEach((orb, i) => {
        orb.position.y += Math.sin(t + i * 1.3) * 0.003;
        orb.rotation.y += 0.02;
      });

      // Ring pulse
      ring.rotation.z = t * 0.2;
      (ringMat as THREE.MeshStandardMaterial).opacity = 0.3 + Math.sin(t * 1.5) * 0.2;

      // Chest strip glow
      (strip.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.6 + Math.sin(t * 2) * 0.4;

      // Particles drift
      particles.rotation.y = t * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // ── Resize ─────────────────────────────────────────────
    const handleResize = () => {
      if (!containerRef.current) return;
      const s = containerRef.current.clientWidth;
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      renderer.setSize(s, s);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: size, height: size }}
    />
  );
};

export default Mascot;
