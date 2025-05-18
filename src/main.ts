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

  showLoading(true); // ← 表示

  const loader = new IFCLoader();
  loader.ifcManager.setWasmPath("https://unpkg.com/web-ifc@0.0.39/");

  const model = (await loader.loadAsync(`/${fileName}`)) as IFCModel;

  const color = getModelColor(fileName);
  const offset = getPolygonOffset(fileName);

  if (fileName.includes("Arch")) {
    model.mesh.material = new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
  } else {
    model.mesh.material = new THREE.MeshStandardMaterial({
      color,
      polygonOffset: true,
      polygonOffsetFactor: offset.factor,
      polygonOffsetUnits: offset.units,
    });
  }

  modelMap.set(fileName, model);

  showLoading(false); // ← 非表示
  return model;
}

function showLoading(show: boolean) {
  const el = document.getElementById("loading");
  if (el) el.style.display = show ? "block" : "none";
}

function getModelColor(fileName: string): string {
  if (fileName.includes("Arch")) return "#64b5f6"; // 赤系
  if (fileName.includes("CON")) return "#81c784"; // 青系
  if (fileName.includes("HVAC")) return "#e57373"; // 緑系
  return "#ffffff"; // デフォルト
}

function getPolygonOffset(fileName: string): { factor: number; units: number } {
  if (fileName.includes("Arch")) return { factor: 1, units: 1 };
  if (fileName.includes("CON")) return { factor: 2, units: 2 };
  if (fileName.includes("HVAC")) return { factor: 3, units: 3 };
  return { factor: 0, units: 0 };
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

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
});
