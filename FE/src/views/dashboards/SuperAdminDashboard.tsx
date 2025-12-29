import { useEffect, useState } from 'react'
import { Card, Button } from '@/components/ui'
import { StatCard } from '@/components/shared'
import Chart from 'react-apexcharts'
import { useUserStore } from '@/store/userStore'
import { useContractStore } from '@/store/contractStore'
import { usePropertyStore } from '@/store/propertyStore'
import { useSessionUser } from '@/store/authStore'
import type { ApexOptions } from 'apexcharts'
import {
    HiOutlineUsers,
    HiOutlineDocumentText,
    HiOutlineHome,
    HiOutlineCash,
} from 'react-icons/hi'
import { Link } from 'react-router-dom'

const SuperAdminDashboard = () => {
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

    // Calculate statistics
    const totalUsers = users.length
    const totalContracts = contracts.length
    const totalProperties = properties.length

    const pendingContracts = contracts.filter((c) => c.status === 'pending')
        .length
    const approvedContracts = contracts.filter((c) => c.status === 'approved')
        .length
    const paidContracts = contracts.filter((c) => c.status === 'paid').length

    const totalCommissionValue = contracts
        .filter((c) => c.status === 'paid' && c.commissionAmount !== undefined)
        .reduce((sum, c) => sum + (c.commissionAmount || 0), 0)

    const availableProperties = properties.filter(
        (p) => p.status === 'available'
    ).length
    const soldProperties = properties.filter((p) => p.status === 'sold').length

    // Chart data - Contract status distribution
    const contractStatusOptions: ApexOptions = {
        chart: {
            type: 'donut',
            fontFamily: 'inherit',
        },
        labels: ['در انتظار', 'تایید شده', 'رد شده', 'پرداخت شده'],
        colors: ['#FCD34D', '#34D399', '#F87171', '#60A5FA'],
        legend: {
            position: 'bottom',
        },
        dataLabels: {
            enabled: true,
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                },
            },
        },
    }

    const contractStatusSeries = [
        contracts.filter((c) => c.status === 'pending').length,
        contracts.filter((c) => c.status === 'approved').length,
        contracts.filter((c) => c.status === 'rejected').length,
        contracts.filter((c) => c.status === 'paid').length,
    ]

    // Chart data - Monthly contracts trend (last 6 months)
    const monthlyContractsOptions: ApexOptions = {
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
                columnWidth: '50%',
            },
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

    const monthlyContractsSeries = [
        {
            name: 'قراردادها',
            data: [12, 18, 15, 22, 19, 25], // Mock data - replace with real data
        },
    ]

    // Chart data - Property types distribution
    const propertyTypesOptions: ApexOptions = {
        chart: {
            type: 'pie',
            fontFamily: 'inherit',
        },
        labels: ['آپارتمان', 'ویلا', 'زمین', 'تجاری', 'اداری'],
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        legend: {
            position: 'bottom',
        },
    }

    const propertyTypesSeries = [
        properties.filter((p) => p.propertyType === 'apartment').length,
        properties.filter((p) => p.propertyType === 'villa').length,
        properties.filter((p) => p.propertyType === 'land').length,
        properties.filter((p) => p.propertyType === 'commercial').length,
        properties.filter((p) => p.propertyType === 'office').length,
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
                    داشبورد مدیریت
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    خوش آمدید، {currentUser.userName}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="کل کاربران"
                    value={new Intl.NumberFormat('fa-IR').format(totalUsers)}
                    icon={<HiOutlineUsers className="h-6 w-6" />}
                    iconClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                />
                <StatCard
                    title="کل قراردادها"
                    value={new Intl.NumberFormat('fa-IR').format(
                        totalContracts
                    )}
                    icon={<HiOutlineDocumentText className="h-6 w-6" />}
                    iconClass="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                />
                <StatCard
                    title="کل املاک"
                    value={new Intl.NumberFormat('fa-IR').format(
                        totalProperties
                    )}
                    icon={<HiOutlineHome className="h-6 w-6" />}
                    iconClass="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                />
                <StatCard
                    title="مجموع کمیسیون پرداخت شده"
                    value={
                        new Intl.NumberFormat('fa-IR').format(
                            totalCommissionValue
                        ) + ' تومان'
                    }
                    icon={<HiOutlineCash className="h-6 w-6" />}
                    iconClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
                />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="p-4">
                    <h3 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        وضعیت قراردادها
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                در انتظار بررسی
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
                    <Link to="/contracts">
                        <Button
                            variant="solid"
                            size="sm"
                            className="mt-4 w-full"
                        >
                            مشاهده همه قراردادها
                        </Button>
                    </Link>
                </Card>

                <Card className="p-4">
                    <h3 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        وضعیت املاک
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                موجود
                            </span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                {new Intl.NumberFormat('fa-IR').format(
                                    availableProperties
                                )}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                فروخته شده
                            </span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {new Intl.NumberFormat('fa-IR').format(
                                    soldProperties
                                )}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                نرخ فروش
                            </span>
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                                {totalProperties > 0
                                    ? Math.round(
                                          (soldProperties / totalProperties) *
                                              100
                                      )
                                    : 0}
                                %
                            </span>
                        </div>
                    </div>
                    <Link to="/properties">
                        <Button
                            variant="solid"
                            size="sm"
                            className="mt-4 w-full"
                        >
                            مشاهده همه املاک
                        </Button>
                    </Link>
                </Card>

                <Card className="p-4">
                    <h3 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        دسترسی سریع
                    </h3>
                    <div className="space-y-2">
                        <Link to="/users">
                            <Button variant="plain" size="sm" className="w-full justify-start">
                                <span className="flex items-center">
                                    <HiOutlineUsers className="ml-2 h-4 w-4" />
                                    <span>مدیریت کاربران</span>
                                </span>
                            </Button>
                        </Link>
                        <Link to="/users/pending-approvals">
                            <Button variant="plain" size="sm" className="w-full justify-start">
                                <span className="flex items-center">
                                    <HiOutlineDocumentText className="ml-2 h-4 w-4" />
                                    <span>تاییدیه‌های در انتظار</span>
                                </span>
                            </Button>
                        </Link>
                        <Link to="/contracts/pending">
                            <Button variant="plain" size="sm" className="w-full justify-start">
                                <span className="flex items-center">
                                    <HiOutlineDocumentText className="ml-2 h-4 w-4" />
                                    <span>قراردادهای در انتظار</span>
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
                        توزیع وضعیت قراردادها
                    </h3>
                    <Chart
                        options={contractStatusOptions}
                        series={contractStatusSeries}
                        type="donut"
                        height={300}
                    />
                </Card>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        روند قراردادهای ماهانه
                    </h3>
                    <Chart
                        options={monthlyContractsOptions}
                        series={monthlyContractsSeries}
                        type="bar"
                        height={300}
                    />
                </Card>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        توزیع نوع املاک
                    </h3>
                    <Chart
                        options={propertyTypesOptions}
                        series={propertyTypesSeries}
                        type="pie"
                        height={300}
                    />
                </Card>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        آخرین فعالیت‌ها
                    </h3>
                    <div className="space-y-3">
                        {contracts.slice(0, 5).map((contract) => (
                            <div
                                key={contract.id}
                                className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0 dark:border-gray-700"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        قرارداد جدید
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {contract.agentName}
                                    </p>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {new Intl.NumberFormat('fa-IR').format(
                                            contract.commissionAmount
                                        )}{' '}
                                        تومان
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(
                                            contract.createdAt
                                        ).toLocaleDateString('fa-IR')}
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

export default SuperAdminDashboard
