import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Input, Upload } from '@/components/ui'
import { useContractStore } from '@/store/contractStore'
import { HiOutlineArrowLeft, HiOutlineDocumentText } from 'react-icons/hi'

const ContractForm = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { contracts, fetchContracts } = useContractStore()

    const [mode, setMode] = useState<'create' | 'edit'>('create')
    const [loading, setLoading] = useState(false)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        sellerName: '',
        sellerPhone: '',
        finalPrice: '',
        contractDate: '',
    })

    useEffect(() => {
        const loadContract = async () => {
            if (id) {
                setMode('edit')
                await fetchContracts()
                const contract = contracts.find((c) => c.id === id)
                if (contract) {
                    setFormData({
                        customerName: contract.customerName,
                        customerPhone: contract.customerPhone || '',
                        sellerName: contract.sellerName,
                        sellerPhone: contract.sellerPhone || '',
                        finalPrice: contract.finalPrice.toString(),
                        contractDate: contract.contractDate.split('T')[0],
                    })
                }
            }
        }
        loadContract()
    }, [id, contracts, fetchContracts])

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

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        // File is only required for create mode
        if (mode === 'create' && !uploadedFile) {
            newErrors.file = 'بارگذاری فایل قرارداد الزامی است'
        }
        if (!formData.customerName.trim()) {
            newErrors.customerName = 'نام مشتری الزامی است'
        }
        if (!formData.customerPhone.trim()) {
            newErrors.customerPhone = 'تلفن مشتری الزامی است'
        }
        if (!formData.sellerName.trim()) {
            newErrors.sellerName = 'نام فروشنده الزامی است'
        }
        if (!formData.sellerPhone.trim()) {
            newErrors.sellerPhone = 'تلفن فروشنده الزامی است'
        }
        if (!formData.finalPrice || isNaN(Number(formData.finalPrice))) {
            newErrors.finalPrice = 'مبلغ نهایی الزامی است و باید عدد باشد'
        }
        if (!formData.contractDate) {
            newErrors.contractDate = 'تاریخ قرارداد الزامی است'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }

        setLoading(true)
        try {
            if (mode === 'create') {
                console.log('Creating contract:', { uploadedFile, ...formData })
                alert('قابلیت بارگذاری قرارداد به زودی اضافه خواهد شد')
            } else {
                console.log('Updating contract:', { id, ...formData })
                alert('قرارداد با موفقیت ویرایش شد')
                navigate(`/contracts/${id}`)
            }
        } catch (error) {
            console.error('Error saving contract:', error)
            alert('خطا در ذخیره قرارداد')
        } finally {
            setLoading(false)
        }
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
                            {mode === 'create' ? 'بارگذاری قرارداد جدید' : 'ویرایش قرارداد'}
                        </h1>
                    </div>
                </div>
                <Button variant="solid" onClick={handleSubmit} loading={loading}>
                    {mode === 'create' ? 'بارگذاری' : 'ذخیره تغییرات'}
                </Button>
            </div>

            {/* Form */}
            <Card className="p-6">
                <div className="space-y-6">
                    {/* File Upload Section - Only for create mode */}
                    {mode === 'create' && (
                        <div>
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                فایل قرارداد *
                            </h3>
                            <Upload
                                draggable
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(files) => {
                                    if (files && files.length > 0) {
                                        setUploadedFile(files[0])
                                        // Clear error when file is uploaded
                                        if (errors.file) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                file: '',
                                            }))
                                        }
                                    }
                                }}
                            >
                                <div className="flex flex-col items-center justify-center gap-3 py-8">
                                    <HiOutlineDocumentText className="h-12 w-12 text-gray-400" />
                                    {uploadedFile ? (
                                        <div className="text-center">
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {uploadedFile.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                فایل قرارداد را بکشید و رها کنید
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                یا برای انتخاب فایل کلیک کنید
                                            </p>
                                            <p className="mt-2 text-xs text-gray-400">
                                                فرمت‌های مجاز: PDF, DOC, DOCX, JPG, PNG
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Upload>
                            {errors.file && (
                                <p className="mt-1 text-xs text-red-600">{errors.file}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            اطلاعات قرارداد
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    نام مشتری *
                                </label>
                                <Input
                                    value={formData.customerName}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'customerName',
                                            e.target.value
                                        )
                                    }
                                    placeholder="نام و نام خانوادگی"
                                />
                                {errors.customerName && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.customerName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    تلفن مشتری *
                                </label>
                                <Input
                                    value={formData.customerPhone}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'customerPhone',
                                            e.target.value
                                        )
                                    }
                                    placeholder="09123456789"
                                />
                                {errors.customerPhone && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.customerPhone}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    نام فروشنده *
                                </label>
                                <Input
                                    value={formData.sellerName}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'sellerName',
                                            e.target.value
                                        )
                                    }
                                    placeholder="نام و نام خانوادگی"
                                />
                                {errors.sellerName && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.sellerName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    تلفن فروشنده *
                                </label>
                                <Input
                                    value={formData.sellerPhone}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'sellerPhone',
                                            e.target.value
                                        )
                                    }
                                    placeholder="09123456789"
                                />
                                {errors.sellerPhone && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.sellerPhone}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    مبلغ نهایی (تومان) *
                                </label>
                                <Input
                                    type="number"
                                    value={formData.finalPrice}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'finalPrice',
                                            e.target.value
                                        )
                                    }
                                    placeholder="5000000000"
                                />
                                {errors.finalPrice && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.finalPrice}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    تاریخ قرارداد *
                                </label>
                                <Input
                                    type="date"
                                    value={formData.contractDate}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'contractDate',
                                            e.target.value
                                        )
                                    }
                                />
                                {errors.contractDate && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.contractDate}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default ContractForm
