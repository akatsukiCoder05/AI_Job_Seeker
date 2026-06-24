import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface MascotProps {
  size?: number;
  className?: string;
}

export const Mascot: React.FC<MascotProps> = ({ size = 192, className = "" }) => {
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

    const robot = new THREE.Group();
    scene.add(robot);

    // Robot Head Geometry & Material
    const headGeo = new THREE.BoxGeometry(0.8, 0.7, 0.6);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x4f46e5, shininess: 100 });
    const head = new THREE.Mesh(headGeo, bodyMat);
    robot.add(head);

    // Robot Eyes (Cylinders)
    const eyeGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 32);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.rotation.x = Math.PI / 2;
    leftEye.position.set(-0.2, 0.1, 0.3);
    robot.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.rotation.x = Math.PI / 2;
    rightEye.position.set(0.2, 0.1, 0.3);
    robot.add(rightEye);

    // Robot Antenna (Cylinder)
    const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3);
    const antenna = new THREE.Mesh(antennaGeo, bodyMat);
    antenna.position.y = 0.45;
    robot.add(antenna);

    // Robot Antenna Tip (Sphere)
    const tipGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = 0.6;
    robot.add(tip);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 2, 100);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040, 3));

    camera.position.z = 2.5;

    let reqId: number;

    const animateMascot = () => {
      reqId = requestAnimationFrame(animateMascot);
      const time = Date.now() * 0.002;
      robot.position.y = Math.sin(time * 0.5) * 0.1;
      robot.rotation.y = Math.sin(time * 0.3) * 0.2;
      tip.scale.setScalar(1 + Math.sin(time * 5) * 0.2);
      renderer.render(scene, camera);
    };

    animateMascot();

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

      // Clean up ThreeJS assets to prevent memory leaks
      headGeo.dispose();
      bodyMat.dispose();
      eyeGeo.dispose();
      eyeMat.dispose();
      antennaGeo.dispose();
      tipGeo.dispose();
      tipMat.dispose();
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

export default Mascot;
