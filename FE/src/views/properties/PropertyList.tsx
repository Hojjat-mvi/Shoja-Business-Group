import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Badge, Input } from '@/components/ui'
import { usePropertyStore } from '@/store/propertyStore'
import type { Property } from '@/@types/property'
import {
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineHome,
    HiOutlineLocationMarker,
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

const PropertyList = () => {
    const { properties, fetchProperties } = usePropertyStore()
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredProperties, setFilteredProperties] = useState<Property[]>(
        []
    )

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                await fetchProperties()
            } catch (error) {
                console.error('Error loading properties:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [fetchProperties])

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredProperties(properties)
        } else {
            const query = searchQuery.toLowerCase()
            const filtered = properties.filter(
                (property) =>
                    property.title.toLowerCase().includes(query) ||
                    property.address.toLowerCase().includes(query) ||
                    property.city.toLowerCase().includes(query) ||
                    property.ownerName.toLowerCase().includes(query)
            )
            setFilteredProperties(filtered)
        }
    }, [searchQuery, properties])

    const formatPrice = (price: number) => {
        const billions = price / 1000000000
        return new Intl.NumberFormat('fa-IR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(billions)
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        املاک
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        مدیریت و مشاهده املاک (
                        {new Intl.NumberFormat('fa-IR').format(
                            filteredProperties.length
                        )}{' '}
                        ملک)
                    </p>
                </div>
                <Link to="/properties/new">
                    <Button variant="solid" icon={<HiOutlinePlus />}>
                        افزودن ملک جدید
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <Card className="p-4">
                <Input
                    placeholder="جستجو بر اساس عنوان، آدرس، شهر یا مالک..."
                    prefix={<HiOutlineSearch className="text-lg" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Card>

            {/* Properties Grid */}
            {filteredProperties.length === 0 ? (
                <Card className="p-12">
                    <div className="text-center">
                        <HiOutlineHome className="mx-auto h-16 w-16 text-gray-400" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {searchQuery
                                ? 'هیچ ملکی یافت نشد'
                                : 'هنوز ملکی ثبت نشده است'}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {searchQuery
                                ? 'لطفاً عبارت جستجوی دیگری امتحان کنید'
                                : 'برای شروع، یک ملک جدید اضافه کنید'}
                        </p>
                        {!searchQuery && (
                            <Link to="/properties/new">
                                <Button
                                    className="mt-4"
                                    variant="solid"
                                    icon={<HiOutlinePlus />}
                                >
                                    افزودن ملک اول
                                </Button>
                            </Link>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProperties.map((property) => (
                        <Link
                            key={property.id}
                            to={`/properties/${property.id}`}
                        >
                            <Card className="cursor-pointer overflow-hidden transition-shadow hover:shadow-lg">
                                {/* Image */}
                                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                                    {property.images.length > 0 ? (
                                        <img
                                            src={property.images[0]}
                                            alt={property.title}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display =
                                                    'none'
                                            }}
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <HiOutlineHome className="h-16 w-16 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute left-2 top-2">
                                        <Badge
                                            className={
                                                propertyStatusColors[
                                                    property.status
                                                ]
                                            }
                                            content={
                                                propertyStatusLabels[
                                                    property.status
                                                ]
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <div className="mb-2 flex items-start justify-between">
                                        <h3 className="line-clamp-2 font-semibold text-gray-900 dark:text-gray-100">
                                            {property.title}
                                        </h3>
                                    </div>

                                    <div className="mb-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <HiOutlineLocationMarker className="h-4 w-4 flex-shrink-0" />
                                        <span className="line-clamp-1">
                                            {property.city}
                                        </span>
                                    </div>

                                    <div className="mb-3 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                        <Badge
                                            className="orange"
                                            content={
                                                propertyTypeLabels[
                                                    property.propertyType
                                                ]
                                            }
                                        />
                                        {property.area_sqm && (
                                            <span>
                                                {new Intl.NumberFormat(
                                                    'fa-IR'
                                                ).format(property.area_sqm)}{' '}
                                                متر
                                            </span>
                                        )}
                                        {property.bedrooms && (
                                            <span>
                                                {new Intl.NumberFormat(
                                                    'fa-IR'
                                                ).format(property.bedrooms)}{' '}
                                                خواب
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                قیمت
                                            </p>
                                            <p className="font-bold text-primary-600">
                                                {formatPrice(property.price)}{' '}
                                                میلیارد
                                            </p>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                مالک
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {property.ownerName}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default PropertyList
