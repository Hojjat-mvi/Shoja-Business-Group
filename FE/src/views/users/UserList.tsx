import { useEffect, useState, useMemo } from 'react'
import { Card, Button, Badge, Input, Avatar } from '@/components/ui'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import { useUserStore } from '@/store/userStore'
import { usePermissions } from '@/utils/hooks/usePermissions'
import type { User } from '@/@types/user'
import {
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineEye,
} from 'react-icons/hi'
import { Link, useNavigate } from 'react-router-dom'
import { SUPER_ADMIN, EDUCATION_MANAGER, SALES_MANAGER, AGENT } from '@/constants/roles.constant'

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

const UserList = () => {
    const navigate = useNavigate()
    const { users, fetchUsers, deleteUser } = useUserStore()
    const permissions = usePermissions()

    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('')
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                await fetchUsers()
            } catch (error) {
                console.error('Error loading users:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [fetchUsers])

    // Filter users based on permissions
    const visibleUsers = useMemo(() => {
        return users.filter((user) => permissions.canViewUser(user))
    }, [users, permissions])

    // Apply search and filter
    const filteredUsers = useMemo(() => {
        return visibleUsers.filter((user) => {
            const matchesSearch =
                searchTerm === '' ||
                user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesRole =
                roleFilter === '' || user.role === roleFilter

            return matchesSearch && matchesRole
        })
    }, [visibleUsers, searchTerm, roleFilter])

    // Paginate the filtered users
    const paginatedUsers = useMemo(() => {
        const startIndex = (pageIndex - 1) * pageSize
        const endIndex = startIndex + pageSize
        return filteredUsers.slice(startIndex, endIndex)
    }, [filteredUsers, pageIndex, pageSize])

    const handleDeleteUser = async (userId: string) => {
        if (confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
            try {
                await deleteUser(userId)
            } catch (error) {
                console.error('Error deleting user:', error)
                alert('خطا در حذف کاربر')
            }
        }
    }

    const handleViewUser = (userId: string) => {
        navigate(`/users/${userId}`)
    }

    const handleEditUser = (userId: string) => {
        navigate(`/users/edit/${userId}`)
    }

    const handlePaginationChange = (page: number) => {
        setPageIndex(page)
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        setPageIndex(1) // Reset to first page when page size changes
    }

    const columns: ColumnDef<User>[] = useMemo(
        () => [
            {
                header: 'کاربر',
                accessorKey: 'userName',
                cell: ({ row }) => {
                    const user = row.original
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar
                                size={40}
                                shape="circle"
                                src={user.avatar}
                                className="bg-primary-100 text-primary-600"
                            >
                                {!user.avatar && user.userName.charAt(0).toUpperCase()}
                            </Avatar>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {user.userName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'نقش',
                accessorKey: 'role',
                cell: ({ row }) => {
                    const user = row.original
                    return user.role ? (
                        <Badge className={roleColors[user.role]}>
                            {roleLabels[user.role]}
                        </Badge>
                    ) : (
                        '-'
                    )
                },
            },
            {
                header: 'مدیر',
                accessorKey: 'managerName',
                cell: ({ row }) => {
                    const user = row.original
                    return user.managerName ? (
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                            {user.managerName}
                        </span>
                    ) : (
                        <span className="text-sm text-gray-500">-</span>
                    )
                },
            },
            {
                header: 'شماره تماس',
                accessorKey: 'phone',
                cell: ({ row }) => {
                    const user = row.original
                    return user.phone ? (
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                            {user.phone}
                        </span>
                    ) : (
                        <span className="text-sm text-gray-500">-</span>
                    )
                },
            },
            {
                header: 'وضعیت',
                accessorKey: 'status',
                cell: ({ row }) => {
                    const user = row.original
                    return (
                        <Badge className={statusColors[user.status]}>
                            {statusLabels[user.status]}
                        </Badge>
                    )
                },
            },
            {
                header: 'تاریخ ثبت',
                accessorKey: 'createdAt',
                cell: ({ row }) => {
                    const user = row.original
                    return (
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                            {new Date(user.createdAt).toLocaleDateString(
                                'fa-IR'
                            )}
                        </span>
                    )
                },
            },
            {
                header: 'عملیات',
                id: 'actions',
                cell: ({ row }) => {
                    const user = row.original
                    const canEdit = permissions.canEditUser(user)
                    const canDelete = permissions.canDeleteUser(user)

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<HiOutlineEye />}
                                onClick={() => handleViewUser(user.id)}
                            />
                            {canEdit && (
                                <Button
                                    size="xs"
                                    variant="plain"
                                    icon={<HiOutlinePencil />}
                                    onClick={() => handleEditUser(user.id)}
                                />
                            )}
                            {canDelete && (
                                <Button
                                    size="xs"
                                    variant="plain"
                                    className="text-red-600 hover:text-red-700"
                                    icon={<HiOutlineTrash />}
                                    onClick={() => handleDeleteUser(user.id)}
                                />
                            )}
                        </div>
                    )
                },
            },
        ],
        [permissions]
    )

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                        مدیریت کاربران
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        مشاهده و مدیریت کاربران سیستم
                    </p>
                </div>
                {(permissions.isAdmin || permissions.isEducationManager || permissions.isSalesManager) && (
                    <Link to="/users/new">
                        <Button
                            variant="solid"
                            icon={<HiOutlinePlus />}
                        >
                            افزودن کاربر جدید
                        </Button>
                    </Link>
                )}
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            جستجو
                        </label>
                        <Input
                            placeholder="جستجو بر اساس نام یا ایمیل..."
                            prefix={<HiOutlineSearch className="text-lg" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            فیلتر بر اساس نقش
                        </label>
                        <select
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="">همه نقش‌ها</option>
                            <option value={SUPER_ADMIN}>مدیر کل</option>
                            <option value={EDUCATION_MANAGER}>مدیر آموزش</option>
                            <option value={SALES_MANAGER}>مدیر فروش</option>
                            <option value={AGENT}>مشاور</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            تعداد کاربران:{' '}
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {new Intl.NumberFormat('fa-IR').format(
                                    filteredUsers.length
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Data Table */}
            <Card>
                <DataTable<User>
                    columns={columns}
                    data={paginatedUsers}
                    loading={loading}
                    noData={filteredUsers.length === 0}
                    pagingData={{
                        total: filteredUsers.length,
                        pageIndex: pageIndex,
                        pageSize: pageSize,
                    }}
                    onPaginationChange={handlePaginationChange}
                    onSelectChange={handlePageSizeChange}
                />
            </Card>
        </div>
    )
}

export default UserList
