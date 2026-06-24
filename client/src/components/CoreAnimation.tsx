import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface CoreAnimationProps {
  className?: string;
  size?: number;
}

export const CoreAnimation: React.FC<CoreAnimationProps> = ({ className = "", size = 320 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = size;
    const height = size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1, 15);
    const material = new THREE.MeshPhongMaterial({
      color: 0x4f46e5,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.5
    });
    const core = new THREE.Mesh(geometry, material);
    scene.add(core);

    const innerGeo = new THREE.IcosahedronGeometry(0.6, 2);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x818cf8,
      emissiveIntensity: 2,
      metalness: 0.8,
      roughness: 0.2
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerSphere);

    const light = new THREE.PointLight(0xffffff, 2, 100);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040, 2));

    camera.position.z = 3;

    let reqId: number;

    const animateAI = () => {
      reqId = requestAnimationFrame(animateAI);
      core.rotation.y += 0.005;
      core.rotation.z += 0.002;
      innerSphere.rotation.y -= 0.01;

      const s = 1 + Math.sin(Date.now() * 0.002) * 0.05;
      core.scale.set(s, s, s);

      renderer.render(scene, camera);
    };

    animateAI();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || size;
      const h = containerRef.current.clientHeight || size;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      material.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      renderer.dispose();
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

export default CoreAnimation;
