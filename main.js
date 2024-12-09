import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Initialize
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Movement Settings
const CUBE_MOVE_SPEED = 0.1;
const CAMERA_MOVE_SPEED = 0.1;

// Keyboard State Tracking
const keyState = {
  w: false,
  s: false,
  a: false,
  d: false
};

// Event Listeners for Keyboard
window.addEventListener('keydown', (event) => {
  switch(event.key.toLowerCase()) {
    case 'w': keyState.w = true; break;
    case 's': keyState.s = true; break;
    case 'a': keyState.a = true; break;
    case 'd': keyState.d = true; break;
  }
});

window.addEventListener('keyup', (event) => {
  switch(event.key.toLowerCase()) {
    case 'w': keyState.w = false; break;
    case 's': keyState.s = false; break;
    case 'a': keyState.a = false; break;
    case 'd': keyState.d = false; break;
  }
});

// Central Cube (Light Source)
const lightCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const lightCubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const lightCube = new THREE.Mesh(lightCubeGeometry, lightCubeMaterial);
scene.add(lightCube);

// Point Light inside the cube
const cubeLight = new THREE.PointLight(0xffffff, 1, 5); 
lightCube.add(cubeLight);

// Custom Shaders
const lightPosition = new THREE.Vector3();
const ambientIntensity = 0.219;

const alphabetShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightPos: { value: lightPosition },
    ambientIntensity: { value: ambientIntensity },
    baseColor: { value: new THREE.Color(0xff7f50) },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalMatrix * normal;
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 lightPos;
    uniform float ambientIntensity;
    uniform vec3 baseColor;

    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Ambient
      vec3 ambient = ambientIntensity * baseColor;

      // Diffuse
      vec3 lightDir = normalize(lightPos - vPosition);
      float diff = max(dot(vNormal, lightDir), 0.0);
      vec3 diffuse = diff * baseColor;

      // Specular
      vec3 viewDir = normalize(-vPosition);
      vec3 reflectDir = reflect(-lightDir, vNormal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0); // Shininess for plastic
      vec3 specular = spec * vec3(1.0);

      // Combine
      gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
    }
  `,
});

// Digit Shader 
const digitShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightPos: { value: lightPosition },
    ambientIntensity: { value: ambientIntensity },
    baseColor: { value: new THREE.Color(0x0080af) },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalMatrix * normal;
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 lightPos;
    uniform float ambientIntensity;
    uniform vec3 baseColor;

    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Ambient
      vec3 ambient = ambientIntensity * baseColor;

      // Diffuse
      vec3 lightDir = normalize(lightPos - vPosition);
      float diff = max(dot(vNormal, lightDir), 0.0);
      vec3 diffuse = diff * baseColor;

      // Specular (Metal-like)
      vec3 viewDir = normalize(-vPosition);
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(vNormal, halfDir), 0.0), 64.0); // Higher shininess for metal
      vec3 specular = spec * baseColor;

      // Combine
      gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
    }
  `,
});

// Load fonts and create text meshes
const fontLoader = new FontLoader();
fontLoader.load('node_modules/three/examples/fonts/helvetiker_regular.typeface.json', (font) => {
  // 'i' Text Mesh
  const textGeometryI = new TextGeometry('i', {
    font: font,
    size: 1,
    height: 0.4,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0,
    bevelSize: 0.03,
    bevelSegments: 5,
  });
  const textMeshI = new THREE.Mesh(textGeometryI, alphabetShaderMaterial);
  textMeshI.position.set(-3, 0, 0);
  scene.add(textMeshI);

  // '9' Text Mesh
  const textGeometry9 = new TextGeometry('9', {
    font: font,
    size: 1,
    height: 0.4,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0,
    bevelSize: 0.03,
    bevelSegments: 5,
  });
  const textMesh9 = new THREE.Mesh(textGeometry9, digitShaderMaterial);
  textMesh9.position.set(3, 0, 0);
  scene.add(textMesh9);
});

camera.position.z = 10;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Cube Movement
  if (keyState.w) {
    lightCube.position.y += CUBE_MOVE_SPEED;
  }
  if (keyState.s) {
    lightCube.position.y -= CUBE_MOVE_SPEED;
  }

  // Camera Movement
  if (keyState.a) {
    camera.position.x -= CAMERA_MOVE_SPEED;
  }
  if (keyState.d) {
    camera.position.x += CAMERA_MOVE_SPEED;
  }

  // Update light position
  lightPosition.copy(lightCube.position);

  // Dynamic lighting efffects
  lightCube.rotation.x += 0.01;
  lightCube.rotation.y += 0.01;

  renderer.render(scene, camera);
}
animate();