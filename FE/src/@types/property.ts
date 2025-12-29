import type { UserRole } from '@/constants/roles.constant'

export type PropertyType =
    | 'apartment'
    | 'villa'
    | 'townhouse'
    | 'land'
    | 'commercial'
    | 'other'

export type PropertyStatus = 'available' | 'pending' | 'sold' | 'off_market'

export interface Property {
    id: string

    // Owner information
    ownerId: string
    ownerName: string
    ownerRole: UserRole

    // Property details
    title: string
    description: string
    propertyType: PropertyType
    status: PropertyStatus

    // Location
    address: string
    city: string
    province?: string
    postalCode?: string

    // Pricing
    price: number

    // Features
    bedrooms?: number
    bathrooms?: number
    parkingSpaces?: number
    area_sqm?: number
    yearBuilt?: number

    // Media
    images: string[]
    virtualTourUrl?: string

    // Timestamps
    createdAt: string
    updatedAt: string

    // Contract reference (if sold)
    contractId?: string
}

export interface PropertyWithOwnerHierarchy extends Property {
    ownerManagerId?: string
    ownerManagerName?: string
    canEdit: boolean
    canView: boolean
}

export interface PropertyStatistics {
    totalProperties: number
    availableProperties: number
    pendingProperties: number
    soldProperties: number
    totalValue: number
    averagePrice: number
    byType: {
        [key in PropertyType]?: number
    }
    byOwner: {
        [ownerId: string]: {
            ownerName: string
            count: number
            totalValue: number
        }
    }
}
