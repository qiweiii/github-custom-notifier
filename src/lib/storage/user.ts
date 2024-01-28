import { Endpoints } from "@octokit/types";

export type userInfoStorageV1 =
  | Endpoints["GET /user"]["response"]["data"]
  | null;

const userInfoStorage = storage.defineItem<userInfoStorageV1>(
  "local:userInfoStorage",
  {
    defaultValue: null,
  }
);

export default userInfoStorage;
