import { Card, Badge } from '@/components/ui'
import type { Property, PropertyStatus, PropertyType } from '@/@types/property'
import { HiOutlineLocationMarker, HiOutlineHome } from 'react-icons/hi'
import classNames from 'classnames'

export interface PropertyCardProps {
    property: Property
    onClick?: () => void
    showOwner?: boolean
    className?: string
}

const propertyStatusLabels: Record<PropertyStatus, string> = {
    available: 'موجود',
    sold: 'فروخته شده',
    pending: 'در انتظار',
    off_market: 'خارج از بازار',
}

const propertyStatusColors: Record<
    PropertyStatus,
    'success' | 'danger' | 'warning' | 'blue'
> = {
    available: 'success',
    sold: 'danger',
    pending: 'warning',
    off_market: 'blue',
}

const propertyTypeLabels: Record<PropertyType, string> = {
    apartment: 'آپارتمان',
    villa: 'ویلا',
    townhouse: 'تاون‌هاوس',
    land: 'زمین',
    commercial: 'تجاری',
    other: 'سایر',
}

const PropertyCard = ({
    property,
    onClick,
    showOwner = false,
    className,
}: PropertyCardProps) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
    }

    return (
        <Card
            className={classNames(
                'cursor-pointer overflow-hidden transition-shadow hover:shadow-lg',
                className
            )}
            onClick={onClick}
        >
            {/* Property Image */}
            {property.images && property.images.length > 0 ? (
                <div className="relative h-48 w-full overflow-hidden">
                    <img
                        src={property.images[0]}
                        alt={property.title}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute left-2 top-2">
                        <Badge
                            className={propertyStatusColors[property.status]}
                        >
                            {propertyStatusLabels[property.status]}
                        </Badge>
                    </div>
                </div>
            ) : (
                <div className="relative flex h-48 w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <HiOutlineHome className="h-16 w-16 text-gray-400" />
                    <div className="absolute left-2 top-2">
                        <Badge
                            className={propertyStatusColors[property.status]}
                        >
                            {propertyStatusLabels[property.status]}
                        </Badge>
                    </div>
                </div>
            )}

            {/* Property Details */}
            <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {property.title}
                    </h3>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                        {propertyTypeLabels[property.propertyType]}
                    </Badge>
                </div>

                {property.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {property.description}
                    </p>
                )}

                <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <HiOutlineLocationMarker className="h-4 w-4" />
                    <span>
                        {property.city}
                        {property.address && `, ${property.address}`}
                    </span>
                </div>

                <div className="mb-3 flex items-center gap-4 text-sm">
                    {property.area_sqm && (
                        <div className="flex items-center gap-1">
                            <span className="text-gray-600 dark:text-gray-400">
                                متراژ:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {new Intl.NumberFormat('fa-IR').format(
                                    property.area_sqm
                                )}{' '}
                                متر
                            </span>
                        </div>
                    )}
                    {property.bedrooms && (
                        <div className="flex items-center gap-1">
                            <span className="text-gray-600 dark:text-gray-400">
                                خواب:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {new Intl.NumberFormat('fa-IR').format(
                                    property.bedrooms
                                )}
                            </span>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                قیمت
                            </p>
                            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                {formatPrice(property.price)}
                            </p>
                        </div>
                        {showOwner && property.ownerName && (
                            <div className="text-left">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    مالک
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {property.ownerName}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default PropertyCard
