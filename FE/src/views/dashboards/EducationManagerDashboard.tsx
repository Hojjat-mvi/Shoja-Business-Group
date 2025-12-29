import { useEffect, useState, useMemo } from 'react'
import { Card, Button } from '@/components/ui'
import { StatCard } from '@/components/shared'
import Chart from 'react-apexcharts'
import { useUserStore } from '@/store/userStore'
import { useContractStore } from '@/store/contractStore'
import { usePropertyStore } from '@/store/propertyStore'
import { useSessionUser } from '@/store/authStore'
import { getSubordinateIds } from '@/utils/permissions'
import type { ApexOptions } from 'apexcharts'
import {
    HiOutlineUsers,
    HiOutlineDocumentText,
    HiOutlineHome,
    HiOutlineTrendingUp,
} from 'react-icons/hi'
import { Link } from 'react-router-dom'

const EducationManagerDashboard = () => {
    const currentUser = useSessionUser((state) => state.user)
    const { users, fetchUsers } = useUserStore()
    const { contracts, fetchContracts } = useContractStore()
    const { properties, fetchProperties } = usePropertyStore()

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                await Promise.all([
                    fetchUsers(),
                    fetchContracts(),
                    fetchProperties(),
                ])
            } catch (error) {
                console.error('Error loading dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [fetchUsers, fetchContracts, fetchProperties])

    // Get all subordinates (SM + Agents)
    const subordinateIds = useMemo(() => {
        if (!currentUser.userId) return []
        return getSubordinateIds(currentUser.userId, users)
    }, [currentUser.userId, users])

    // Get direct Sales Managers
    const salesManagers = useMemo(() => {
        return users.filter((u) => u.managerId === currentUser.userId)
    }, [users, currentUser.userId])

    // Filter data for team
    const teamContracts = useMemo(() => {
        return contracts.filter((c) => subordinateIds.includes(c.agentId))
    }, [contracts, subordinateIds])

    const teamProperties = useMemo(() => {
        return properties.filter((p) => subordinateIds.includes(p.ownerId))
    }, [properties, subordinateIds])

    // Calculate statistics
    const totalTeamMembers = subordinateIds.length
    const totalSalesManagers = salesManagers.length
    const totalContracts = teamContracts.length
    const totalProperties = teamProperties.length

    const pendingContracts = teamContracts.filter((c) => c.status === 'pending')
        .length
    const approvedContracts = teamContracts.filter(
        (c) => c.status === 'approved'
    ).length
    const paidContracts = teamContracts.filter((c) => c.status === 'paid')
        .length

    // Calculate EM commission (1.5% - 2.5% based on performance)
    const totalTeamCommission = teamContracts
        .filter((c) => c.status === 'paid' && c.commissionAmount !== undefined)
        .reduce((sum, c) => sum + (c.commissionAmount || 0), 0)

    // EM gets 2% of team's total commission
    const myCommission = totalTeamCommission * 0.02

    // Performance by Sales Manager
    const performanceBySM = useMemo(() => {
        return salesManagers.map((sm) => {
            const smSubordinates = getSubordinateIds(sm.id, users)
            const smContracts = contracts.filter(
                (c) =>
                    c.agentId === sm.id ||
                    smSubordinates.includes(c.agentId)
            )
            const totalCommission = smContracts
                .filter((c) => c.status === 'paid' && c.commissionAmount !== undefined)
                .reduce((sum, c) => sum + (c.commissionAmount || 0), 0)

            return {
                name: sm.userName,
                contracts: smContracts.length,
                commission: totalCommission,
            }
        })
    }, [salesManagers, users, contracts])

    // Chart data - Team performance
    const teamPerformanceOptions: ApexOptions = {
        chart: {
            type: 'bar',
            fontFamily: 'inherit',
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                borderRadius: 8,
                horizontal: true,
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: performanceBySM.map((p) => p.name),
        },
        colors: ['#3B82F6', '#10B981'],
    }

    const teamPerformanceSeries = [
        {
            name: 'قراردادها',
            data: performanceBySM.map((p) => p.contracts),
        },
        {
            name: 'کمیسیون (میلیون تومان)',
            data: performanceBySM.map((p) => Math.round(p.commission / 1000000)),
        },
    ]

    // Monthly trend
    const monthlyTrendOptions: ApexOptions = {
        chart: {
            type: 'line',
            fontFamily: 'inherit',
            toolbar: {
                show: false,
            },
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
        },
        colors: ['#3B82F6'],
        grid: {
            strokeDashArray: 4,
        },
    }

    const monthlyTrendSeries = [
        {
            name: 'قراردادها',
            data: [8, 12, 10, 15, 13, 18], // Mock data
        },
    ]

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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    داشبورد مدیر آموزش
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    خوش آمدید، {currentUser.userName}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="تعداد اعضای تیم"
                    value={new Intl.NumberFormat('fa-IR').format(
                        totalTeamMembers
                    )}
                    icon={<HiOutlineUsers className="h-6 w-6" />}
                    iconClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                />
                <StatCard
                    title="مدیران فروش"
                    value={new Intl.NumberFormat('fa-IR').format(
                        totalSalesManagers
                    )}
                    icon={<HiOutlineUsers className="h-6 w-6" />}
                    iconClass="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                />
                <StatCard
                    title="قراردادهای تیم"
                    value={new Intl.NumberFormat('fa-IR').format(
                        totalContracts
                    )}
                    icon={<HiOutlineDocumentText className="h-6 w-6" />}
                    iconClass="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                />
                <StatCard
                    title="کمیسیون من"
                    value={
                        new Intl.NumberFormat('fa-IR').format(
                            Math.round(myCommission)
                        ) + ' تومان'
                    }
                    icon={<HiOutlineTrendingUp className="h-6 w-6" />}
                    iconClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
                />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="p-4">
                    <h3 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        وضعیت قراردادهای تیم
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                در انتظار
                            </span>
                            <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                                {new Intl.NumberFormat('fa-IR').format(
                                    pendingContracts
                                )}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                تایید شده
                            </span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                {new Intl.NumberFormat('fa-IR').format(
                                    approvedContracts
                                )}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                پرداخت شده
                            </span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {new Intl.NumberFormat('fa-IR').format(
                                    paidContracts
                                )}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <h3 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        املاک تیم
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                کل املاک
                            </span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {new Intl.NumberFormat('fa-IR').format(
                                    totalProperties
                                )}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                موجود
                            </span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                {new Intl.NumberFormat('fa-IR').format(
                                    teamProperties.filter(
                                        (p) => p.status === 'available'
                                    ).length
                                )}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                فروخته شده
                            </span>
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                                {new Intl.NumberFormat('fa-IR').format(
                                    teamProperties.filter(
                                        (p) => p.status === 'sold'
                                    ).length
                                )}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <h3 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        دسترسی سریع
                    </h3>
                    <div className="space-y-2">
                        <Link to="/users">
                            <Button
                                variant="plain"
                                size="sm"
                                className="w-full justify-start"
                            >
                                <span className="flex items-center">
                                    <HiOutlineUsers className="ml-2 h-4 w-4" />
                                    <span>مشاهده تیم</span>
                                </span>
                            </Button>
                        </Link>
                        <Link to="/contracts">
                            <Button
                                variant="plain"
                                size="sm"
                                className="w-full justify-start"
                            >
                                <span className="flex items-center">
                                    <HiOutlineDocumentText className="ml-2 h-4 w-4" />
                                    <span>قراردادهای تیم</span>
                                </span>
                            </Button>
                        </Link>
                        <Link to="/properties">
                            <Button
                                variant="plain"
                                size="sm"
                                className="w-full justify-start"
                            >
                                <span className="flex items-center">
                                    <HiOutlineHome className="ml-2 h-4 w-4" />
                                    <span>املاک تیم</span>
                                </span>
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        عملکرد مدیران فروش
                    </h3>
                    {performanceBySM.length > 0 ? (
                        <Chart
                            options={teamPerformanceOptions}
                            series={teamPerformanceSeries}
                            type="bar"
                            height={300}
                        />
                    ) : (
                        <div className="flex h-64 items-center justify-center text-gray-500">
                            داده‌ای موجود نیست
                        </div>
                    )}
                </Card>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        روند ماهانه
                    </h3>
                    <Chart
                        options={monthlyTrendOptions}
                        series={monthlyTrendSeries}
                        type="line"
                        height={300}
                    />
                </Card>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        برترین مدیران فروش
                    </h3>
                    <div className="space-y-3">
                        {performanceBySM
                            .sort((a, b) => b.commission - a.commission)
                            .slice(0, 5)
                            .map((sm, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0 dark:border-gray-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {sm.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Intl.NumberFormat(
                                                    'fa-IR'
                                                ).format(sm.contracts)} قرارداد
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {new Intl.NumberFormat(
                                                'fa-IR'
                                            ).format(sm.commission)}{' '}
                                            تومان
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        آخرین قراردادها
                    </h3>
                    <div className="space-y-3">
                        {teamContracts.slice(0, 5).map((contract) => (
                            <div
                                key={contract.id}
                                className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0 dark:border-gray-700"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {contract.agentName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(
                                            contract.createdAt
                                        ).toLocaleDateString('fa-IR')}
                                    </p>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {new Intl.NumberFormat('fa-IR').format(
                                            contract.commissionAmount
                                        )}{' '}
                                        تومان
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default EducationManagerDashboard
