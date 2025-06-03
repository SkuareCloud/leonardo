import { z } from "zod";
import { zAvatarModelWithProxy } from "./avatars/zod.gen";
import { zProfileWorkerView } from "./operator/zod.gen";

export const zCombinedAvatar = z.object({
  profile_worker_view: zProfileWorkerView.optional(),
  avatar: zAvatarModelWithProxy.optional(),
});
export type CombinedAvatar = z.infer<typeof zCombinedAvatar>;
