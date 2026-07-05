const { z } = require("zod");
const ROLES = require("../constants/roles");
const validate = require("../middleware/validate");

const registerSchema = z.object({
  fullName: z.string().trim().min(1, { message: "Full name is required." }),
  email: z.string().email({ message: "Valid email is required." }),
  phone: z.string().trim().min(1, { message: "Phone is required." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { message: "Must contain an uppercase letter." })
    .regex(/[a-z]/, { message: "Must contain a lowercase letter." })
    .regex(/\d/, { message: "Must contain a number." })
    .regex(/[^A-Za-z0-9]/, { message: "Must contain a special character." }),
  role: z.enum([ROLES.FARMER, ROLES.BUYER, ROLES.TRANSPORT], {
    message: "Invalid role.",
  }),
  vehicleType: z
    .enum(["MOTORBIKE", "TRICYCLE", "PICKUP", "MINI_TRUCK", "TRUCK", "OTHER"], {
      message: "Invalid vehicle type.",
    })
    .optional(),
  capacity: z.number().positive({ message: "Capacity must be a positive number." }).optional(),
});

const validateRegister = validate(registerSchema);

const loginSchema = z.object({
  email: z.string().email({ message: "Valid email is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const validateLogin = validate(loginSchema);

module.exports = { validateRegister, validateLogin };