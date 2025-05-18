import * as THREE from "three";
import { IFCLoader } from "web-ifc-three/IFCLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls: OrbitControls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // モダンな慣性付き操作
controls.target.set(0, 0, 0); // 注視点を原点に
controls.update();

// 光源
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

// IFC ローダーの設定
const ifcLoader = new IFCLoader();
ifcLoader.ifcManager.setWasmPath("https://unpkg.com/web-ifc@0.0.39/");

// ファイルアップロードでIFC読み込み
const input = document.getElementById("file-input") as HTMLInputElement;
input.addEventListener("change", async (event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  const model = (await ifcLoader.loadAsync(url)) as THREE.Object3D;
  scene.add(model);
});

// 描画ループ
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};
animate();
