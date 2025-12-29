import { mock } from '../MockAdapter'
import { notificationsData } from '../data/notificationData'
import type { Notification } from '@/@types/notification'

// In-memory copy for CRUD operations
let notifications = [...notificationsData]

// GET /api/notifications?userId=xxx - Get user's notifications
mock.onGet('/api/notifications').reply((config) => {
    const userId = config.params?.userId

    const userNotifications = notifications.filter(
        (n) => n.recipientId === userId
    )

    // Sort by created date (newest first)
    userNotifications.sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return [200, { data: userNotifications }]
})

// PUT /api/notifications/:id/read - Mark notification as read
mock.onPut(/\/api\/notifications\/[^/]+\/read$/).reply((config) => {
    const parts = config.url?.split('/')
    const id = parts?.[parts.length - 2]

    const index = notifications.findIndex((n) => n.id === id)

    if (index !== -1) {
        notifications[index] = {
            ...notifications[index],
            isRead: true,
            readAt: new Date().toISOString(),
        }

        return [
            200,
            {
                data: notifications[index],
                message: 'Notification marked as read',
            },
        ]
    }

    return [404, { message: 'Notification not found' }]
})

// PUT /api/notifications/read-all?userId=xxx - Mark all as read
mock.onPut('/api/notifications/read-all').reply((config) => {
    const userId = config.params?.userId

    notifications = notifications.map((n) => {
        if (n.recipientId === userId && !n.isRead) {
            return {
                ...n,
                isRead: true,
                readAt: new Date().toISOString(),
            }
        }
        return n
    })

    return [200, { message: 'All notifications marked as read' }]
})

// POST /api/notifications - Create new notification (system use)
mock.onPost('/api/notifications').reply((config) => {
    const newNotification = JSON.parse(config.data) as Omit<Notification, 'id'>

    const id = `notif-${notifications.length + 1}`

    const notificationToCreate: Notification = {
        ...newNotification,
        id,
        isRead: false,
        createdAt: new Date().toISOString(),
    }

    notifications.push(notificationToCreate)

    return [
        201,
        {
            data: notificationToCreate,
            message: 'Notification created',
        },
    ]
})

// DELETE /api/notifications/:id - Delete notification
mock.onDelete(/\/api\/notifications\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop()

    const index = notifications.findIndex((n) => n.id === id)

    if (index !== -1) {
        notifications.splice(index, 1)
        return [200, { message: 'Notification deleted' }]
    }

    return [404, { message: 'Notification not found' }]
})

// GET /api/notifications/statistics?userId=xxx - Get notification statistics
mock.onGet('/api/notifications/statistics').reply((config) => {
    const userId = config.params?.userId

    const userNotifications = notifications.filter(
        (n) => n.recipientId === userId
    )

    const stats = {
        totalNotifications: userNotifications.length,
        unreadNotifications: userNotifications.filter((n) => !n.isRead).length,
        byType: {
            user_approval: userNotifications.filter(
                (n) => n.type === 'user_approval'
            ).length,
            contract_review: userNotifications.filter(
                (n) => n.type === 'contract_review'
            ).length,
            property_update: userNotifications.filter(
                (n) => n.type === 'property_update'
            ).length,
            commission_paid: userNotifications.filter(
                (n) => n.type === 'commission_paid'
            ).length,
            system: userNotifications.filter((n) => n.type === 'system').length,
        },
    }

    return [200, { data: stats }]
})
