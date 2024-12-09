/* To Run the code: 
Method 1: - Install live server extension
- Press the 'Go live' button on the bottom right corner of the codespace
Method 2: - npm i vite (already installed ,but just in case)
- npx vite
 */
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


// Alphabet Shader Material (Plastic-like Surface)
const alphabetShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    // Dynamic light calculations
    lightPos: { value: lightPosition },
    // Base illumination
    ambientIntensity: { value: ambientIntensity },
    // material base color (fav color )
    baseColor: { value: new THREE.Color(0xff7f50) },
  },
  vertexShader: `
  // varying variables to pass to fragment shader
    varying vec3 vNormal; //vertex normal
    varying vec3 vPosition; //vertex position

    void main() {
    // transforms from normal space to the view space 
      vNormal = normalMatrix * normal;
    // transforms the vertex position to view space
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    // final vertex position in clip space
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    // uniform variables from CPU-side
    uniform vec3 lightPos; // light source position 
    uniform float ambientIntensity; //base ambient light intesinty level
    uniform vec3 baseColor; //base material color (fav color)

    // interpolated inputs from vertex shader
    varying vec3 vNormal;         // interpolated surface normal
    varying vec3 vPosition;       // interpolated vertex position

    void main() {
      // Ambient lighthing calculation. Provides base illumination despite light direction to ensure minimum visible brightness across the surface
      vec3 ambient = ambientIntensity * baseColor;

      // Diffuse ligthing calculation. Simulates how light interacts with a  surface. Intensity depends on angle between light and surface normal
      vec3 lightDir = normalize(lightPos - vPosition);  // Light direction vector
      float diff = max(dot(vNormal, lightDir), 0.0);   // Cosine of angle, clamped to positive
      vec3 diffuse = diff * baseColor;                 // Diffuse contribution

      // Specular Lighting Calculation (Plastic-like). It will simulate reflective highlights, mimicking a plastic surface
      vec3 viewDir = normalize(-vPosition); //view direction (towards the camera)
      vec3 reflectDir = reflect(-lightDir, vNormal); //reflection vector (perfectly reflected)

      // Specular intensity using Blinn-Phong reflection model
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0); // Shininess for plastic
      vec3 specular = spec * vec3(1.0);   // White specular highlights

      // Combine the final color composition (ambient,diffuse,specular)
      gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
    }
  `,
});

// Digit Shader 
const digitShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    // Dynamic light calculations  
    lightPos: { value: lightPosition },
    // Base illumination
    ambientIntensity: { value: ambientIntensity },
    // Base color material (complement fav color )
    baseColor: { value: new THREE.Color(0x0080af) },
  },
  vertexShader: `
  // varying variables to pass the data from vertex shader to fragment shader 
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Transform normal to view space using normal matrix to handle non-uniform scaling and rotations
      vNormal = normalMatrix * normal;
      // Transform vertex position to view space
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      // Final vertex position in clip space
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    // Uniform variables from CPU-side
    uniform vec3 lightPos;  // light source position
    uniform float ambientIntensity; // base ambient light intesinty level
    uniform vec3 baseColor; // base material color (complement fav color)

    // interpolated inputs from vertex shader
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Ambient lighthing calculation. Provides base illumination despite light direction to ensure minimum visible brightness across the surface
      vec3 ambient = ambientIntensity * baseColor;

      // Diffuse ligthing calculation. Simulates how light interacts with a  surface. Intensity depends on angle between light and surface normal
      vec3 lightDir = normalize(lightPos - vPosition); // light direction vector 
      float diff = max(dot(vNormal, lightDir), 0.0); // cosine of angle ,clamped to positive
      vec3 diffuse = diff * baseColor; //final diffuse calculation

      // Specular (Metal-like).Simulates reflective highlights, so it mimmicks metal behaviour of reflecting light
      vec3 viewDir = normalize(-vPosition); //make the object face towards the camera
      vec3 halfDir = normalize(lightDir + viewDir); //half angle vector for speculer
      float spec = pow(max(dot(vNormal, halfDir), 0.0), 64.0); // Higher shininess for metal
      vec3 specular = spec * baseColor; //final specular calculation

      // Combining all the necessary ligthings to receive final color
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
  // render the scene and camera
  renderer.render(scene, camera);
}
animate();