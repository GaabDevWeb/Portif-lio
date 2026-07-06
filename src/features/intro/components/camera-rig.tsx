"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import type { CameraRigState } from "@/features/intro/types";

interface CameraRigProps {
  rig: CameraRigState;
}

export function CameraRig({ rig }: CameraRigProps) {
  const { camera } = useThree();
  const lookAtRef = useRef(new THREE.Vector3(...rig.lookAt));

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = rig.fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, rig.fov]);

  useFrame(() => {
    camera.position.set(...rig.position);
    lookAtRef.current.set(...rig.lookAt);
    camera.lookAt(lookAtRef.current);
  });

  return null;
}
