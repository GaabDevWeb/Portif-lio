import gsap from "gsap";

import { MOTION_IDS } from "@/animations/motion-ids";
import { INTRO_CAMERA, INTRO_TIMING } from "@/features/intro/constants";
import type { CameraRigState } from "@/features/intro/types";

export function createRevealTween(
  setReveal: (value: number) => void,
): gsap.core.Tween {
  return gsap.fromTo(
    { value: 0 },
    { value: 0 },
    {
      id: MOTION_IDS.bootBlackoutHold,
      value: 1,
      duration: INTRO_TIMING.revealMs / 1000,
      ease: "power2.out",
      onUpdate() {
        setReveal(this.targets()[0].value);
      },
    },
  );
}

export function createCrtFlickerTimeline(
  setFlicker: (value: number) => void,
  onComplete: () => void,
): gsap.core.Timeline {
  const tl = gsap.timeline({
    id: MOTION_IDS.bootCrtFlicker,
    onComplete,
  });

  tl.to(
    { value: 0 },
    {
      value: 1,
      duration: INTRO_TIMING.crtFlickerMs / 1000,
      repeat: 2,
      yoyo: true,
      ease: "steps(3)",
      onUpdate() {
        setFlicker(this.targets()[0].value);
      },
    },
  );

  return tl;
}

export function createCameraTransitionTimeline(
  rig: CameraRigState,
  setRig: (rig: CameraRigState) => void,
  onComplete: () => void,
): gsap.core.Timeline {
  const proxy = {
    px: rig.position[0],
    py: rig.position[1],
    pz: rig.position[2],
    fov: rig.fov,
    lx: rig.lookAt[0],
    ly: rig.lookAt[1],
    lz: rig.lookAt[2],
  };

  const end = INTRO_CAMERA.transitionEnd;

  return gsap.timeline({
    id: MOTION_IDS.bootCameraPush,
    onComplete,
  }).to(proxy, {
    px: end.position[0],
    py: end.position[1],
    pz: end.position[2],
    fov: end.fov,
    lx: end.lookAt[0],
    ly: end.lookAt[1],
    lz: end.lookAt[2],
    duration: INTRO_TIMING.cameraTransitionMs / 1000,
    ease: "power3.inOut",
    onUpdate() {
      setRig({
        position: [proxy.px, proxy.py, proxy.pz],
        fov: proxy.fov,
        lookAt: [proxy.lx, proxy.ly, proxy.lz],
      });
    },
  });
}

export function createTerminalRevealTween(
  element: HTMLElement,
): gsap.core.Tween {
  return gsap.fromTo(
    element,
    { opacity: 0, scale: 0.98 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "power2.out",
      delay: INTRO_TIMING.cameraTransitionMs / 1000 - 0.5,
    },
  );
}
