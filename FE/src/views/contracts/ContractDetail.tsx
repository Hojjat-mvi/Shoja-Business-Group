import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Badge, Dialog, Input } from '@/components/ui'
import { useContractStore } from '@/store/contractStore'
import { useSessionUser } from '@/store/authStore'
import { usePermissions } from '@/utils/hooks/usePermissions'
import type { Contract } from '@/@types/contract'
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlineCash } from 'react-icons/hi'

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

const ContractDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const currentUser = useSessionUser((state) => state.user)
    const permissions = usePermissions()
    const { contracts, fetchContracts, updateContractStatusAction } = useContractStore()

    const [loading, setLoading] = useState(true)
    const [contract, setContract] = useState<Contract | null>(null)
    const [showPaymentDialog, setShowPaymentDialog] = useState(false)
    const [paymentReference, setPaymentReference] = useState('')
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                await fetchContracts()
                if (id) {
                    const foundContract = contracts.find((c) => c.id === id)
                    if (foundContract) {
                        setContract(foundContract)
                    }
                }
            } catch (error) {
                console.error('Error loading contract:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id, fetchContracts, contracts])

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fa-IR').format(price)
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fa-IR')
    }

    const handleMarkAsPaid = async () => {
        if (!currentUser.userId || !currentUser.userName || !contract) {
            alert('خطا: اطلاعات کاربر موجود نیست')
            return
        }

        setProcessing(true)
        try {
            await updateContractStatusAction(
                contract.id,
                'paid',
                currentUser.userId,
                currentUser.userName,
                undefined,
                paymentReference || undefined
            )
            alert('قرارداد با موفقیت به عنوان پرداخت شده علامت‌گذاری شد')
            setShowPaymentDialog(false)
            setPaymentReference('')
            await fetchContracts()
            // Reload contract
            const updatedContract = contracts.find((c) => c.id === contract.id)
            if (updatedContract) {
                setContract(updatedContract)
            }
        } catch (error) {
            console.error('Error marking as paid:', error)
            alert('خطا در علامت‌گذاری پرداخت')
        } finally {
            setProcessing(false)
        }
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

    if (!contract) {
        return (
            <Card className="p-12">
                <div className="text-center">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        قرارداد یافت نشد
                    </h3>
                    <Button
                        variant="solid"
                        onClick={() => navigate('/contracts')}
                    >
                        بازگشت به لیست قراردادها
                    </Button>
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/contracts')}
                    >
                        بازگشت
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            جزئیات قرارداد
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            شماره: {contract.id.slice(0, 8)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        className={contractStatusColors[contract.status]}
                        content={contractStatusLabels[contract.status]}
                    />
                    {permissions.isSuperAdmin && contract.status === 'approved' && (
                        <Button
                            variant="solid"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            icon={<HiOutlineCash />}
                            onClick={() => setShowPaymentDialog(true)}
                        >
                            علامت‌گذاری پرداخت شده
                        </Button>
                    )}
                    {permissions.isSuperAdmin && (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiOutlinePencil />}
                            onClick={() => navigate(`/contracts/edit/${contract.id}`)}
                        >
                            ویرایش
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            اطلاعات مشتری
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    نام مشتری
                                </p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {contract.customerName}
                                </p>
                            </div>
                            {contract.customerPhone && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        تلفن
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {contract.customerPhone}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            اطلاعات فروشنده
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    نام فروشنده
                                </p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {contract.sellerName}
                                </p>
                            </div>
                            {contract.sellerPhone && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        تلفن
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {contract.sellerPhone}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card className="p-6">
                        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            مبلغ قرارداد
                        </h3>
                        <p className="text-3xl font-bold text-primary-600">
                            {formatPrice(contract.finalPrice)} تومان
                        </p>
                        {(contract.status === 'approved' || contract.status === 'paid') && (
                            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    کمیسیون
                                </p>
                                {contract.commissionAmount !== undefined ? (
                                    <>
                                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                            {formatPrice(contract.commissionAmount)} تومان
                                        </p>
                                        {contract.commissionNotes && (
                                            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                                {contract.commissionNotes}
                                            </p>
                                        )}
                                        {contract.commissionEnteredByName && (
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                ثبت شده توسط: {contract.commissionEnteredByName}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                        هنوز تعیین نشده
                                    </p>
                                )}
                            </div>
                        )}
                    </Card>

                    <Card className="p-6">
                        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            کارشناس
                        </h3>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                            {contract.agentName}
                        </p>
                    </Card>

                    <Card className="p-6">
                        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            تاریخ‌ها
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                    تاریخ قرارداد:
                                </span>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {formatDate(contract.contractDate)}
                                </p>
                            </div>
                            {contract.paidAt && (
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        تاریخ پرداخت:
                                    </span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {formatDate(contract.paidAt)}
                                    </p>
                                    {contract.paymentReference && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            شماره مرجع: {contract.paymentReference}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>

                    {contract.reviewedByName && (
                        <Card className="p-6">
                            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                اطلاعات بررسی
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        بررسی شده توسط:
                                    </span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {contract.reviewedByName}
                                    </p>
                                </div>
                                {contract.reviewedAt && (
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            تاریخ بررسی:
                                        </span>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {formatDate(contract.reviewedAt)}
                                        </p>
                                    </div>
                                )}
                                {contract.reviewNotes && (
                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-500 dark:text-gray-400">
                                            یادداشت:
                                        </span>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {contract.reviewNotes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Payment Dialog */}
            <Dialog
                isOpen={showPaymentDialog}
                onClose={() => setShowPaymentDialog(false)}
            >
                <h5 className="mb-4 text-lg font-bold">تایید پرداخت</h5>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    قرارداد به عنوان پرداخت شده علامت‌گذاری می‌شود
                </p>
                <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium">
                        شماره مرجع پرداخت (اختیاری)
                    </label>
                    <Input
                        placeholder="شماره مرجع پرداخت را وارد کنید"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button
                        onClick={() => setShowPaymentDialog(false)}
                        disabled={processing}
                    >
                        انصراف
                    </Button>
                    <Button
                        variant="solid"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleMarkAsPaid}
                        loading={processing}
                    >
                        تایید پرداخت
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default ContractDetail
