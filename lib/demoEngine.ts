export type EventType = "noHelmet" | "noHarness" | "noVest" | "restricted" | "theft" | "pmHigh" | "pmOk";

export type DemoEvent = {
  id: number;
  type: EventType;
  cam: string;
  zone: number;
  value?: number;
  at: number;
  severity: "high" | "medium" | "info";
};

export const CAMS = ["CAM 01", "CAM 02", "CAM 03", "CAM 04"];

const SAFETY_TYPES: EventType[] = ["noHelmet", "noVest", "noHarness", "restricted"];

const SEVERITY: Record<EventType, DemoEvent["severity"]> = {
  noHelmet: "medium",
  noVest: "medium",
  noHarness: "high",
  restricted: "high",
  theft: "high",
  pmHigh: "high",
  pmOk: "info",
};

let nextId = 1;

export function makeEvent(type: EventType, value?: number, camIndex?: number): DemoEvent {
  const ci = camIndex ?? Math.floor(Math.random() * CAMS.length);
  return {
    id: nextId++,
    type,
    cam: CAMS[ci],
    zone: ci,
    value,
    at: Date.now(),
    severity: SEVERITY[type],
  };
}

export function randomSafetyEvent(): DemoEvent {
  const type = SAFETY_TYPES[Math.floor(Math.random() * SAFETY_TYPES.length)];
  return makeEvent(type);
}

/** Random walk for PM10 with a pull towards a target level. */
export function nextPm(current: number, target: number) {
  const pull = (target - current) * 0.18;
  const noise = (Math.random() - 0.5) * 4;
  return Math.max(8, Math.min(140, current + pull + noise));
}

export const SCORE_PENALTY: Record<DemoEvent["severity"], number> = { high: 6, medium: 3, info: 0 };
