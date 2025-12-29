import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Input, Select, Avatar, Upload } from '@/components/ui'
import { useUserStore } from '@/store/userStore'
import { useSessionUser } from '@/store/authStore'
import { usePermissions } from '@/utils/hooks/usePermissions'
import type { User, MaritalStatus } from '@/@types/user'
import {
    SUPER_ADMIN,
    EDUCATION_MANAGER,
    SALES_MANAGER,
    AGENT,
    type UserRole,
} from '@/constants/roles.constant'
import { HiOutlineArrowLeft, HiOutlineUser } from 'react-icons/hi'

const roleOptions = [
    { value: SUPER_ADMIN, label: 'مدیر کل' },
    { value: EDUCATION_MANAGER, label: 'مدیر آموزش' },
    { value: SALES_MANAGER, label: 'مدیر فروش' },
    { value: AGENT, label: 'مشاور' },
]

const statusOptions = [
    { value: 'active', label: 'فعال' },
    { value: 'inactive', label: 'غیرفعال' },
    { value: 'suspended', label: 'معلق' },
]

const maritalStatusOptions = [
    { value: 'single', label: 'مجرد' },
    { value: 'married', label: 'متاهل' },
]

const UserForm = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditMode = Boolean(id)

    const currentUser = useSessionUser((state) => state.user)
    const permissions = usePermissions()
    const { users, fetchUsers, createUser, updateUser } = useUserStore()

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        phone: '',
        nationalId: '',
        homeAddress: '',
        maritalStatus: '' as MaritalStatus | '',
        description: '',
        role: AGENT as UserRole,
        managerId: '',
        status: 'active' as 'active' | 'inactive' | 'suspended',
        avatar: '',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    useEffect(() => {
        if (isEditMode && id) {
            const user = users.find((u) => u.id === id)
            if (user) {
                setFormData({
                    userName: user.userName,
                    email: user.email,
                    password: '',
                    phone: user.phone || '',
                    nationalId: user.nationalId || '',
                    homeAddress: user.homeAddress || '',
                    maritalStatus: user.maritalStatus || '',
                    description: user.description || '',
                    role: user.role || AGENT,
                    managerId: user.managerId || '',
                    status: user.status,
                    avatar: user.avatar || '',
                })
            }
        }
    }, [id, isEditMode, users])

    // Get available managers based on current user role
    const availableManagers = useMemo(() => {
        if (currentUser.role === SUPER_ADMIN) {
            // SA can assign anyone as manager
            return users.filter(
                (u) =>
                    u.role !== AGENT &&
                    u.id !== id // Can't assign self as manager
            )
        } else if (currentUser.role === EDUCATION_MANAGER) {
            // EM can only assign themselves or their SMs
            return users.filter(
                (u) =>
                    (u.role === EDUCATION_MANAGER &&
                        u.id === currentUser.userId) ||
                    (u.role === SALES_MANAGER &&
                        u.managerId === currentUser.userId)
            )
        } else if (currentUser.role === SALES_MANAGER) {
            // SM can only assign themselves
            return users.filter(
                (u) =>
                    u.role === SALES_MANAGER && u.id === currentUser.userId
            )
        }
        return []
    }, [users, currentUser, id])

    // Get allowed roles based on permissions
    const allowedRoles = useMemo(() => {
        return roleOptions.filter((option) =>
            permissions.canCreateUserWithRole(option.value as UserRole)
        )
    }, [permissions])

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.userName.trim()) {
            newErrors.userName = 'نام کاربری الزامی است'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'ایمیل الزامی است'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'فرمت ایمیل صحیح نیست'
        }

        if (!isEditMode && !formData.password.trim()) {
            newErrors.password = 'رمز عبور الزامی است'
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'رمز عبور باید حداقل 6 کاراکتر باشد'
        }

        if (!formData.avatar.trim()) {
            newErrors.avatar = 'تصویر پروفایل الزامی است'
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'شماره تماس الزامی است'
        }

        if (!formData.nationalId.trim()) {
            newErrors.nationalId = 'کد ملی الزامی است'
        } else if (formData.nationalId.length !== 10) {
            newErrors.nationalId = 'کد ملی باید 10 رقم باشد'
        }

        if (!formData.role) {
            newErrors.role = 'نقش الزامی است'
        }

        // Only agents and SMs need a manager
        if (
            (formData.role === AGENT || formData.role === SALES_MANAGER) &&
            !formData.managerId
        ) {
            newErrors.managerId = 'انتخاب مدیر الزامی است'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validate()) {
            return
        }

        setLoading(true)

        try {
            const userData: Partial<User> = {
                userName: formData.userName,
                email: formData.email,
                phone: formData.phone,
                nationalId: formData.nationalId,
                homeAddress: formData.homeAddress || undefined,
                maritalStatus: formData.maritalStatus || undefined,
                description: formData.description || undefined,
                role: formData.role,
                managerId: formData.managerId || undefined,
                managerName: formData.managerId
                    ? users.find((u) => u.id === formData.managerId)?.userName
                    : undefined,
                status: formData.status,
                avatar: formData.avatar,
            }

            if (isEditMode && id) {
                await updateUser(id, userData)
                alert('کاربر با موفقیت به‌روزرسانی شد')
            } else {
                // For new users, include password
                await createUser({
                    ...userData,
                    // Password would be sent to backend in real implementation
                })
                alert('کاربر با موفقیت ایجاد شد و برای تایید ارسال شد')
            }

            navigate('/users')
        } catch (error) {
            console.error('Error saving user:', error)
            alert('خطا در ذخیره کاربر')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: '',
            }))
        }
    }

    return (
        <div className="space-y-4">
            {/* Header */}
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
                        {isEditMode ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isEditMode
                            ? 'اطلاعات کاربر را ویرایش کنید'
                            : 'اطلاعات کاربر جدید را وارد کنید'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="p-6">
                    <div className="space-y-6">
                        {/* Avatar */}
                        <div className="flex items-center gap-4">
                            <Avatar
                                size={80}
                                shape="circle"
                                src={formData.avatar}
                                className="bg-primary-100 text-primary-600"
                            >
                                {!formData.avatar && (
                                    <HiOutlineUser className="h-8 w-8" />
                                )}
                            </Avatar>
                            <div>
                                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    تصویر پروفایل <span className="text-red-500">*</span>
                                </p>
                                <Input
                                    type="text"
                                    placeholder="URL تصویر پروفایل"
                                    value={formData.avatar}
                                    onChange={(e) =>
                                        handleInputChange('avatar', e.target.value)
                                    }
                                    invalid={Boolean(errors.avatar)}
                                />
                                {errors.avatar && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.avatar}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* User Name */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    نام کاربری <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    placeholder="نام کاربری"
                                    value={formData.userName}
                                    onChange={(e) =>
                                        handleInputChange('userName', e.target.value)
                                    }
                                    invalid={Boolean(errors.userName)}
                                />
                                {errors.userName && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.userName}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    ایمیل <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="email"
                                    placeholder="example@email.com"
                                    value={formData.email}
                                    onChange={(e) =>
                                        handleInputChange('email', e.target.value)
                                    }
                                    invalid={Boolean(errors.email)}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    رمز عبور{' '}
                                    {!isEditMode && (
                                        <span className="text-red-500">*</span>
                                    )}
                                    {isEditMode && (
                                        <span className="text-xs text-gray-500">
                                            (برای تغییر رمز وارد کنید)
                                        </span>
                                    )}
                                </label>
                                <Input
                                    type="password"
                                    placeholder="رمز عبور"
                                    value={formData.password}
                                    onChange={(e) =>
                                        handleInputChange('password', e.target.value)
                                    }
                                    invalid={Boolean(errors.password)}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    شماره تماس <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="tel"
                                    placeholder="09xxxxxxxxx"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        handleInputChange('phone', e.target.value)
                                    }
                                    invalid={Boolean(errors.phone)}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            {/* National ID */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    کد ملی <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    placeholder="کد ملی 10 رقمی"
                                    value={formData.nationalId}
                                    onChange={(e) =>
                                        handleInputChange('nationalId', e.target.value)
                                    }
                                    invalid={Boolean(errors.nationalId)}
                                />
                                {errors.nationalId && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.nationalId}
                                    </p>
                                )}
                            </div>

                            {/* Marital Status */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    وضعیت تاهل
                                </label>
                                <select
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                                    value={formData.maritalStatus}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'maritalStatus',
                                            e.target.value as MaritalStatus
                                        )
                                    }
                                >
                                    <option value="">انتخاب کنید</option>
                                    {maritalStatusOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    نقش <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                                    value={formData.role}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'role',
                                            e.target.value as UserRole
                                        )
                                    }
                                >
                                    {allowedRoles.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.role}
                                    </p>
                                )}
                            </div>

                            {/* Manager */}
                            {(formData.role === AGENT ||
                                formData.role === SALES_MANAGER) && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        مدیر <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                                        value={formData.managerId}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'managerId',
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">انتخاب مدیر</option>
                                        {availableManagers.map((manager) => (
                                            <option
                                                key={manager.id}
                                                value={manager.id}
                                            >
                                                {manager.userName} ({manager.role})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.managerId && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.managerId}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Status */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    وضعیت
                                </label>
                                <select
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                                    value={formData.status}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'status',
                                            e.target.value as
                                                | 'active'
                                                | 'inactive'
                                                | 'suspended'
                                        )
                                    }
                                >
                                    {statusOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Home Address */}
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    آدرس منزل
                                </label>
                                <Input
                                    type="text"
                                    placeholder="آدرس کامل منزل"
                                    value={formData.homeAddress}
                                    onChange={(e) =>
                                        handleInputChange('homeAddress', e.target.value)
                                    }
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    توضیحات
                                </label>
                                <Input
                                    textArea
                                    placeholder="توضیحات تکمیلی در مورد کاربر..."
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) =>
                                        handleInputChange('description', e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                            <Button
                                type="button"
                                variant="plain"
                                onClick={() => navigate('/users')}
                                disabled={loading}
                            >
                                انصراف
                            </Button>
                            <Button
                                type="submit"
                                variant="solid"
                                loading={loading}
                            >
                                {isEditMode ? 'ذخیره تغییرات' : 'ایجاد کاربر'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </form>
        </div>
    )
}

export default UserForm
