import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Button, Badge, Input, Select } from '@/components/ui'
import { useContractStore } from '@/store/contractStore'
import { useUserStore } from '@/store/userStore'
import { usePermissions } from '@/utils/hooks/usePermissions'
import type { Contract } from '@/@types/contract'
import type { ContractStatus } from '@/@types/contract'
import {
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineDocumentText,
    HiOutlineDownload,
} from 'react-icons/hi'
import { exportContractsToExcel } from '@/utils/exportToExcel'

const contractStatusLabels: Record<string, string> = {
    pending: 'در انتظار',
    approved: 'تایید شده',
    rejected: 'رد شده',
    paid: 'پرداخت شده',
}

const contractStatusColors: Record<string, string> = {
    pending:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    approved:
        'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    paid: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
}

const ContractList = () => {
    const navigate = useNavigate()
    const permissions = usePermissions()
    const { contracts, fetchContracts } = useContractStore()
    const { users, fetchUsers } = useUserStore()

    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | ContractStatus>('all')
    const [agentFilter, setAgentFilter] = useState('all')
    const [dateRange, setDateRange] = useState({ start: '', end: '' })
    const [filteredContracts, setFilteredContracts] = useState<Contract[]>([])

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                await Promise.all([fetchContracts(), fetchUsers()])
            } catch (error) {
                console.error('Error loading contracts:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [fetchContracts, fetchUsers])

    useEffect(() => {
        let filtered = contracts

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (contract) =>
                    contract.agentName.toLowerCase().includes(query) ||
                    contract.customerName.toLowerCase().includes(query) ||
                    contract.sellerName.toLowerCase().includes(query) ||
                    (contract.propertyTitle &&
                        contract.propertyTitle.toLowerCase().includes(query))
            )
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter((c) => c.status === statusFilter)
        }

        // Agent filter
        if (agentFilter !== 'all') {
            filtered = filtered.filter((c) => c.agentId === agentFilter)
        }

        // Date range filter
        if (dateRange.start) {
            filtered = filtered.filter(
                (c) => new Date(c.contractDate) >= new Date(dateRange.start)
            )
        }
        if (dateRange.end) {
            filtered = filtered.filter(
                (c) => new Date(c.contractDate) <= new Date(dateRange.end)
            )
        }

        setFilteredContracts(filtered)
    }, [searchQuery, contracts, statusFilter, agentFilter, dateRange])

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fa-IR')
    }

    const getAgentOptions = () => {
        const options = [{ value: 'all', label: 'همه کارشناسان' }]

        if (permissions.isSuperAdmin) {
            // Super Admin sees all agents
            users.forEach(u => {
                options.push({ value: u.userId, label: u.userName })
            })
        } else if (permissions.isEducationManager || permissions.isSalesManager) {
            // Managers see their team
            const subordinateIds = permissions.getSubordinateIds ?
                permissions.getSubordinateIds() : []
            users
                .filter(u => subordinateIds.includes(u.userId) || u.userId === permissions.currentUser?.userId)
                .forEach(u => {
                    options.push({ value: u.userId, label: u.userName })
                })
        }

        return options
    }

    const handleExport = () => {
        exportContractsToExcel(
            filteredContracts,
            `contracts_${new Date().toISOString().split('T')[0]}.xlsx`
        )
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        قراردادها
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        مدیریت و مشاهده قراردادها (
                        {new Intl.NumberFormat('fa-IR').format(
                            filteredContracts.length
                        )}{' '}
                        قرارداد)
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="default"
                        icon={<HiOutlineDownload />}
                        onClick={handleExport}
                        disabled={filteredContracts.length === 0}
                    >
                        خروجی Excel
                    </Button>
                    <Button
                        variant="solid"
                        icon={<HiOutlinePlus />}
                        onClick={() => navigate('/contracts/upload')}
                    >
                        بارگذاری قرارداد جدید
                    </Button>
                </div>
            </div>

            {/* Search */}
            <Card className="p-4">
                <Input
                    placeholder="جستجو بر اساس کارشناس، مشتری، فروشنده یا ملک..."
                    prefix={<HiOutlineSearch className="text-lg" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Card>

            {/* Filters */}
            <Card className="p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    {/* Status Filter */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            وضعیت
                        </label>
                        <Select
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val as 'all' | ContractStatus)}
                            options={[
                                { value: 'all', label: 'همه' },
                                { value: 'pending', label: 'در انتظار' },
                                { value: 'approved', label: 'تایید شده' },
                                { value: 'rejected', label: 'رد شده' },
                                { value: 'paid', label: 'پرداخت شده' },
                            ]}
                        />
                    </div>

                    {/* Agent Filter - Managers/Admins only */}
                    {(permissions.isManager || permissions.isSuperAdmin) && (
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                کارشناس
                            </label>
                            <Select
                                value={agentFilter}
                                onChange={(val) => setAgentFilter(val as string)}
                                options={getAgentOptions()}
                            />
                        </div>
                    )}

                    {/* Date Range */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            از تاریخ
                        </label>
                        <Input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) =>
                                setDateRange((p) => ({ ...p, start: e.target.value }))
                            }
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            تا تاریخ
                        </label>
                        <Input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) =>
                                setDateRange((p) => ({ ...p, end: e.target.value }))
                            }
                        />
                    </div>
                </div>
            </Card>

            {/* Contracts List */}
            {filteredContracts.length === 0 ? (
                <Card className="p-12">
                    <div className="text-center">
                        <HiOutlineDocumentText className="mx-auto h-16 w-16 text-gray-400" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {searchQuery
                                ? 'هیچ قراردادی یافت نشد'
                                : 'هنوز قراردادی ثبت نشده است'}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {searchQuery
                                ? 'لطفاً عبارت جستجوی دیگری امتحان کنید'
                                : 'برای شروع، یک قرارداد جدید بارگذاری کنید'}
                        </p>
                        {!searchQuery && (
                            <Button
                                className="mt-4"
                                variant="solid"
                                icon={<HiOutlinePlus />}
                                onClick={() => navigate('/contracts/upload')}
                            >
                                بارگذاری قرارداد اول
                            </Button>
                        )}
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                        شماره قرارداد
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                        کارشناس
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                        مشتری
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                        فروشنده
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                        مبلغ نهایی
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                        تاریخ قرارداد
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                        کمیسیون
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                        وضعیت
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                        عملیات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredContracts.map((contract) => (
                                    <tr
                                        key={contract.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {contract.id.slice(0, 8)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {contract.agentName}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {contract.customerName}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {contract.sellerName}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {formatPrice(contract.finalPrice)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(contract.contractDate)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {contract.commissionAmount !== undefined ? (
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                    {formatPrice(contract.commissionAmount)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                className={
                                                    contractStatusColors[
                                                        contract.status
                                                    ]
                                                }
                                                content={
                                                    contractStatusLabels[
                                                        contract.status
                                                    ]
                                                }
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Button
                                                size="sm"
                                                variant="plain"
                                                onClick={() =>
                                                    navigate(
                                                        `/contracts/${contract.id}`
                                                    )
                                                }
                                            >
                                                مشاهده
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    )
}

export default ContractList
