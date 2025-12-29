import { useEffect, useState } from 'react'
import { Card, Button, Input, Select } from '@/components/ui'
import { useContractStore } from '@/store/contractStore'
import { useUserStore } from '@/store/userStore'
import { usePermissions } from '@/utils/hooks/usePermissions'
import type { Contract } from '@/@types/contract'
import { HiOutlineSearch, HiOutlineCash, HiOutlineDownload } from 'react-icons/hi'
import { exportCommissionsToExcel } from '@/utils/exportToExcel'

interface AgentCommissionData {
    agentId: string
    agentName: string
    agentRole: string
    contractCount: number
    totalSales: number
    totalCommission: number
    paidCommission: number
    pendingCommission: number
    contracts: {
        id: string
        finalPrice: number
        commission: number
        status: string
        contractDate: string
    }[]
}

const CommissionSummary = () => {
    const permissions = usePermissions()
    const { contracts, fetchContracts } = useContractStore()
    const { users, fetchUsers } = useUserStore()

    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [agentFilter, setAgentFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState<string[]>(['approved', 'paid'])
    const [commissionData, setCommissionData] = useState<AgentCommissionData[]>([])

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                await Promise.all([fetchContracts(), fetchUsers()])
            } catch (error) {
                console.error('Error loading data:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [fetchContracts, fetchUsers])

    useEffect(() => {
        calculateCommissions()
    }, [contracts, agentFilter, statusFilter, searchQuery])

    const calculateCommissions = () => {
        // Filter contracts by status
        let filtered = contracts.filter((c) => statusFilter.includes(c.status))

        // Filter by agent
        if (agentFilter !== 'all') {
            filtered = filtered.filter((c) => c.agentId === agentFilter)
        }

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (c) =>
                    c.agentName.toLowerCase().includes(query) ||
                    c.id.toLowerCase().includes(query)
            )
        }

        // Group by agent
        const agentMap = new Map<string, AgentCommissionData>()

        filtered.forEach((contract) => {
            // Use manually entered commission amount
            const commission = contract.commissionAmount || 0

            // Skip contracts without commission amount set
            if (commission === 0 && (contract.status === 'approved' || contract.status === 'paid')) {
                // Don't include contracts without commission set
                return
            }

            if (!agentMap.has(contract.agentId)) {
                agentMap.set(contract.agentId, {
                    agentId: contract.agentId,
                    agentName: contract.agentName,
                    agentRole: contract.agentRole,
                    contractCount: 0,
                    totalSales: 0,
                    totalCommission: 0,
                    paidCommission: 0,
                    pendingCommission: 0,
                    contracts: [],
                })
            }

            const data = agentMap.get(contract.agentId)!
            data.contractCount++
            data.totalSales += contract.finalPrice
            data.totalCommission += commission

            if (contract.status === 'paid') {
                data.paidCommission += commission
            } else if (contract.status === 'approved') {
                data.pendingCommission += commission
            }

            data.contracts.push({
                id: contract.id,
                finalPrice: contract.finalPrice,
                commission,
                status: contract.status,
                contractDate: contract.contractDate,
            })
        })

        setCommissionData(Array.from(agentMap.values()))
    }

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('fa-IR').format(price) + ' تومان'

    const getAgentOptions = () => {
        const options = [{ value: 'all', label: 'همه کارشناسان' }]

        if (permissions.isSuperAdmin) {
            users.forEach((u) => {
                options.push({ value: u.userId, label: u.userName })
            })
        } else if (
            permissions.isEducationManager ||
            permissions.isSalesManager
        ) {
            const subordinateIds = permissions.getSubordinateIds
                ? permissions.getSubordinateIds()
                : []
            users
                .filter(
                    (u) =>
                        subordinateIds.includes(u.userId) ||
                        u.userId === permissions.currentUser?.userId
                )
                .forEach((u) => {
                    options.push({ value: u.userId, label: u.userName })
                })
        }

        return options
    }

    const totalContracts = commissionData.reduce(
        (sum, d) => sum + d.contractCount,
        0
    )
    const totalSales = commissionData.reduce((sum, d) => sum + d.totalSales, 0)
    const totalCommissions = commissionData.reduce(
        (sum, d) => sum + d.totalCommission,
        0
    )
    const totalPaid = commissionData.reduce(
        (sum, d) => sum + d.paidCommission,
        0
    )
    const totalPending = commissionData.reduce(
        (sum, d) => sum + d.pendingCommission,
        0
    )

    const handleExport = () => {
        exportCommissionsToExcel(
            commissionData,
            `commissions_${new Date().toISOString().split('T')[0]}.xlsx`
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                        خلاصه کمیسیون‌ها
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        محاسبه کمیسیون بر اساس قراردادهای تایید شده و پرداخت شده (مبالغ ثبت شده توسط مدیر)
                    </p>
                </div>
                {commissionData.length > 0 && (
                    <Button
                        variant="solid"
                        icon={<HiOutlineDownload />}
                        onClick={handleExport}
                    >
                        خروجی Excel
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            جستجو کارشناس
                        </label>
                        <Input
                            placeholder="جستجو..."
                            prefix={<HiOutlineSearch />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

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

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            وضعیت قرارداد
                        </label>
                        <Select
                            value={statusFilter.join(',')}
                            onChange={(val) => {
                                if (val === 'all') {
                                    setStatusFilter(['approved', 'paid'])
                                } else if (val === 'approved') {
                                    setStatusFilter(['approved'])
                                } else if (val === 'paid') {
                                    setStatusFilter(['paid'])
                                }
                            }}
                            options={[
                                { value: 'all', label: 'تایید شده و پرداخت شده' },
                                { value: 'approved', label: 'فقط تایید شده' },
                                { value: 'paid', label: 'فقط پرداخت شده' },
                            ]}
                        />
                    </div>
                </div>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                            <HiOutlineCash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                تعداد قراردادها
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {new Intl.NumberFormat('fa-IR').format(
                                    totalContracts
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        مجموع فروش
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatPrice(totalSales)}
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        کل کمیسیون
                    </div>
                    <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {formatPrice(totalCommissions)}
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        پرداخت شده
                    </div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatPrice(totalPaid)}
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        در انتظار پرداخت
                    </div>
                    <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                        {formatPrice(totalPending)}
                    </div>
                </Card>
            </div>

            {/* Commission Table */}
            {commissionData.length === 0 ? (
                <Card className="p-12">
                    <div className="text-center">
                        <HiOutlineCash className="mx-auto h-16 w-16 text-gray-400" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            داده‌ای یافت نشد
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {searchQuery
                                ? 'نتیجه‌ای برای جستجوی شما یافت نشد'
                                : 'هنوز قراردادی با وضعیت تایید شده یا پرداخت شده وجود ندارد'}
                        </p>
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                        کارشناس
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                        تعداد
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                        فروش
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                        کل کمیسیون
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                        پرداخت شده
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                        در انتظار
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {commissionData.map((data) => (
                                    <tr
                                        key={data.agentId}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {data.agentName}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {data.agentRole}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {new Intl.NumberFormat('fa-IR').format(
                                                data.contractCount
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatPrice(data.totalSales)}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-primary-600 dark:text-primary-400">
                                            {formatPrice(data.totalCommission)}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                                            {formatPrice(data.paidCommission)}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                            {formatPrice(data.pendingCommission)}
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

export default CommissionSummary
