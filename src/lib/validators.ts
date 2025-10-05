import { z } from 'zod'

export const createCommunitySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(50).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
  joinPolicy: z.enum(['AUTO_JOIN', 'APPROVAL_REQUIRED', 'CLOSED']).default('AUTO_JOIN'),
  requiresLightningAddress: z.boolean().default(false),
  requiresNostrPubkey: z.boolean().default(false),
})

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  priceSats: z.number().min(0).default(0),
  minQuorum: z.number().min(0).default(0),
})

export const createPollSchema = z.object({
  question: z.string().min(1, 'Question is required').max(500),
  options: z.array(z.object({
    key: z.string(),
    label: z.string(),
  })).min(2, 'At least 2 options required'),
  endsAt: z.string().datetime().optional(),
})

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Body is required').max(2000),
})

export const createBadgeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
})

export const voteSchema = z.object({
  optionKey: z.string(),
})

export const joinCommunitySchema = z.object({
  lightningAddress: z.string().optional(),
  nostrPubkey: z.string().optional(),
})

export type CreateCommunityInput = z.infer<typeof createCommunitySchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
export type CreatePollInput = z.infer<typeof createPollSchema>
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>
export type CreateBadgeInput = z.infer<typeof createBadgeSchema>
export type VoteInput = z.infer<typeof voteSchema>
export type JoinCommunityInput = z.infer<typeof joinCommunitySchema>
