/**
 * Rulers API stub — screen-space rulers over the scene viewport (Wave 5+).
 */

export interface RulerTick {
  world: number;
  screen: number;
  major: boolean;
}

export interface RulersSource {
  getHorizontalTicks(): RulerTick[];
  getVerticalTicks(): RulerTick[];
}

export interface RulersController {
  enabled: boolean;
  setEnabled(enabled: boolean): void;
  /** No-op until UI ships. */
  measure(): RulersSource;
}

export function createRulersStub(): RulersController {
  let enabled = false;
  return {
    get enabled() {
      return enabled;
    },
    setEnabled(v) {
      enabled = v;
    },
    measure(): RulersSource {
      return {
        getHorizontalTicks: () => [],
        getVerticalTicks: () => [],
      };
    },
  };
}
