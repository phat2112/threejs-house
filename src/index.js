import "./index.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import * as dat from "dat.gui";

// scene
const scene = new THREE.Scene();
const canvas = document.querySelector(".webgl");
const gui = new dat.GUI({ name: "debug UI" });

/*
 * @param Variables
 */
const parameters = {
  color: "#ff0000",
  spin: () => {
    console.log("rotation", mesh.rotation);
    gsap.to(mesh.rotation, {
      duration: 1,
      y: (mesh.rotation.y + 1) * Math.PI * 3,
    });
  },
};

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: parameters.color });
const mesh = new THREE.Mesh(geometry, material);

gui.add(mesh.position, "x").min(-3).max(3).step(0.01);
gui.add(mesh.position, "y").min(-3).max(3).step(0.01);
gui.add(mesh.position, "z").min(-3).max(3).step(0.01);

gui.add(mesh, "visible");

gui.addColor(parameters, "color").onChange(() => {
  material.color.set(parameters.color);
});
gui.add(parameters, "spin");

scene.add(mesh);

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

window.addEventListener("dblclick", () => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// renderer
const renderer = new THREE.WebGL1Renderer({
  canvas,
});

// control
const control = new OrbitControls(camera, renderer.domElement);
control.enableDamping = true;
gui.add(control, "enableDamping");

renderer.setSize(sizes.width, sizes.height);

function tick() {
  control.update();

  window.requestAnimationFrame(tick);
  renderer.render(scene, camera);
}

tick();
