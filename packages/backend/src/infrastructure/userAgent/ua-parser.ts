import Bowser from "bowser";

export function getShortDeviceDescription(userAgentRaw: string | null): string {
  const userAgent = userAgentRaw?.trim();

  if (!userAgent) return "Unknown device";

  const parser = Bowser.getParser(userAgent);
  const browser = parser.getBrowserName();
  const os = parser.getOSName();
  const { vendor, model, type } = parser.getPlatform();

  const deviceName = [vendor, model].filter(Boolean).join(" ");

  if (deviceName && os) return `${deviceName} (${os})`;
  if (deviceName) return deviceName;
  if (browser && os) return `${browser} on ${os}`;
  if (browser || os) return browser || os;
  if (type) return `${type} device`;

  return "Unknown device";
}
