import * as THREE from "three";
import { IFCLoader } from "web-ifc-three/IFCLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);
controls.update();

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

let currentModel: THREE.Object3D | null = null;
let ifcLoader: IFCLoader | null = null;

async function loadIFCFromPublic(fileName: string) {
  // 前回モデルを削除
  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }

  // IFCLoader を作り直す（←これが重要）
  ifcLoader = new IFCLoader();
  ifcLoader.ifcManager.setWasmPath("https://unpkg.com/web-ifc@0.0.39/");

  const model = (await ifcLoader.loadAsync(`/${fileName}`)) as THREE.Object3D;
  currentModel = model;
  scene.add(model);

  controls.target.set(0, 0, 0);
  controls.update();
}

// ボタンイベント設定
document.querySelectorAll<HTMLButtonElement>("button[data-ifc]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const file = btn.dataset.ifc!;
    loadIFCFromPublic(file);
  });
});

// 初期表示（任意）
loadIFCFromPublic("NVW_DCR-LOD300_Eng-HVAC.ifc");

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
