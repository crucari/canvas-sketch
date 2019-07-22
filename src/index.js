const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");

// Import ThreeJS and assign it to global scope
// This way examples/ folder can use it too
global.THREE = require("three");

// Import any examples/ from ThreeJS
require("three/examples/js/controls/OrbitControls");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
  // Turn on MSAA
  attributes: { antialias: true }
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context
  });

  // WebGL background color
  renderer.setClearColor("hsl(10, 60%, 70%)", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(2, 2, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup mouse orbit controller
  const controls = new THREE.OrbitControls(camera);

  // Setup your scene
  const scene = new THREE.Scene();

  // Create a bunch of 'particles' in a group for the BG
  const background = createBackgroundGroup();
  scene.add(background);

  // Add a little mesh to the centre of the screen
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.25, 0),
    new THREE.MeshBasicMaterial({
      color: "hsl(0, 0%, 15%)",
      wireframe: true
    })
  );
  scene.add(mesh);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // And render events here
    render({ time, deltaTime }) {
      // Rotate background subtly
      background.rotation.y = time * 0.01;
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of WebGL context (optional)
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };

  function createBackgroundGroup() {
    // Make sure we re-use this geometry instead of
    // creating one per mesh :)
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    // Choose some hue values in 0..1 space
    // (e.g. 0.5 is the same as 0.5 * 360)
    const baseHues = [0.0, 0.5];

    // # of particles in background
    const count = 400;

    const meshes = Array.from(new Array(count)).map(() => {
      // Choose a random base hue
      const baseHue = random.pick(baseHues);
      // Offset it slightly in both directions
      const hue = baseHue + random.gaussian() * (5 / 360);
      // Now make a HSL material
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(hue, 0.65, 0.65)
      });
      // Make a mesh
      const mesh = new THREE.Mesh(geometry, material);

      // Choose a radius away from the centre of the world
      const radius = random.range(7.5, 40);

      // Now get a random XYZ within those spherical bounds
      const [x, y, z] = random.onSphere(radius);

      // Turn it into ThreeJS vec3
      const position = new THREE.Vector3(x, y, z);

      // move it into place
      mesh.position.copy(position);

      // Choose a thickness to the line
      const thickness = random.gaussian(0.05, 0.035);
      // Choose a length for the line
      const length = random.gaussian(2.5, 2);
      // Set the Mesh scale to that thickness X length
      mesh.scale.set(thickness, thickness, length);

      // Now lets rotate each mesh randomly
      // We can create a random rotation using 'quaternion' helper
      // (quaternion is a fancy way to define rotation)
      const quatArray = random.quaternion();
      // Copy the resulting [xyzw] array into the mesh quaternion
      mesh.quaternion.fromArray(quatArray);

      return mesh;
    });

    // Create a 'group' object to hold many objects in one
    const group = new THREE.Group();
    // Add each mesh to the group
    meshes.forEach(m => group.add(m));
    return group;
  }
};

canvasSketch(sketch, settings);
