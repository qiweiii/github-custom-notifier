/**
 * Api module has the main functions that will be used by the extension entrypoints,
 * it accesses storages/ and integrate functions in `services-github/` and `services-ext/`.
 */

import { getOctokit } from "./octokit";
import optionsStorage, { OptionsPageStorageV1 } from "./storage/options";

/**
 * Periodically call github api to get all data, process them to notifications, and store them in storage.
 *
 * Willed be used in background entrypoint
 */
export const pollData = (intervalInMinutes = 2) => {};
// helpers for pollData
const processEvents = () => {};

/**
 * Event Handler for `commented`, process the comment and store it in storage as a customNotification.
 */
export const onCommented = () => {};

/**
 * Event Handler for `labeled`, process the label and store it in storage as a customNotification.
 */
export const onLabeled = () => {};

/**
 * Event Handler for `mentioned`, process the mention and store it in storage as a customNotification.
 */
export const onMentioned = () => {};
