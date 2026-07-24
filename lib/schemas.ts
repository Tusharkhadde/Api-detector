import { z } from "zod";

export const connectionFormSchema = z.object({
  apiKey: z.string().trim().min(0).max(500).optional().default(""),
  baseUrl: z
    .string()
    .trim()
    .min(1, "Base URL is required")
    .refine(
      (val) => {
        try {
          const u = new URL(val);
          return u.protocol === "http:" || u.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Enter a valid URL, e.g. https://api.openai.com/v1" }
    ),
});

export type ConnectionFormValues = z.infer<typeof connectionFormSchema>;

export const chatFormSchema = z.object({
  model: z.string().trim().min(1, "Select a model"),
  prompt: z.string().trim().min(1, "Prompt cannot be empty").max(8000),
});

export type ChatFormValues = z.infer<typeof chatFormSchema>;
