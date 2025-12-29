import { useEffect, useState } from 'react'
import { Card, Button, Badge, Avatar, Input } from '@/components/ui'
import { useUserStore } from '@/store/userStore'
import { useSessionUser } from '@/store/authStore'
import type { UserApprovalRequest } from '@/@types/notification'
import {
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineUser,
    HiOutlineClock,
} from 'react-icons/hi'
import { SUPER_ADMIN, EDUCATION_MANAGER, SALES_MANAGER, AGENT } from '@/constants/roles.constant'

const roleLabels: Record<string, string> = {
    [SUPER_ADMIN]: 'مدیر کل',
    [EDUCATION_MANAGER]: 'مدیر آموزش',
    [SALES_MANAGER]: 'مدیر فروش',
    [AGENT]: 'مشاور',
}

const PendingApprovals = () => {
    const currentUser = useSessionUser((state) => state.user)
    const { pendingApprovals, fetchPendingApprovals, approveUserRequest } =
        useUserStore()

    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                await fetchPendingApprovals()
            } catch (error) {
                console.error('Error loading pending approvals:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [fetchPendingApprovals])

    const handleApprove = async (request: UserApprovalRequest) => {
        if (!currentUser.userId || !currentUser.userName) {
            alert('خطا: اطلاعات کاربر موجود نیست')
            return
        }

        setProcessingId(request.id)
        try {
            await approveUserRequest(
                request.id,
                'approved',
                currentUser.userId,
                currentUser.userName,
                reviewNotes[request.id] || undefined
            )
            alert('کاربر با موفقیت تایید شد')
            await fetchPendingApprovals()
        } catch (error) {
            console.error('Error approving user:', error)
            alert('خطا در تایید کاربر')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (request: UserApprovalRequest) => {
        if (!currentUser.userId || !currentUser.userName) {
            alert('خطا: اطلاعات کاربر موجود نیست')
            return
        }

        if (!reviewNotes[request.id]) {
            alert('لطفاً دلیل رد را وارد کنید')
            return
        }

        if (
            !confirm('آیا از رد این درخواست اطمینان دارید؟')
        ) {
            return
        }

        setProcessingId(request.id)
        try {
            await approveUserRequest(
                request.id,
                'rejected',
                currentUser.userId,
                currentUser.userName,
                reviewNotes[request.id]
            )
            alert('درخواست رد شد')
            await fetchPendingApprovals()
        } catch (error) {
            console.error('Error rejecting user:', error)
            alert('خطا در رد درخواست')
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        در حال بارگذاری...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    تاییدیه‌های در انتظار
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    درخواست‌های ایجاد کاربر جدید را بررسی و تایید کنید
                </p>
            </div>

            {/* Stats Card */}
            <Card className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-500/20">
                        <HiOutlineClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            درخواست‌های در انتظار
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {new Intl.NumberFormat('fa-IR').format(
                                pendingApprovals.length
                            )}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Pending Requests */}
            {pendingApprovals.length === 0 ? (
                <Card className="p-12">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                            <HiOutlineUser className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            درخواستی در انتظار نیست
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            درخواست‌های جدید اینجا نمایش داده می‌شوند
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {pendingApprovals.map((request) => (
                        <Card key={request.id} className="p-6">
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar
                                            size={60}
                                            shape="circle"
                                            className="bg-primary-100 text-primary-600"
                                        >
                                            {request.requestedUserName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </Avatar>
                                        <div>
                                            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {request.requestedUserName}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {request.requestedUserEmail}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <Badge className="blue">
                                                    {roleLabels[request.requestedUserRole]}
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                    •
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    درخواست شده در:{' '}
                                                    {new Date(
                                                        request.requestedAt
                                                    ).toLocaleDateString('fa-IR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400">
                                        در انتظار بررسی
                                    </Badge>
                                </div>

                                {/* User Details */}
                                <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50 md:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            نقش درخواست شده
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {roleLabels[request.requestedUserRole]}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            درخواست‌کننده
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {request.requestedByManagerName}
                                        </p>
                                    </div>
                                </div>

                                {/* Review Notes */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        یادداشت بررسی (اختیاری برای تایید، الزامی برای رد)
                                    </label>
                                    <Input
                                        textArea
                                        placeholder="یادداشت خود را اینجا بنویسید..."
                                        rows={3}
                                        value={reviewNotes[request.id] || ''}
                                        onChange={(e) =>
                                            setReviewNotes((prev) => ({
                                                ...prev,
                                                [request.id]: e.target.value,
                                            }))
                                        }
                                        disabled={processingId === request.id}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                                    <Button
                                        variant="solid"
                                        className="bg-red-600 hover:bg-red-700"
                                        icon={<HiOutlineX />}
                                        onClick={() => handleReject(request)}
                                        loading={processingId === request.id}
                                        disabled={processingId !== null}
                                    >
                                        رد کردن
                                    </Button>
                                    <Button
                                        variant="solid"
                                        className="bg-green-600 hover:bg-green-700"
                                        icon={<HiOutlineCheck />}
                                        onClick={() => handleApprove(request)}
                                        loading={processingId === request.id}
                                        disabled={processingId !== null}
                                    >
                                        تایید کردن
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default PendingApprovals
