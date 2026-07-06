import type * as THREE from "three";

function disposeMaterial(material: THREE.Material): void {
  for (const key of Object.keys(material)) {
    const value = (material as unknown as Record<string, unknown>)[key];
    if (
      value &&
      typeof value === "object" &&
      "dispose" in value &&
      typeof (value as { dispose?: unknown }).dispose === "function"
    ) {
      (value as { dispose: () => void }).dispose();
    }
  }
  material.dispose();
}

export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;

    mesh.geometry?.dispose();

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (material) disposeMaterial(material);
    }
  });
}

export function disposeWebGLRenderer(gl: THREE.WebGLRenderer): void {
  gl.renderLists?.dispose();
  gl.dispose();
}
