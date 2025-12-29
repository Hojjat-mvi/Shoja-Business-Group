import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Input, Select } from '@/components/ui'
import { usePropertyStore } from '@/store/propertyStore'
import { useSessionUser } from '@/store/authStore'
import type { PropertyType, PropertyStatus } from '@/@types/property'
import { HiOutlineArrowLeft } from 'react-icons/hi'

const propertyTypeOptions = [
    { value: 'apartment', label: 'آپارتمان' },
    { value: 'villa', label: 'ویلا' },
    { value: 'townhouse', label: 'تاون‌هاوس' },
    { value: 'land', label: 'زمین' },
    { value: 'commercial', label: 'تجاری' },
    { value: 'other', label: 'سایر' },
]

const propertyStatusOptions = [
    { value: 'available', label: 'موجود' },
    { value: 'pending', label: 'در انتظار' },
    { value: 'sold', label: 'فروخته شده' },
    { value: 'off_market', label: 'خارج از بازار' },
]

const PropertyForm = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditMode = Boolean(id)

    const currentUser = useSessionUser((state) => state.user)
    const { properties, fetchProperties } = usePropertyStore()

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        propertyType: 'apartment' as PropertyType,
        status: 'available' as PropertyStatus,
        address: '',
        city: '',
        province: '',
        postalCode: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        parkingSpaces: '',
        area_sqm: '',
        yearBuilt: '',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        fetchProperties()
    }, [fetchProperties])

    useEffect(() => {
        if (isEditMode && id) {
            const property = properties.find((p) => p.id === id)
            if (property) {
                setFormData({
                    title: property.title,
                    description: property.description,
                    propertyType: property.propertyType,
                    status: property.status,
                    address: property.address,
                    city: property.city,
                    province: property.province || '',
                    postalCode: property.postalCode || '',
                    price: property.price.toString(),
                    bedrooms: property.bedrooms?.toString() || '',
                    bathrooms: property.bathrooms?.toString() || '',
                    parkingSpaces: property.parkingSpaces?.toString() || '',
                    area_sqm: property.area_sqm?.toString() || '',
                    yearBuilt: property.yearBuilt?.toString() || '',
                })
            }
        }
    }, [id, isEditMode, properties])

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

        if (!formData.title.trim()) {
            newErrors.title = 'عنوان الزامی است'
        }
        if (!formData.description.trim()) {
            newErrors.description = 'توضیحات الزامی است'
        }
        if (!formData.address.trim()) {
            newErrors.address = 'آدرس الزامی است'
        }
        if (!formData.city.trim()) {
            newErrors.city = 'شهر الزامی است'
        }
        if (!formData.price || isNaN(Number(formData.price))) {
            newErrors.price = 'قیمت باید عدد باشد'
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
            // TODO: Implement API call to create/update property
            console.log('Saving property:', formData)
            alert('قابلیت ثبت ملک به زودی اضافه خواهد شد')
            // navigate('/properties')
        } catch (error) {
            console.error('Error saving property:', error)
            alert('خطا در ذخیره ملک')
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
                        onClick={() => navigate('/properties')}
                    >
                        بازگشت
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {isEditMode ? 'ویرایش ملک' : 'افزودن ملک جدید'}
                        </h1>
                    </div>
                </div>
                <Button
                    variant="solid"
                    onClick={handleSubmit}
                    loading={loading}
                >
                    {isEditMode ? 'بروزرسانی' : 'ذخیره'}
                </Button>
            </div>

            {/* Form */}
            <Card className="p-6">
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            اطلاعات اولیه
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    عنوان ملک *
                                </label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) =>
                                        handleInputChange('title', e.target.value)
                                    }
                                    placeholder="مثال: آپارتمان 120 متری"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    نوع ملک *
                                </label>
                                <Select
                                    value={propertyTypeOptions.find(
                                        (opt) => opt.value === formData.propertyType
                                    )}
                                    options={propertyTypeOptions}
                                    onChange={(option) =>
                                        option &&
                                        handleInputChange(
                                            'propertyType',
                                            option.value
                                        )
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    توضیحات *
                                </label>
                                <Input
                                    textArea
                                    value={formData.description}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'description',
                                            e.target.value
                                        )
                                    }
                                    placeholder="توضیحات کامل ملک..."
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            موقعیت مکانی
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    شهر *
                                </label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) =>
                                        handleInputChange('city', e.target.value)
                                    }
                                    placeholder="تهران"
                                />
                                {errors.city && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.city}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    استان
                                </label>
                                <Input
                                    value={formData.province}
                                    onChange={(e) =>
                                        handleInputChange('province', e.target.value)
                                    }
                                    placeholder="تهران"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    آدرس کامل *
                                </label>
                                <Input
                                    value={formData.address}
                                    onChange={(e) =>
                                        handleInputChange('address', e.target.value)
                                    }
                                    placeholder="خیابان، کوچه، پلاک"
                                />
                                {errors.address && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.address}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    کد پستی
                                </label>
                                <Input
                                    value={formData.postalCode}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'postalCode',
                                            e.target.value
                                        )
                                    }
                                    placeholder="1234567890"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            جزئیات ملک
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    قیمت (تومان) *
                                </label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) =>
                                        handleInputChange('price', e.target.value)
                                    }
                                    placeholder="5000000000"
                                />
                                {errors.price && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    متراژ (متر مربع)
                                </label>
                                <Input
                                    type="number"
                                    value={formData.area_sqm}
                                    onChange={(e) =>
                                        handleInputChange('area_sqm', e.target.value)
                                    }
                                    placeholder="120"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    تعداد اتاق خواب
                                </label>
                                <Input
                                    type="number"
                                    value={formData.bedrooms}
                                    onChange={(e) =>
                                        handleInputChange('bedrooms', e.target.value)
                                    }
                                    placeholder="3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    تعداد سرویس بهداشتی
                                </label>
                                <Input
                                    type="number"
                                    value={formData.bathrooms}
                                    onChange={(e) =>
                                        handleInputChange('bathrooms', e.target.value)
                                    }
                                    placeholder="2"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    تعداد پارکینگ
                                </label>
                                <Input
                                    type="number"
                                    value={formData.parkingSpaces}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'parkingSpaces',
                                            e.target.value
                                        )
                                    }
                                    placeholder="1"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    سال ساخت
                                </label>
                                <Input
                                    type="number"
                                    value={formData.yearBuilt}
                                    onChange={(e) =>
                                        handleInputChange('yearBuilt', e.target.value)
                                    }
                                    placeholder="1402"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    وضعیت
                                </label>
                                <Select
                                    value={propertyStatusOptions.find(
                                        (opt) => opt.value === formData.status
                                    )}
                                    options={propertyStatusOptions}
                                    onChange={(option) =>
                                        option &&
                                        handleInputChange('status', option.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default PropertyForm
