import { useEffect, useState } from 'react'
import { Card, Button, Input, Avatar, Badge } from '@/components/ui'
import { useSessionUser } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import type { User } from '@/@types/user'
import {
    HiOutlineUser,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlinePencil,
    HiOutlineCamera,
    HiOutlineCheck,
    HiOutlineX,
} from 'react-icons/hi'
import {
    SUPER_ADMIN,
    EDUCATION_MANAGER,
    SALES_MANAGER,
    AGENT,
} from '@/constants/roles.constant'

const roleLabels: Record<string, string> = {
    [SUPER_ADMIN]: 'مدیر ارشد',
    [EDUCATION_MANAGER]: 'مدیر آموزش',
    [SALES_MANAGER]: 'مدیر فروش',
    [AGENT]: 'کارشناس',
}

const roleColors: Record<string, string> = {
    [SUPER_ADMIN]: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    [EDUCATION_MANAGER]:
        'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    [SALES_MANAGER]:
        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    [AGENT]: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
}

const statusLabels: Record<string, string> = {
    active: 'فعال',
    inactive: 'غیرفعال',
}

const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
}

const UserProfile = () => {
    const sessionUser = useSessionUser((state) => state.user)
    const { users, fetchUsers } = useUserStore()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        phone: '',
    })

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                await fetchUsers()
                if (sessionUser.userId) {
                    const foundUser = users.find(
                        (u) => u.id === sessionUser.userId
                    )
                    if (foundUser) {
                        setUser(foundUser)
                        setFormData({
                            userName: foundUser.userName,
                            email: foundUser.email,
                            phone: foundUser.phone || '',
                        })
                    }
                }
            } catch (error) {
                console.error('Error loading user profile:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [sessionUser.userId, fetchUsers, users])

    const handleEditToggle = () => {
        if (isEditing && user) {
            // Reset form data if canceling
            setFormData({
                userName: user.userName,
                email: user.email,
                phone: user.phone || '',
            })
        }
        setIsEditing(!isEditing)
    }

    const handleSave = () => {
        // TODO: Implement API call to update user profile
        console.log('Saving profile:', formData)
        setIsEditing(false)
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
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
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        پروفایل من
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        مشاهده و ویرایش اطلاعات شخصی
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                variant="solid"
                                icon={<HiOutlineCheck />}
                                onClick={handleSave}
                            >
                                ذخیره
                            </Button>
                            <Button
                                variant="plain"
                                icon={<HiOutlineX />}
                                onClick={handleEditToggle}
                            >
                                انصراف
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="solid"
                            icon={<HiOutlinePencil />}
                            onClick={handleEditToggle}
                        >
                            ویرایش پروفایل
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Avatar Card */}
                <div>
                    <Card className="p-6">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <Avatar
                                    size={120}
                                    src={user.avatar}
                                    icon={<HiOutlineUser />}
                                />
                                {isEditing && (
                                    <button className="absolute bottom-0 right-0 rounded-full bg-primary-600 p-2 text-white shadow-lg transition-colors hover:bg-primary-700">
                                        <HiOutlineCamera className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">
                                {user.userName}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {user.email}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                <Badge
                                    className={roleColors[user.role]}
                                    content={roleLabels[user.role]}
                                />
                                <Badge
                                    className={statusColors[user.status]}
                                    content={statusLabels[user.status]}
                                />
                            </div>

                            {user.managerName && (
                                <div className="mt-6 w-full rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        مدیر مستقیم
                                    </p>
                                    <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                                        {user.managerName}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Information Card */}
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            اطلاعات شخصی
                        </h3>

                        <div className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <HiOutlineUser className="h-4 w-4" />
                                        <span>نام کامل</span>
                                    </div>
                                </label>
                                {isEditing ? (
                                    <Input
                                        value={formData.userName}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'userName',
                                                e.target.value
                                            )
                                        }
                                        placeholder="نام کامل خود را وارد کنید"
                                    />
                                ) : (
                                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {user.userName}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <HiOutlineMail className="h-4 w-4" />
                                        <span>ایمیل</span>
                                    </div>
                                </label>
                                {isEditing ? (
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'email',
                                                e.target.value
                                            )
                                        }
                                        placeholder="ایمیل خود را وارد کنید"
                                    />
                                ) : (
                                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {user.email}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <HiOutlinePhone className="h-4 w-4" />
                                        <span>شماره تماس</span>
                                    </div>
                                </label>
                                {isEditing ? (
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'phone',
                                                e.target.value
                                            )
                                        }
                                        placeholder="شماره تماس خود را وارد کنید"
                                    />
                                ) : (
                                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {user.phone || 'ثبت نشده'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Role (Read-only) */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    نقش
                                </label>
                                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {roleLabels[user.role]}
                                    </p>
                                </div>
                            </div>

                            {/* Status (Read-only) */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    وضعیت
                                </label>
                                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {statusLabels[user.status]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default UserProfile
