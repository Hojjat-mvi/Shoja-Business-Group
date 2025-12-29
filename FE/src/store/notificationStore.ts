import { create } from 'zustand'
import type { Notification, UserApprovalRequest } from '@/@types/notification'

type NotificationState = {
    notifications: Notification[]
    unreadCount: number
    approvalRequests: UserApprovalRequest[]
    showNotificationPanel: boolean
}

type NotificationAction = {
    setNotifications: (notifications: Notification[]) => void
    addNotification: (notification: Notification) => void
    markAsRead: (notificationId: string) => void
    markAllAsRead: () => void
    setApprovalRequests: (requests: UserApprovalRequest[]) => void
    updateApprovalRequest: (
        requestId: string,
        status: 'approved' | 'rejected',
        reviewNotes?: string
    ) => void
    toggleNotificationPanel: () => void
    clearNotificationData: () => void
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    approvalRequests: [],
    showNotificationPanel: false,
}

export const useNotificationStore = create<
    NotificationState & NotificationAction
>()((set) => ({
    ...initialState,

    setNotifications: (notifications) =>
        set(() => {
            const unreadCount = notifications.filter((n) => !n.isRead).length
            return {
                notifications,
                unreadCount,
            }
        }),

    addNotification: (notification) =>
        set((state) => {
            const newNotifications = [notification, ...state.notifications]
            const unreadCount = newNotifications.filter((n) => !n.isRead).length
            return {
                notifications: newNotifications,
                unreadCount,
            }
        }),

    markAsRead: (notificationId) =>
        set((state) => {
            const notifications = state.notifications.map((notification) =>
                notification.id === notificationId
                    ? {
                          ...notification,
                          isRead: true,
                          readAt: new Date().toISOString(),
                      }
                    : notification
            )
            const unreadCount = notifications.filter((n) => !n.isRead).length
            return {
                notifications,
                unreadCount,
            }
        }),

    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((notification) => ({
                ...notification,
                isRead: true,
                readAt: notification.readAt || new Date().toISOString(),
            })),
            unreadCount: 0,
        })),

    setApprovalRequests: (requests) =>
        set(() => ({
            approvalRequests: requests,
        })),

    updateApprovalRequest: (requestId, status, reviewNotes) =>
        set((state) => ({
            approvalRequests: state.approvalRequests.map((request) =>
                request.id === requestId
                    ? {
                          ...request,
                          status,
                          reviewNotes,
                          reviewedAt: new Date().toISOString(),
                      }
                    : request
            ),
        })),

    toggleNotificationPanel: () =>
        set((state) => ({
            showNotificationPanel: !state.showNotificationPanel,
        })),

    clearNotificationData: () => set(initialState),
}))
