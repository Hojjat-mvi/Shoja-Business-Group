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

const SalesManagerDashboard = () => {
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

    // Get all subordinate agents
    const subordinateIds = useMemo(() => {
        if (!currentUser.userId) return []
        return getSubordinateIds(currentUser.userId, users)
    }, [currentUser.userId, users])

    // Get direct agents
    const myAgents = useMemo(() => {
        return users.filter((u) => u.managerId === currentUser.userId)
    }, [users, currentUser.userId])

    // My own contracts
    const myContracts = useMemo(() => {
        return contracts.filter((c) => c.agentId === currentUser.userId)
    }, [contracts, currentUser.userId])

    // Team contracts (subordinates only)
    const teamContracts = useMemo(() => {
        return contracts.filter((c) => subordinateIds.includes(c.agentId))
    }, [contracts, subordinateIds])

    // My properties
    const myProperties = useMemo(() => {
        return properties.filter((p) => p.ownerId === currentUser.userId)
    }, [properties, currentUser.userId])

    // Team properties
    const teamProperties = useMemo(() => {
        return properties.filter((p) => subordinateIds.includes(p.ownerId))
    }, [properties, subordinateIds])

    // Calculate statistics
    const totalAgents = myAgents.length
    const totalMyContracts = myContracts.length
    const totalTeamContracts = teamContracts.length
    const totalMyProperties = myProperties.length

    // My commission from own contracts
    const myOwnCommission = myContracts
        .filter((c) => c.status === 'paid' && c.commissionAmount !== undefined)
        .reduce((sum, c) => sum + (c.commissionAmount || 0), 0)

    // Team commission (2.5% of subordinates' commission)
    const teamTotalCommission = teamContracts
        .filter((c) => c.status === 'paid' && c.commissionAmount !== undefined)
        .reduce((sum, c) => sum + (c.commissionAmount || 0), 0)
    const myTeamCommission = teamTotalCommission * 0.025

    const totalMyCommission = myOwnCommission + myTeamCommission

    // Performance by agent
    const performanceByAgent = useMemo(() => {
        return myAgents.map((agent) => {
            const agentContracts = contracts.filter(
                (c) => c.agentId === agent.id
            )
            const totalCommission = agentContracts
                .filter((c) => c.status === 'paid' && c.commissionAmount !== undefined)
                .reduce((sum, c) => sum + (c.commissionAmount || 0), 0)

            return {
                name: agent.userName,
                contracts: agentContracts.length,
                commission: totalCommission,
            }
        })
    }, [myAgents, contracts])

    // Chart data - Agent performance
    const agentPerformanceOptions: ApexOptions = {
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
            categories: performanceByAgent.map((p) => p.name),
        },
        colors: ['#3B82F6'],
    }

    const agentPerformanceSeries = [
        {
            name: 'قراردادها',
            data: performanceByAgent.map((p) => p.contracts),
        },
    ]

    // Monthly trend - my contracts
    const monthlyTrendOptions: ApexOptions = {
        chart: {
            type: 'area',
            fontFamily: 'inherit',
            toolbar: {
                show: false,
            },
        },
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
        },
        colors: ['#3B82F6', '#10B981'],
        grid: {
            strokeDashArray: 4,
        },
    }

    const monthlyTrendSeries = [
        {
            name: 'قراردادهای من',
            data: [3, 5, 4, 6, 5, 7], // Mock data
        },
        {
            name: 'قراردادهای تیم',
            data: [8, 12, 10, 14, 11, 16], // Mock data
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
                    داشبورد مدیر فروش
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    خوش آمدید، {currentUser.userName}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="تعداد مشاوران"
                    value={new Intl.NumberFormat('fa-IR').format(totalAgents)}
                    icon={<HiOutlineUsers className="h-6 w-6" />}
                    iconClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                />
                <StatCard
                    title="قراردادهای من"
                    value={new Intl.NumberFormat('fa-IR').format(
                        totalMyContracts
                    )}
                    icon={<HiOutlineDocumentText className="h-6 w-6" />}
                    iconClass="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                />
                <StatCard
                    title="قراردادهای تیم"
                    value={new Intl.NumberFormat('fa-IR').format(
                        totalTeamContracts
                    )}
                    icon={<HiOutlineDocumentText className="h-6 w-6" />}
                    iconClass="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                />
                <StatCard
                    title="کمیسیون کل من"
                    value={
                        new Intl.NumberFormat('fa-IR').format(
                            Math.round(totalMyCommission)
                        ) + ' تومان'
                    }
                    icon={<HiOutlineTrendingUp className="h-6 w-6" />}
                    iconClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
                />
            </div>

            {/* Commission Breakdown */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="p-4">
                    <h3 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        تفکیک کمیسیون
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                کمیسیون شخصی (40%)
                            </span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                {new Intl.NumberFormat('fa-IR').format(
                                    Math.round(myOwnCommission)
                                )}{' '}
                                تومان
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                کمیسیون مدیریت (2.5%)
                            </span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {new Intl.NumberFormat('fa-IR').format(
                                    Math.round(myTeamCommission)
                                )}{' '}
                                تومان
                            </span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    جمع کل
                                </span>
                                <span className="font-bold text-primary-600 dark:text-primary-400">
                                    {new Intl.NumberFormat('fa-IR').format(
                                        Math.round(totalMyCommission)
                                    )}{' '}
                                    تومان
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <h3 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        املاک من
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                کل املاک
                            </span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {new Intl.NumberFormat('fa-IR').format(
                                    totalMyProperties
                                )}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                موجود
                            </span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                {new Intl.NumberFormat('fa-IR').format(
                                    myProperties.filter(
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
                                    myProperties.filter(
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
                                    <span>مشاوران من</span>
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
                                    <span>قراردادهای من</span>
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
                                    <span>املاک من</span>
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
                        عملکرد مشاوران
                    </h3>
                    {performanceByAgent.length > 0 ? (
                        <Chart
                            options={agentPerformanceOptions}
                            series={agentPerformanceSeries}
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
                        type="area"
                        height={300}
                    />
                </Card>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        برترین مشاوران
                    </h3>
                    <div className="space-y-3">
                        {performanceByAgent
                            .sort((a, b) => b.commission - a.commission)
                            .slice(0, 5)
                            .map((agent, index) => (
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
                                                {agent.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Intl.NumberFormat(
                                                    'fa-IR'
                                                ).format(agent.contracts)} قرارداد
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {new Intl.NumberFormat(
                                                'fa-IR'
                                            ).format(agent.commission)}{' '}
                                            تومان
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        آخرین قراردادهای من
                    </h3>
                    <div className="space-y-3">
                        {myContracts.slice(0, 5).map((contract) => (
                            <div
                                key={contract.id}
                                className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0 dark:border-gray-700"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        قرارداد
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

export default SalesManagerDashboard
