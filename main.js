import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Initialize 
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const fontLoader = new FontLoader();
fontLoader.load('node_modules/three/examples/fonts/helvetiker_regular.typeface.json', (font) => {
  const textGeometryI = new TextGeometry('i', {
    font: font,
    size: 1,
    height: 0.2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0,
    bevelSize: 0.03,
    bevelSegments: 5,
  });
  const textMaterialI = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const textMeshI = new THREE.Mesh(textGeometryI, textMaterialI);
  textMeshI.position.set(-5, 0, 0); 
  scene.add(textMeshI);


  const textGeometry9 = new TextGeometry('9', {
    font: font,
    size: 1,
    height: 0.2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0,
    bevelSize: 0.03,
    bevelSegments: 5,
  });
  const textMaterial9 = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const textMesh9 = new THREE.Mesh(textGeometry9, textMaterial9);
  textMesh9.position.set(5, 0, 0); 
  scene.add(textMesh9);
});

camera.position.z = 5;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
