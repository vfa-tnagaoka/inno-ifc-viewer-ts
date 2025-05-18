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

const ambient = new THREE.AmbientLight(0xffffff, 0.4); // 色, 強さ
scene.add(ambient);

// 各ファイルごとにモデルを保持
const modelMap = new Map<string, IFCModel>();

// 一度ロードしたモデルはキャッシュ
async function loadModel(fileName: string): Promise<IFCModel> {
  if (modelMap.has(fileName)) return modelMap.get(fileName)!;

  const loader = new IFCLoader();
  loader.ifcManager.setWasmPath("https://unpkg.com/web-ifc@0.0.39/");

  const model = (await loader.loadAsync(`/${fileName}`)) as IFCModel;

  // 安全にマテリアルを上書き（確実な色分け）
  const color = getModelColor(fileName);
  model.mesh.material = new THREE.MeshStandardMaterial({ color });

  modelMap.set(fileName, model);
  return model;
}

function getModelColor(fileName: string): string {
  if (fileName.includes("Arch")) return "#e57373"; // 赤系
  if (fileName.includes("CON")) return "#64b5f6"; // 青系
  if (fileName.includes("HVAC")) return "#81c784"; // 緑系
  return "#ffffff"; // デフォルト
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
