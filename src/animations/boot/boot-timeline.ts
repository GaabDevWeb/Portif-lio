import gsap from "gsap";

import { BOOT_TIMING } from "@/constants/boot";
import { MOTION_IDS } from "@/animations/motion-ids";

export function createBlackoutHold(): gsap.core.Timeline {
  return gsap.timeline({ id: MOTION_IDS.bootBlackoutHold });
}

export function animateSkipFade(element: HTMLElement): gsap.core.Tween {
  return gsap.to(element, {
    id: MOTION_IDS.bootSkipFade,
    opacity: 0,
    duration: BOOT_TIMING.skipFade / 1000,
    ease: "power2.inOut",
  });
}

export function animateLedPulse(element: HTMLElement): gsap.core.Tween {
  return gsap.fromTo(
    element,
    { scale: 0.6, opacity: 0.2 },
    {
      id: MOTION_IDS.bootLedOn,
      scale: 1,
      opacity: 1,
      duration: BOOT_TIMING.ledOn / 1000,
      ease: "power2.out",
    },
  );
}

export function animateCameraPush(
  object: { position: { z: number } },
  targetZ: number,
): gsap.core.Tween {
  return gsap.to(object.position, {
    id: MOTION_IDS.bootCameraPush,
    z: targetZ,
    duration: BOOT_TIMING.cameraPush / 1000,
    ease: "power3.inOut",
  });
}

export function animateFlicker(
  setIntensity: (value: number) => void,
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
      duration: BOOT_TIMING.crtFlicker / 1000,
      repeat: 2,
      yoyo: true,
      onUpdate() {
        setIntensity(this.targets()[0].value);
      },
    },
  );

  return tl;
}

export function animateLoginFade(element: HTMLElement): gsap.core.Tween {
  return gsap.fromTo(
    element,
    { opacity: 0, y: 8 },
    {
      opacity: 1,
      y: 0,
      duration: BOOT_TIMING.loginFade / 1000,
      ease: "power2.out",
    },
  );
}
