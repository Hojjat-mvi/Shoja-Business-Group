import { useEffect, useState } from 'react'
import { Card, Button, Badge, Input } from '@/components/ui'
import { useContractStore } from '@/store/contractStore'
import { useSessionUser } from '@/store/authStore'
import { ContractStatusBadge } from '@/components/shared'
import type { Contract } from '@/@types/contract'
import {
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineDocumentText,
    HiOutlineClock,
    HiOutlineDownload,
} from 'react-icons/hi'
import { exportContractsToExcel } from '@/utils/exportToExcel'

const PendingApprovals = () => {
    const currentUser = useSessionUser((state) => state.user)
    const { pendingContracts, fetchPendingContracts, updateContractStatusAction } =
        useContractStore()

    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})
    const [commissionAmounts, setCommissionAmounts] = useState<Record<string, string>>({})
    const [commissionNotes, setCommissionNotes] = useState<Record<string, string>>({})

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                await fetchPendingContracts()
            } catch (error) {
                console.error('Error loading pending contracts:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [fetchPendingContracts])

    const handleApprove = async (contract: Contract) => {
        if (!currentUser.userId || !currentUser.userName) {
            alert('خطا: اطلاعات کاربر موجود نیست')
            return
        }

        // Validate commission amount
        const commissionStr = commissionAmounts[contract.id]
        if (!commissionStr || commissionStr.trim() === '') {
            alert('لطفاً مبلغ کمیسیون را وارد کنید')
            return
        }

        const commissionAmount = parseFloat(commissionStr.replace(/,/g, ''))
        if (isNaN(commissionAmount) || commissionAmount <= 0) {
            alert('مبلغ کمیسیون باید عدد مثبت باشد')
            return
        }

        // Validate commission does not exceed final price
        if (commissionAmount > contract.finalPrice) {
            alert('مبلغ کمیسیون نمی‌تواند بیشتر از مبلغ قرارداد باشد')
            return
        }

        setProcessingId(contract.id)
        try {
            await updateContractStatusAction(
                contract.id,
                'approved',
                currentUser.userId,
                currentUser.userName,
                reviewNotes[contract.id] || undefined,
                commissionAmount,
                commissionNotes[contract.id] || undefined
            )
            alert('قرارداد با موفقیت تایید شد')
            await fetchPendingContracts()
        } catch (error) {
            console.error('Error approving contract:', error)
            alert('خطا در تایید قرارداد')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (contract: Contract) => {
        if (!currentUser.userId || !currentUser.userName) {
            alert('خطا: اطلاعات کاربر موجود نیست')
            return
        }

        if (!reviewNotes[contract.id]) {
            alert('لطفاً دلیل رد را وارد کنید')
            return
        }

        if (
            !confirm('آیا از رد این قرارداد اطمینان دارید؟')
        ) {
            return
        }

        setProcessingId(contract.id)
        try {
            await updateContractStatusAction(
                contract.id,
                'rejected',
                currentUser.userId,
                currentUser.userName,
                reviewNotes[contract.id]
            )
            alert('قرارداد رد شد')
            await fetchPendingContracts()
        } catch (error) {
            console.error('Error rejecting contract:', error)
            alert('خطا در رد قرارداد')
        } finally {
            setProcessingId(null)
        }
    }

    const handleExport = () => {
        exportContractsToExcel(
            pendingContracts,
            `pending_contracts_${new Date().toISOString().split('T')[0]}.xlsx`
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
                        قراردادهای در انتظار تایید
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        قراردادهای بارگذاری شده را بررسی و تایید کنید
                    </p>
                </div>
                {pendingContracts.length > 0 && (
                    <Button
                        variant="default"
                        icon={<HiOutlineDownload />}
                        onClick={handleExport}
                    >
                        خروجی Excel
                    </Button>
                )}
            </div>

            {/* Stats Card */}
            <Card className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-500/20">
                        <HiOutlineClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            قراردادهای در انتظار
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {new Intl.NumberFormat('fa-IR').format(
                                pendingContracts.length
                            )}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Pending Contracts */}
            {pendingContracts.length === 0 ? (
                <Card className="p-12">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                            <HiOutlineDocumentText className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            قراردادی در انتظار نیست
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            قراردادهای جدید اینجا نمایش داده می‌شوند
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {pendingContracts.map((contract) => (
                        <Card key={contract.id} className="p-6">
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                قرارداد #{contract.id.slice(0, 8)}
                                            </h3>
                                            <ContractStatusBadge status={contract.status} />
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            کارشناس: {contract.agentName}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            بارگذاری شده در:{' '}
                                            {new Date(
                                                contract.uploadedAt
                                            ).toLocaleDateString('fa-IR')}
                                        </p>
                                    </div>
                                </div>

                                {/* Contract Details */}
                                <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50 md:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            مشتری
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {contract.customerName}
                                        </p>
                                        {contract.customerPhone && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {contract.customerPhone}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            فروشنده
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {contract.sellerName}
                                        </p>
                                        {contract.sellerPhone && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {contract.sellerPhone}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            مبلغ قرارداد
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {new Intl.NumberFormat('fa-IR').format(
                                                contract.finalPrice
                                            )}{' '}
                                            تومان
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            تاریخ قرارداد
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {new Date(
                                                contract.contractDate
                                            ).toLocaleDateString('fa-IR')}
                                        </p>
                                    </div>
                                </div>

                                {/* Commission Entry Section */}
                                <div className="rounded-lg border-2 border-primary-200 bg-primary-50 p-4 dark:border-primary-700 dark:bg-primary-900/20">
                                    <h4 className="mb-3 text-sm font-bold text-primary-800 dark:text-primary-200">
                                        مبلغ کمیسیون (الزامی برای تایید) *
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                مبلغ کمیسیون (تومان) *
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="مثال: 2000000000"
                                                value={commissionAmounts[contract.id] || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '')
                                                    setCommissionAmounts((prev) => ({
                                                        ...prev,
                                                        [contract.id]: value,
                                                    }))
                                                }}
                                                disabled={processingId === contract.id}
                                                className="font-semibold"
                                            />
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                حداکثر:{' '}
                                                {new Intl.NumberFormat('fa-IR').format(
                                                    contract.finalPrice
                                                )}{' '}
                                                تومان
                                            </p>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                یادداشت کمیسیون (اختیاری)
                                            </label>
                                            <Input
                                                textArea
                                                placeholder="توضیحات در مورد مبلغ کمیسیون..."
                                                rows={3}
                                                value={commissionNotes[contract.id] || ''}
                                                onChange={(e) =>
                                                    setCommissionNotes((prev) => ({
                                                        ...prev,
                                                        [contract.id]: e.target.value,
                                                    }))
                                                }
                                                disabled={processingId === contract.id}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Review Notes */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        یادداشت بررسی (اختیاری برای تایید، الزامی برای رد)
                                    </label>
                                    <Input
                                        textArea
                                        placeholder="یادداشت خود را اینجا بنویسید..."
                                        rows={3}
                                        value={reviewNotes[contract.id] || ''}
                                        onChange={(e) =>
                                            setReviewNotes((prev) => ({
                                                ...prev,
                                                [contract.id]: e.target.value,
                                            }))
                                        }
                                        disabled={processingId === contract.id}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                                    <Button
                                        variant="solid"
                                        className="bg-red-600 hover:bg-red-700"
                                        icon={<HiOutlineX />}
                                        onClick={() => handleReject(contract)}
                                        loading={processingId === contract.id}
                                        disabled={processingId !== null}
                                    >
                                        رد کردن
                                    </Button>
                                    <Button
                                        variant="solid"
                                        className="bg-green-600 hover:bg-green-700"
                                        icon={<HiOutlineCheck />}
                                        onClick={() => handleApprove(contract)}
                                        loading={processingId === contract.id}
                                        disabled={processingId !== null}
                                    >
                                        تایید کردن
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default PendingApprovals
