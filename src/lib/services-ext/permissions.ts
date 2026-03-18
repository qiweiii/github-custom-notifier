import { logger } from '../util';

type ManifestPermission = NonNullable<Browser.permissions.Permissions['permissions']>[number];

export async function queryPermission(permission: ManifestPermission) {
  try {
    return browser.permissions.contains({ permissions: [permission] });
  } catch (error) {
    logger.error(error);
    return false;
  }
}

export async function requestPermission(permission: ManifestPermission) {
  try {
    return browser.permissions.request({ permissions: [permission] });
  } catch (error) {
    logger.error(error);
    return false;
  }
}
