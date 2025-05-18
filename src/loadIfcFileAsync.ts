import { IFCLoader } from "web-ifc-three/IFCLoader";
import * as THREE from "three";

export function loadIfcFileAsync(loader: IFCLoader, url: string): Promise<THREE.Object3D> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (model) => resolve(model),
      undefined,
      (error) => reject(error)
    );
  });
}
