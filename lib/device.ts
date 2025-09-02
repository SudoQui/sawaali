export function getDeviceId() {
  const k = "sawaali_device";
  if (typeof window === "undefined") return "server";
  let d = localStorage.getItem(k);
  if (!d) {
    d = crypto.randomUUID();
    localStorage.setItem(k, d);
  }
  return d;
}