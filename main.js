import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Initialize
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ambient Light (Soft Lighting for General Visibility)
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); 
// scene.add(ambientLight);

// Central Cube (Light Source)
const lightCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const lightCubeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    glowColor: { value: new THREE.Color(0xffffff) },
  },
  vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 glowColor;
    void main() {
      gl_FragColor = vec4(glowColor, 1.0);
    }
  `,
});
const lightCube = new THREE.Mesh(lightCubeGeometry, lightCubeMaterial);
scene.add(lightCube);

// Point Light inside the cube
const cubeLight = new THREE.PointLight(0xffffff, 20, 50); 
lightCube.add(cubeLight);

// Load fonts and create text meshes
const fontLoader = new FontLoader();
fontLoader.load('node_modules/three/examples/fonts/helvetiker_regular.typeface.json', (font) => {
  // 'i' Text Mesh
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
  const textMaterialI = new THREE.MeshStandardMaterial({ color: 0xff7f50 });
  const textMeshI = new THREE.Mesh(textGeometryI, textMaterialI);
  textMeshI.position.set(-3, 0, 0);
  scene.add(textMeshI);

  // '9' Text Mesh
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
  const textMaterial9 = new THREE.MeshStandardMaterial({ color: 0x0080af });
  const textMesh9 = new THREE.Mesh(textGeometry9, textMaterial9);
  textMesh9.position.set(3, 0, 0);
  scene.add(textMesh9);
});

// Position the camera
camera.position.z = 10;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

    //proving it's cube
  lightCube.rotation.x += 0.01;
  lightCube.rotation.y += 0.01;

  renderer.render(scene, camera);
}
animate();
