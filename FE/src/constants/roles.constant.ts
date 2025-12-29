// Legacy roles (kept for backward compatibility during transition)
export const ADMIN = 'admin'
export const USER = 'user'

// New hierarchical roles
export const SUPER_ADMIN = 'super_admin'
export const EDUCATION_MANAGER = 'education_manager'
export const SALES_MANAGER = 'sales_manager'
export const AGENT = 'agent'

// Role hierarchy levels (higher number = higher authority)
export const ROLE_HIERARCHY = {
    [SUPER_ADMIN]: 4,
    [EDUCATION_MANAGER]: 3,
    [SALES_MANAGER]: 2,
    [AGENT]: 1,
} as const

// Role display labels (English - will use i18n for Persian in UI)
export const ROLE_LABELS = {
    [SUPER_ADMIN]: 'Super Admin',
    [EDUCATION_MANAGER]: 'Education Manager',
    [SALES_MANAGER]: 'Sales Manager',
    [AGENT]: 'Agent',
} as const

// Type definitions
export type UserRole =
    | typeof SUPER_ADMIN
    | typeof EDUCATION_MANAGER
    | typeof SALES_MANAGER
    | typeof AGENT

export type LegacyRole = typeof ADMIN | typeof USER

// Helper function to get role level
export const getRoleLevel = (role: UserRole): number => {
    return ROLE_HIERARCHY[role] || 0
}

// Helper function to check if role can manage another role
export const canManageRole = (managerRole: UserRole, targetRole: UserRole): boolean => {
    return getRoleLevel(managerRole) > getRoleLevel(targetRole)
}
