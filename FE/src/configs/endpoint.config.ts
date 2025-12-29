export const apiPrefix = '/api'

const endpointConfig = {
    // Auth endpoints
    signIn: '/sign-in',
    signOut: '/sign-out',
    signUp: '/sign-up',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',

    // User endpoints
    users: '/users',
    userById: '/users/:id',
    userTeam: '/users/team/:userId',
    userHierarchy: '/users/hierarchy/:userId',
    pendingApprovals: '/users/pending-approvals',
    approvalById: '/approvals/:id',

    // Contract endpoints
    contracts: '/contracts',
    contractById: '/contracts/:id',
    myContracts: '/contracts/my-contracts',
    pendingContracts: '/contracts/pending',
    commissions: '/contracts/commissions/:userId',
    contractStatistics: '/contracts/statistics',

    // Property endpoints
    properties: '/properties',
    propertyById: '/properties/:id',
    myProperties: '/properties/my-properties',
    teamProperties: '/properties/team-properties',
    propertyStatistics: '/properties/statistics',

    // Notification endpoints
    notifications: '/notifications',
    notificationById: '/notifications/:id',
    markNotificationRead: '/notifications/:id/read',
    markAllNotificationsRead: '/notifications/read-all',
    notificationStatistics: '/notifications/statistics',
}

export default endpointConfig
