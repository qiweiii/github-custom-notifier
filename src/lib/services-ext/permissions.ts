export async function queryPermission(permission: string) {
  try {
    return browser.permissions.contains({ permissions: [permission] });
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function requestPermission(permission: any) {
  try {
    return browser.permissions.request({ permissions: [permission] });
  } catch (error) {
    console.log(error);
    return false;
  }
}
