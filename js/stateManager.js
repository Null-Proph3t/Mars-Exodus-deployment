export function getState(progress) {
  if (progress < 0.2) return "EARTH";
  if (progress < 0.4) return "PREP";
  if (progress < 0.6) return "IGNITION";
  if (progress < 0.8) return "SPACE";
  return "MARS";
}