const { z } = require("zod");

const userSchema = z.object({
  firstName: z
    .string()
    .min(3, "First Name must be more than 3 characters")
    .max(50, "First Name must be less than 50 characters"),
  lastName: z.string(),
  emailId: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z
    .string({ message: "Password must be string" })
    .min(6, "Password must be at least 6 characters long"),
  age: z.number().gte(18, "Age must be greater than 18"),
  gender: z.enum(["Male", "Female", "Others"], {
    message: "Gender must be male ,female or others",
  }),
  photoUrl: z
    .string()
    .url("Invalid URL")
    .default(
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpCKq1XnPYYDaUIlwlsvmLPZ-9-rdK28RToA&s"
    ),
  about: z.string().default("This is default about of User!"),
  skills: z.array(z.string().min(3, "Skill must be more than 3 characters"), {
    message: "Skills are required",
  }),
  createdAt: z.string().datetime().default(new Date().toISOString()),
  updatedAt: z.string().datetime().default(new Date().toISOString()),
});

module.exports = userSchema;
