import ApiService from './ApiService'
import type {
    Notification,
    NotificationStatistics,
} from '@/@types/notification'

// Get user's notifications
export async function apiGetNotifications(userId: string) {
    return ApiService.fetchDataWithAxios<{ data: Notification[] }>({
        url: '/api/notifications',
        method: 'get',
        params: { userId },
    })
}

// Mark single notification as read
export async function apiMarkNotificationRead(notificationId: string) {
    return ApiService.fetchDataWithAxios<{
        data: Notification
        message: string
    }>({
        url: `/api/notifications/${notificationId}/read`,
        method: 'put',
    })
}

// Mark all notifications as read
export async function apiMarkAllNotificationsRead(userId: string) {
    return ApiService.fetchDataWithAxios<{ message: string }>({
        url: '/api/notifications/read-all',
        method: 'put',
        params: { userId },
    })
}

// Create new notification (system use)
export async function apiCreateNotification(
    notificationData: Partial<Notification>
) {
    return ApiService.fetchDataWithAxios<{
        data: Notification
        message: string
    }>({
        url: '/api/notifications',
        method: 'post',
        data: notificationData,
    })
}

// Delete notification
export async function apiDeleteNotification(notificationId: string) {
    return ApiService.fetchDataWithAxios<{ message: string }>({
        url: `/api/notifications/${notificationId}`,
        method: 'delete',
    })
}

// Get notification statistics
export async function apiGetNotificationStatistics(userId: string) {
    return ApiService.fetchDataWithAxios<{ data: NotificationStatistics }>({
        url: '/api/notifications/statistics',
        method: 'get',
        params: { userId },
    })
}
