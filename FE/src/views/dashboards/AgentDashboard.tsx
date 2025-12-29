import { useEffect, useState, useMemo } from 'react'
import { Card, Button } from '@/components/ui'
import { StatCard, PropertyCard, ContractStatusBadge } from '@/components/shared'
import Chart from 'react-apexcharts'
import { useContractStore } from '@/store/contractStore'
import { usePropertyStore } from '@/store/propertyStore'
import { useSessionUser } from '@/store/authStore'
import type { ApexOptions } from 'apexcharts'
import {
    HiOutlineDocumentText,
    HiOutlineHome,
    HiOutlineCash,
    HiOutlinePlus,
} from 'react-icons/hi'
import { Link, useNavigate } from 'react-router-dom'

const AgentDashboard = () => {
    const navigate = useNavigate()
    const currentUser = useSessionUser((state) => state.user)
    const { contracts, fetchContracts } = useContractStore()
    const { properties, fetchProperties } = usePropertyStore()

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                await Promise.all([fetchContracts(), fetchProperties()])
            } catch (error) {
                console.error('Error loading dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [fetchContracts, fetchProperties])

    // Filter my data
    const myContracts = useMemo(() => {
        return contracts.filter((c) => c.agentId === currentUser.userId)
    }, [contracts, currentUser.userId])

    const myProperties = useMemo(() => {
        return properties.filter((p) => p.ownerId === currentUser.userId)
    }, [properties, currentUser.userId])

    // Calculate statistics
    const totalContracts = myContracts.length
    const totalProperties = myProperties.length

    const pendingContracts = myContracts.filter((c) => c.status === 'pending')
        .length
    const approvedContracts = myContracts.filter(
        (c) => c.status === 'approved'
    ).length
    const paidContracts = myContracts.filter((c) => c.status === 'paid').length
    const rejectedContracts = myContracts.filter(
        (c) => c.status === 'rejected'
    ).length

    // My commission from paid contracts
    const totalCommissionEarned = myContracts
        .filter((c) => c.status === 'paid' && c.commissionAmount !== undefined)
        .reduce((sum, c) => sum + (c.commissionAmount || 0), 0)

    const pendingCommission = myContracts
        .filter((c) => c.status === 'approved' && c.commissionAmount !== undefined)
        .reduce((sum, c) => sum + (c.commissionAmount || 0), 0)

    const availableProperties = myProperties.filter(
        (p) => p.status === 'available'
    ).length
    const soldProperties = myProperties.filter((p) => p.status === 'sold')
        .length

    // Chart data - Contract status
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
        pendingContracts,
        approvedContracts,
        rejectedContracts,
        paidContracts,
    ]

    // Monthly earnings chart
    const monthlyEarningsOptions: ApexOptions = {
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
        colors: ['#3B82F6'],
        grid: {
            strokeDashArray: 4,
        },
        yaxis: {
            labels: {
                formatter: (value) => {
                    return new Intl.NumberFormat('fa-IR').format(value / 1000000) + 'م'
                },
            },
        },
    }

    const monthlyEarningsSeries = [
        {
            name: 'کمیسیون (میلیون تومان)',
            data: [5, 8, 6, 10, 7, 12], // Mock data
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
                    داشبورد مشاور املاک
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    خوش آمدید، {currentUser.userName}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="کل قراردادها"
                    value={new Intl.NumberFormat('fa-IR').format(
                        totalContracts
                    )}
                    icon={<HiOutlineDocumentText className="h-6 w-6" />}
                    iconClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
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
                    title="کمیسیون دریافتی"
                    value={
                        new Intl.NumberFormat('fa-IR').format(
                            totalCommissionEarned
                        ) + ' تومان'
                    }
                    icon={<HiOutlineCash className="h-6 w-6" />}
                    iconClass="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                />
                <StatCard
                    title="کمیسیون در انتظار"
                    value={
                        new Intl.NumberFormat('fa-IR').format(
                            pendingCommission
                        ) + ' تومان'
                    }
                    icon={<HiOutlineCash className="h-6 w-6" />}
                    iconClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
                />
            </div>

            {/* Quick Actions */}
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
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                رد شده
                            </span>
                            <span className="font-semibold text-red-600 dark:text-red-400">
                                {new Intl.NumberFormat('fa-IR').format(
                                    rejectedContracts
                                )}
                            </span>
                        </div>
                    </div>
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
                </Card>

                <Card className="p-4">
                    <h3 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        اقدامات سریع
                    </h3>
                    <div className="space-y-3">
                        <Button
                            variant="solid"
                            size="sm"
                            className="w-full"
                            onClick={() => navigate('/contracts/upload')}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <HiOutlinePlus className="h-4 w-4" />
                                <span>ثبت قرارداد جدید</span>
                            </span>
                        </Button>
                        <Button
                            variant="solid"
                            size="sm"
                            className="w-full"
                            onClick={() => navigate('/properties/new')}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <HiOutlinePlus className="h-4 w-4" />
                                <span>ثبت ملک جدید</span>
                            </span>
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        توزیع وضعیت قراردادها
                    </h3>
                    {totalContracts > 0 ? (
                        <Chart
                            options={contractStatusOptions}
                            series={contractStatusSeries}
                            type="donut"
                            height={300}
                        />
                    ) : (
                        <div className="flex h-64 items-center justify-center text-gray-500">
                            هنوز قراردادی ثبت نشده است
                        </div>
                    )}
                </Card>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        روند کمیسیون ماهانه
                    </h3>
                    <Chart
                        options={monthlyEarningsOptions}
                        series={monthlyEarningsSeries}
                        type="area"
                        height={300}
                    />
                </Card>
            </div>

            {/* Recent Contracts */}
            <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        آخرین قراردادها
                    </h3>
                    <Link to="/contracts">
                        <Button variant="plain" size="sm">
                            مشاهده همه
                        </Button>
                    </Link>
                </div>
                {myContracts.length > 0 ? (
                    <div className="space-y-3">
                        {myContracts.slice(0, 5).map((contract) => (
                            <div
                                key={contract.id}
                                className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0 dark:border-gray-700"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        قرارداد شماره {contract.id.slice(0, 8)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(
                                            contract.createdAt
                                        ).toLocaleDateString('fa-IR')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {new Intl.NumberFormat(
                                                'fa-IR'
                                            ).format(contract.commissionAmount)}{' '}
                                            تومان
                                        </p>
                                    </div>
                                    <ContractStatusBadge
                                        status={contract.status}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center text-gray-500">
                        هنوز قراردادی ثبت نشده است
                    </div>
                )}
            </Card>

            {/* My Properties */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        املاک من
                    </h3>
                    <Link to="/properties">
                        <Button variant="plain" size="sm">
                            مشاهده همه
                        </Button>
                    </Link>
                </div>
                {myProperties.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {myProperties.slice(0, 3).map((property) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                onClick={() => navigate(`/properties/${property.id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="p-8">
                        <div className="space-y-3 text-center text-gray-500">
                            <p>هنوز ملکی ثبت نشده است</p>
                            <p className="text-xs">
                                املاک با شناسه کاربری: {currentUser.userId}
                            </p>
                            <p className="text-xs">
                                تعداد کل املاک: {properties.length}
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default AgentDashboard
