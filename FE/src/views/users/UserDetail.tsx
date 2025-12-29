import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, Button, Badge, Avatar } from '@/components/ui'
import { useUserStore } from '@/store/userStore'
import { usePermissions } from '@/utils/hooks/usePermissions'
import type { User, MaritalStatus } from '@/@types/user'
import {
    HiOutlineArrowLeft,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineUsers,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineCalendar,
    HiOutlineIdentification,
    HiOutlineHome,
    HiOutlineDocumentText,
} from 'react-icons/hi'
import {
    SUPER_ADMIN,
    EDUCATION_MANAGER,
    SALES_MANAGER,
    AGENT,
} from '@/constants/roles.constant'

const roleLabels: Record<string, string> = {
    [SUPER_ADMIN]: 'مدیر کل',
    [EDUCATION_MANAGER]: 'مدیر آموزش',
    [SALES_MANAGER]: 'مدیر فروش',
    [AGENT]: 'مشاور',
}

const roleColors: Record<string, 'red' | 'blue' | 'green' | 'orange'> = {
    [SUPER_ADMIN]: 'red',
    [EDUCATION_MANAGER]: 'blue',
    [SALES_MANAGER]: 'green',
    [AGENT]: 'orange',
}

const statusLabels: Record<string, string> = {
    active: 'فعال',
    inactive: 'غیرفعال',
    suspended: 'معلق',
}

const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
}

const maritalStatusLabels: Record<MaritalStatus, string> = {
    single: 'مجرد',
    married: 'متاهل',
}

const UserDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const permissions = usePermissions()
    const {
        users,
        fetchUsers,
        fetchUserTeam,
        setCurrentUserTeam,
        currentUserTeam,
        deleteUser,
    } = useUserStore()

    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                await fetchUsers()
                if (id) {
                    const foundUser = users.find((u) => u.id === id)
                    if (foundUser) {
                        setUser(foundUser)
                        // Fetch team data if user is a manager (not a regular agent)
                        if (
                            foundUser.role === SUPER_ADMIN ||
                            foundUser.role === EDUCATION_MANAGER ||
                            foundUser.role === SALES_MANAGER
                        ) {
                            await fetchUserTeam(foundUser.id)
                        } else {
                            // Clear team data for non-managers
                            setCurrentUserTeam(null)
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading user:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id, fetchUsers, fetchUserTeam, setCurrentUserTeam, users])

    const handleDelete = async () => {
        if (!user) return
        if (confirm(`آیا از حذف ${user.userName} اطمینان دارید؟`)) {
            try {
                await deleteUser(user.id)
                navigate('/users')
            } catch (error) {
                console.error('Error deleting user:', error)
                alert('خطا در حذف کاربر')
            }
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

    if (!user) {
        return (
            <Card className="p-12">
                <div className="text-center">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        کاربر یافت نشد
                    </h3>
                    <Link to="/users">
                        <Button variant="solid">بازگشت به لیست کاربران</Button>
                    </Link>
                </div>
            </Card>
        )
    }

    const canEdit = permissions.canEditUser(user)
    const canDelete = permissions.canDeleteUser(user)

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/users')}
                    >
                        بازگشت
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            جزئیات کاربر
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {canEdit && (
                        <Link to={`/users/edit/${user.id}`}>
                            <Button variant="solid" icon={<HiOutlinePencil />}>
                                ویرایش
                            </Button>
                        </Link>
                    )}
                    {canDelete && (
                        <Button
                            variant="solid"
                            className="bg-red-600 hover:bg-red-700"
                            icon={<HiOutlineTrash />}
                            onClick={handleDelete}
                        >
                            حذف
                        </Button>
                    )}
                </div>
            </div>

            {/* User Info Card */}
            <Card className="p-6">
                <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="flex items-start gap-6 border-b border-gray-200 pb-6 dark:border-gray-700">
                        <Avatar
                            size={100}
                            shape="circle"
                            src={user.avatar}
                        >
                            {user.userName.charAt(0).toUpperCase()}
                        </Avatar>
                        <div className="flex-1">
                            <div className="mb-3 flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {user.userName}
                                </h2>
                                {user.role && (
                                    <Badge
                                        className={roleColors[user.role]}
                                        content={roleLabels[user.role]}
                                    />
                                )}
                                <Badge
                                    className={statusColors[user.status]}
                                    content={statusLabels[user.status]}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <HiOutlineMail className="h-4 w-4" />
                                    <span>{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <HiOutlinePhone className="h-4 w-4" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                                {user.nationalId && (
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <HiOutlineIdentification className="h-4 w-4" />
                                        <span>کد ملی: {user.nationalId}</span>
                                    </div>
                                )}
                                {user.maritalStatus && (
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <HiOutlineUsers className="h-4 w-4" />
                                        <span>وضعیت تاهل: {maritalStatusLabels[user.maritalStatus]}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <HiOutlineCalendar className="h-4 w-4" />
                                    <span>
                                        عضویت:{' '}
                                        {new Date(
                                            user.createdAt
                                        ).toLocaleDateString('fa-IR')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Home Address */}
                    {user.homeAddress && (
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <HiOutlineHome className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    آدرس منزل
                                </h3>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                                <p className="text-gray-700 dark:text-gray-300">
                                    {user.homeAddress}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {user.description && (
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <HiOutlineDocumentText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    توضیحات
                                </h3>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                                <p className="text-gray-700 dark:text-gray-300">
                                    {user.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Manager Info */}
                    {user.managerName && (
                        <div>
                            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                مدیر
                            </h3>
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {user.managerName}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Team Members (for managers) */}
                    {currentUserTeam &&
                        currentUserTeam.subordinates.length > 0 && (
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <HiOutlineUsers className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        اعضای تیم ({' '}
                                        {new Intl.NumberFormat('fa-IR').format(
                                            currentUserTeam.subordinateCount
                                        )}{' '}
                                        نفر)
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {currentUserTeam.subordinates.map(
                                        (subordinate) => (
                                            <Link
                                                key={subordinate.id}
                                                to={`/users/${subordinate.id}`}
                                            >
                                                <Card className="cursor-pointer p-4 transition-shadow hover:shadow-md">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            size={40}
                                                            shape="circle"
                                                            src={
                                                                subordinate.avatar
                                                            }
                                                        >
                                                            {subordinate.userName
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                {
                                                                    subordinate.userName
                                                                }
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {subordinate.role &&
                                                                    roleLabels[
                                                                        subordinate
                                                                            .role
                                                                    ]}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            className={
                                                                statusColors[
                                                                    subordinate
                                                                        .status
                                                                ]
                                                            }
                                                            content={
                                                                statusLabels[
                                                                    subordinate
                                                                        .status
                                                                ]
                                                            }
                                                        />
                                                    </div>
                                                </Card>
                                            </Link>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                </div>
            </Card>
        </div>
    )
}

export default UserDetail
