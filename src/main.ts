import * as THREE from "three";
import { IFCLoader } from "web-ifc-three/IFCLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import type { IFCModel } from "web-ifc-three";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 20, 20);

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

// 各ファイルごとにモデルを保持
const modelMap = new Map<string, IFCModel>();

// 一度ロードしたモデルはキャッシュ
async function loadModel(fileName: string): Promise<IFCModel> {
  if (modelMap.has(fileName)) return modelMap.get(fileName)!;

  const loader = new IFCLoader();
  loader.ifcManager.setWasmPath("https://unpkg.com/web-ifc@0.0.39/");

  const model = (await loader.loadAsync(`/${fileName}`)) as IFCModel;
  modelMap.set(fileName, model);
  return model;
}

// トグル表示の管理
async function toggleModel(button: HTMLButtonElement) {
  const fileName = button.dataset.ifc!;
  const isActive = button.classList.toggle("active");

  if (isActive) {
    const model = await loadModel(fileName);
    scene.add(model);
  } else {
    const model = modelMap.get(fileName);
    if (model) scene.remove(model);
  }
}

// ボタンイベントの設定
const buttons = document.querySelectorAll<HTMLButtonElement>("button[data-ifc]");
buttons.forEach((button) => {
  button.addEventListener("click", () => toggleModel(button));
});

// 初期状態ですべて表示
buttons.forEach((button) => {
  button.classList.add("active");
  toggleModel(button);
});

// 描画ループ
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
