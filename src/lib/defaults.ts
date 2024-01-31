export const errorTitles = new Map([
  [
    "missing token",
    "Missing access token, please create one and enter it in Options",
  ],
  ["server error", "GitHub having issues serving requests"],
  ["client error", "Invalid token, enter a valid one"],
  ["network error", "You have to be connected to the Internet"],
  ["parse error", "Unable to handle server response"],
  ["default", "Unknown error"],
]);

export const errorSymbols = new Map([
  ["missing token", "X"],
  ["client error", "!"],
  ["default", "?"],
]);

export const warningTitles = new Map([
  ["default", "Unknown warning"],
  ["offline", "No Internet connnection"],
]);

export const warningSymbols = new Map([
  ["default", "warn"],
  ["offline", "off"],
]);

export const colors = new Map([
  ["default", [3, 102, 214, 255]],
  ["error", [203, 36, 49, 255]],
  ["warning", [245, 159, 0, 255]],
]);

export function getBadgeDefaultColor() {
  return colors.get("default") as [number, number, number, number];
}

export function getBadgeErrorColor() {
  return colors.get("error") as [number, number, number, number];
}

export function getBadgeWarningColor() {
  return colors.get("warning") as [number, number, number, number];
}

export function getWarningTitle(warning: string): string {
  return warningTitles.get(warning) || (warningTitles.get("default") as string);
}

export function getWarningSymbol(warning: string): string {
  return (
    warningSymbols.get(warning) || (warningSymbols.get("default") as string)
  );
}

export function getErrorTitle(error: Error): string {
  return (
    errorTitles.get(error.message) || (errorTitles.get("default") as string)
  );
}

export function getErrorSymbol(error: Error): string {
  return (
    errorSymbols.get(error.message) || (errorSymbols.get("default") as string)
  );
}

export const defaultTitle = "GitHub Custom Notifier";
