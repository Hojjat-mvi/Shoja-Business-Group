import type { UserRole } from '@/constants/roles.constant'

export type NotificationType =
    | 'user_approval'
    | 'contract_review'
    | 'property_update'
    | 'commission_paid'
    | 'system'

export interface Notification {
    id: string
    type: NotificationType
    title: string
    message: string
    recipientId: string
    recipientName: string
    senderId?: string
    senderName?: string
    isRead: boolean
    createdAt: string
    readAt?: string
    actionUrl?: string
    metadata?: Record<string, any>
}

export interface UserApprovalRequest {
    id: string
    requestedUserId: string
    requestedUserName: string
    requestedUserEmail: string
    requestedUserRole: UserRole
    requestedByManagerId: string
    requestedByManagerName: string
    requestedByManagerRole: UserRole
    status: 'pending' | 'approved' | 'rejected'
    requestedAt: string
    reviewedBy?: string
    reviewedByName?: string
    reviewedAt?: string
    reviewNotes?: string
}

export interface NotificationStatistics {
    totalNotifications: number
    unreadNotifications: number
    byType: {
        [key in NotificationType]?: number
    }
}
