import { z } from "zod";

export const subdepartmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  department_id: z.string().uuid("Select a department"),
  gl_code: z.string().max(20).optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type SubdepartmentFormData = z.infer<typeof subdepartmentSchema>;
