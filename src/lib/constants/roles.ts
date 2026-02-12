// Role hierarchy and constants
export const ROLE_HIERARCHY = {
  LEADER: 4,
  ADMIN: 3,
  VIP: 2,
  USER: 1,
} as const;

export type RoleName = keyof typeof ROLE_HIERARCHY;
