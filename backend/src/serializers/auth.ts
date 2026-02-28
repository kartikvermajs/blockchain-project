import { z } from "zod";

export const SAuth = z.object({
  email: z.string().email(),
})
export type TAuth = z.infer<typeof SAuth>;

export const SVerifyOtp = SAuth.extend({
  otp: z.string().length(6),
});
export type TVerifyOtp = z.infer<typeof SVerifyOtp>;
