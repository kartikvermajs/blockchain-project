import { z } from "zod";  // for validation (replace with your serializers if you want)

export const SCreateKey = z.object({ key: z.string().min(1) });
export const SActivateKey = z.object({ key: z.string().min(1) });
export const SSetExpiry = z.object({
  key: z.string().min(1),
  expiryTimestamp: z.number().int().gt(Math.floor(Date.now() / 1000))
});
export const SGetKeyInfo = z.object({ key: z.string().min(1) });
