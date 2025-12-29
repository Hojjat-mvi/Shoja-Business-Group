import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, Button, Badge } from '@/components/ui'
import { usePropertyStore } from '@/store/propertyStore'
import type { Property } from '@/@types/property'
import {
    HiOutlineArrowLeft,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineLocationMarker,
    HiOutlineHome,
    HiOutlineCube,
    HiOutlineCalendar,
    HiOutlineCurrencyDollar,
    HiOutlineUser,
} from 'react-icons/hi'

const propertyTypeLabels: Record<string, string> = {
    apartment: 'آپارتمان',
    villa: 'ویلا',
    townhouse: 'تاون‌هاوس',
    land: 'زمین',
    commercial: 'تجاری',
    other: 'سایر',
}

const propertyStatusLabels: Record<string, string> = {
    available: 'موجود',
    pending: 'در انتظار',
    sold: 'فروخته شده',
    off_market: 'خارج از بازار',
}

const propertyStatusColors: Record<string, string> = {
    available:
        'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    pending:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    sold: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    off_market:
        'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
}

const PropertyDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { properties, fetchProperties, deleteProperty } = usePropertyStore()

    const [loading, setLoading] = useState(true)
    const [property, setProperty] = useState<Property | null>(null)
    const [selectedImage, setSelectedImage] = useState(0)

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                await fetchProperties()
                if (id) {
                    const foundProperty = properties.find((p) => p.id === id)
                    if (foundProperty) {
                        setProperty(foundProperty)
                    }
                }
            } catch (error) {
                console.error('Error loading property:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id, fetchProperties, properties])

    const handleDelete = async () => {
        if (!property) return
        if (confirm(`آیا از حذف ${property.title} اطمینان دارید؟`)) {
            try {
                await deleteProperty(property.id)
                navigate('/properties')
            } catch (error) {
                console.error('Error deleting property:', error)
                alert('خطا در حذف ملک')
            }
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fa-IR').format(price)
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fa-IR')
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

    if (!property) {
        return (
            <Card className="p-12">
                <div className="text-center">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        ملک یافت نشد
                    </h3>
                    <Link to="/properties">
                        <Button variant="solid">بازگشت به لیست املاک</Button>
                    </Link>
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
                        onClick={() => navigate('/properties')}
                    >
                        بازگشت
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            جزئیات ملک
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link to={`/properties/edit/${property.id}`}>
                        <Button variant="solid" icon={<HiOutlinePencil />}>
                            ویرایش
                        </Button>
                    </Link>
                    <Button
                        variant="solid"
                        className="bg-red-600 hover:bg-red-700"
                        icon={<HiOutlineTrash />}
                        onClick={handleDelete}
                    >
                        حذف
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Images Section */}
                <div className="lg:col-span-2">
                    <Card className="overflow-hidden">
                        {/* Main Image */}
                        <div className="relative h-96 bg-gray-200 dark:bg-gray-700">
                            {property.images.length > 0 ? (
                                <img
                                    src={property.images[selectedImage]}
                                    alt={property.title}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                    }}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <HiOutlineHome className="h-24 w-24 text-gray-400" />
                                </div>
                            )}
                            <div className="absolute left-4 top-4">
                                <Badge
                                    className={
                                        propertyStatusColors[property.status]
                                    }
                                    content={
                                        propertyStatusLabels[property.status]
                                    }
                                />
                            </div>
                        </div>

                        {/* Thumbnail Gallery */}
                        {property.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2 p-4">
                                {property.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`relative h-20 overflow-hidden rounded-lg border-2 transition-all ${
                                            selectedImage === index
                                                ? 'border-primary-500'
                                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                                        }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${property.title} ${index + 1}`}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display =
                                                    'none'
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Property Details */}
                        <div className="border-t border-gray-200 p-6 dark:border-gray-700">
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {property.title}
                            </h2>

                            <div className="mb-4 flex items-center gap-2">
                                <Badge
                                    className="orange"
                                    content={
                                        propertyTypeLabels[property.propertyType]
                                    }
                                />
                            </div>

                            <p className="mb-6 text-gray-600 dark:text-gray-400">
                                {property.description}
                            </p>

                            {/* Features Grid */}
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                {property.area_sqm && (
                                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <HiOutlineCube className="h-5 w-5" />
                                            <span className="text-sm">
                                                مساحت
                                            </span>
                                        </div>
                                        <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                                            {formatPrice(property.area_sqm)} متر
                                        </p>
                                    </div>
                                )}
                                {property.bedrooms && (
                                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <HiOutlineHome className="h-5 w-5" />
                                            <span className="text-sm">
                                                اتاق خواب
                                            </span>
                                        </div>
                                        <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                                            {formatPrice(property.bedrooms)} عدد
                                        </p>
                                    </div>
                                )}
                                {property.bathrooms && (
                                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <HiOutlineHome className="h-5 w-5" />
                                            <span className="text-sm">
                                                سرویس بهداشتی
                                            </span>
                                        </div>
                                        <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                                            {formatPrice(property.bathrooms)}{' '}
                                            عدد
                                        </p>
                                    </div>
                                )}
                                {property.parkingSpaces && (
                                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <HiOutlineHome className="h-5 w-5" />
                                            <span className="text-sm">
                                                پارکینگ
                                            </span>
                                        </div>
                                        <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                                            {formatPrice(
                                                property.parkingSpaces
                                            )}{' '}
                                            عدد
                                        </p>
                                    </div>
                                )}
                                {property.yearBuilt && (
                                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <HiOutlineCalendar className="h-5 w-5" />
                                            <span className="text-sm">
                                                سال ساخت
                                            </span>
                                        </div>
                                        <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                                            {formatPrice(property.yearBuilt)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-4">
                    {/* Price Card */}
                    <Card className="p-6">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <HiOutlineCurrencyDollar className="h-5 w-5" />
                            <span className="text-sm">قیمت</span>
                        </div>
                        <p className="mt-2 text-3xl font-bold text-primary-600">
                            {formatPrice(property.price)} تومان
                        </p>
                    </Card>

                    {/* Location Card */}
                    <Card className="p-6">
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            <HiOutlineLocationMarker className="h-5 w-5" />
                            موقعیت مکانی
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <p>
                                <span className="font-medium">آدرس:</span>{' '}
                                {property.address}
                            </p>
                            <p>
                                <span className="font-medium">شهر:</span>{' '}
                                {property.city}
                            </p>
                            {property.province && (
                                <p>
                                    <span className="font-medium">استان:</span>{' '}
                                    {property.province}
                                </p>
                            )}
                            {property.postalCode && (
                                <p>
                                    <span className="font-medium">
                                        کد پستی:
                                    </span>{' '}
                                    {property.postalCode}
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* Owner Card */}
                    <Card className="p-6">
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            <HiOutlineUser className="h-5 w-5" />
                            مالک ملک
                        </h3>
                        <Link to={`/users/${property.ownerId}`}>
                            <div className="cursor-pointer rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700">
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {property.ownerName}
                                </p>
                            </div>
                        </Link>
                    </Card>

                    {/* Dates Card */}
                    <Card className="p-6">
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            <HiOutlineCalendar className="h-5 w-5" />
                            تاریخ‌ها
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <p>
                                <span className="font-medium">ایجاد:</span>{' '}
                                {formatDate(property.createdAt)}
                            </p>
                            <p>
                                <span className="font-medium">
                                    آخرین بروزرسانی:
                                </span>{' '}
                                {formatDate(property.updatedAt)}
                            </p>
                        </div>
                    </Card>

                    {/* Contract Link */}
                    {property.contractId && (
                        <Card className="p-6">
                            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                قرارداد
                            </h3>
                            <Link to={`/contracts/${property.contractId}`}>
                                <Button variant="solid" className="w-full">
                                    مشاهده قرارداد
                                </Button>
                            </Link>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PropertyDetail
