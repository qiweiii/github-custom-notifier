import { logger } from '../util';

export async function queryPermission(permission: string) {
  try {
    return browser.permissions.contains({ permissions: [permission] });
  } catch (error) {
    logger.error(error);
    return false;
  }
}

export async function requestPermission(permission: any) {
  try {
    return browser.permissions.request({ permissions: [permission] });
  } catch (error) {
    logger.error(error);
    return false;
  }
}
