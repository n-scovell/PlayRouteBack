import { z } from 'zod'

// const noHtml = z
//   .string()
//   .trim()
//   .regex(/^[^<>]*$/, 'HTML is not allowed')

const genericInput =
z.string()
.trim()
.regex(/^[^<>]*$/, 'HTML is not allowed')
.min(1, 'This field is required')
.max(150, 'Input is too long')

const emailSchema = 
  z.string()
  .trim()
  .email('Invalid email address')
  .max(150, 'Email is too long')

const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .max(100, 'Password is too long')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character')
  

const teamPinSchema = z
  .string()
  .trim()
  .min(4, 'Team PIN is required')
  .max(20, 'Team PIN is too long')
  .regex(/^[^<>]*$/, 'HTML is not allowed')

const userIdSchema = z
  .string()
  .trim()
  .min(1, 'User ID is required')


  // password?: string
  // name?: string
  // teamPin?: string
  // sport?: string
  // team?: string

export const updateSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  action: z.literal('update'),
  name: genericInput,
  sport: genericInput,
  team: genericInput
})

export const loginSchema = z.object({
  action: z.literal('login'),
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export const playerLoginSchema = z.object({
  action: z.literal('player-login'),
  team: z
    .string()
    .trim()
    .regex(/^[^<>]*$/, 'HTML is not allowed')
    .min(1, 'Team is required')
    .max(100, 'Team name is too long'),
  teamPin: teamPinSchema
})

export const createUserSchema = z.object({
  action: z.literal('create'),
  email: emailSchema,
  password: passwordSchema,
  teamPin: teamPinSchema,
  name: genericInput,
  sport: genericInput,
  team: genericInput
})