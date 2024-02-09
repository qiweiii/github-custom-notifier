import * as defaults from "../defaults";

function render(
  text: string,
  color: [number, number, number, number],
  title: string
) {
  browser.action.setBadgeText({ text });
  browser.action.setBadgeBackgroundColor({ color });
  browser.action.setTitle({ title });
}

function getCountString(count: number) {
  if (count === 0) {
    return "";
  }

  if (count > 9999) {
    return "∞";
  }

  return String(count);
}

function getErrorData(error: Error) {
  const title = defaults.getErrorTitle(error);
  const symbol = defaults.getErrorSymbol(error);
  return { symbol, title };
}

export function renderCount(count: number) {
  const color = defaults.getBadgeDefaultColor();
  const title = defaults.defaultTitle;
  render(getCountString(count), color, title);
}

export function renderError(error: Error) {
  const color = defaults.getBadgeErrorColor();
  const { symbol, title } = getErrorData(error);
  render(symbol, color, title);
}

export function renderWarning(warning: string) {
  const color = defaults.getBadgeWarningColor();
  const title = defaults.getWarningTitle(warning);
  const symbol = defaults.getWarningSymbol(warning);
  render(symbol, color, title);
}
