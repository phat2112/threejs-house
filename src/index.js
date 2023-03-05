import "./index.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";
import * as dat from "dat.gui";

// scene
const scene = new THREE.Scene();
const canvas = document.querySelector(".webgl");
const rayCaster = new THREE.Raycaster();
const gui = new dat.GUI({ name: "debug UI" });

// parameters
const cursor = new THREE.Vector2();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// global variables
const MAX_DELAY = 5;
let intersects;
let table;
let currentTargetObj;
let count = 0;

// scene background
scene.background = new THREE.Color(0xffffff);

// loaders
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

// floor texture
const floorMap = textureLoader.load(
  "/textures/floor/laminate_floor/laminate_floor_diff.jpg"
);
const floorNormal = textureLoader.load(
  "/textures/floor/laminate_floor/laminate_floor_nor.png"
);
const floorRough = textureLoader.load(
  "/textures/floor/laminate_floor/laminate_floor_rough.png"
);
const floorDisplacement = textureLoader.load(
  "/textures/floor/laminate_floor/laminate_floor_disp.png"
);

// wall
const wallMap = textureLoader.load("/textures/floor/beige_wall/beige_wall.jpg");
const wallDisplacement = textureLoader.load(
  "/textures/floor/beige_wall/beige_wall_disp.png"
);
const wallRough = textureLoader.load(
  "/textures/floor/beige_wall/beige_wall_rough.jpg"
);

// lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.8);
pointLight.position.x = -1;
pointLight.position.y = 2;
pointLight.position.z = 1;
scene.add(pointLight);

const pointLightHelper = new THREE.PointLightHelper(pointLight);
pointLightHelper.visible = false;
scene.add(pointLightHelper);

// geometries
const home = new THREE.Group();
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 5, 100, 100),
  new THREE.MeshStandardMaterial({
    map: floorMap,
    normalMap: floorNormal,
    displacementMap: floorDisplacement,
    displacementScale: 0.001,
    roughnessMap: floorRough,
    side: THREE.DoubleSide,
  })
);

floor.name = "floor";
floor.rotation.x = -(Math.PI / 2);

const wall = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 5, 100, 100),
  new THREE.MeshStandardMaterial({
    map: wallMap,
    displacementMap: wallDisplacement,
    displacementScale: 0.001,
    roughnessMap: wallRough,
    side: THREE.DoubleSide,
  })
);

const wall1 = wall.clone();
wall1.position.y = 2.5;
wall1.position.z = -2.5;
wall1.name = "wall1";

const wall2 = wall.clone();
wall2.position.y = 2.5;
wall2.position.x = 2.5;
wall2.rotation.y = -(Math.PI / 2);
wall2.name = "wall2";

// table
gltfLoader.load(
  "/textures/table/scene.gltf",
  (model) => {
    model.scene.scale.set(0.5, 0.5, 0.5);

    model.scene.position.y = 0.5;
    model.scene.position.z = 1;
    model.scene.name = "table";
    home.add(model.scene);

    table = model.scene;
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  }
);

home.add(floor, wall1, wall2);
scene.add(home);

// camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 5;
camera.position.y = 3;
scene.add(camera);

// renderer
const renderer = new THREE.WebGL1Renderer({
  canvas,
});

// control
const control = new OrbitControls(camera, renderer.domElement);

renderer.setSize(sizes.width, sizes.height);

// window events
window.addEventListener("mousemove", (event) => {
  cursor.x = (event.clientX / sizes.width) * 2 - 1;
  cursor.y = -(event.clientY / sizes.height) * 2 + 1;

  // detect intersection
  rayCaster.setFromCamera(cursor, camera);
  intersects = rayCaster.intersectObjects(home.children);
});

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

const handleUpdateCamera = (object) => {
  if (currentTargetObj) {
    count = 0;
  }
  camera.lookAt(object.position);
  currentTargetObj = object;
};

window.addEventListener("click", () => {
  for (const intersect of intersects) {
    switch (intersect.object.name) {
      case "wall1": {
        gsap.to(camera.position, {
          x: 0,
          y: 1,
          z: 4,
          duration: 1.5,
          onUpdate: handleUpdateCamera(wall1),
        });

        break;
      }

      case "wall2": {
        gsap.to(camera.position, {
          x: -5,
          y: 0,
          z: 0,
          duration: 1.5,
          onUpdate: handleUpdateCamera(wall2),
        });
        break;
      }

      case "Object_2": {
        gsap.to(camera.position, {
          y: 2,
          z: 2,
          duration: 1.5,
          onUpdate: () => {
            if (table) {
              handleUpdateCamera(table);
              control.target = table.position;
              control.autoRotate = true;
              control.autoRotateSpeed = 0.5;
            }
          },
        });
      }
    }
  }
});

function tick() {
  control.update();

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}

tick();
