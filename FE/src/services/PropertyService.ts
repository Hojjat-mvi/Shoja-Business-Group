import ApiService from './ApiService'
import type {
    Property,
    PropertyStatus,
    PropertyType,
    PropertyStatistics,
} from '@/@types/property'

export interface PropertyFilters {
    status?: PropertyStatus
    propertyType?: PropertyType
    ownerId?: string
    minPrice?: number
    maxPrice?: number
    city?: string
}

// Get all properties with optional filters
export async function apiGetProperties(filters?: PropertyFilters) {
    return ApiService.fetchDataWithAxios<{ data: Property[] }>({
        url: '/api/properties',
        method: 'get',
        params: filters,
    })
}

// Get single property by ID
export async function apiGetPropertyById(propertyId: string) {
    return ApiService.fetchDataWithAxios<{ data: Property }>({
        url: `/api/properties/${propertyId}`,
        method: 'get',
    })
}

// Get current user's properties
export async function apiGetMyProperties(userId: string) {
    return ApiService.fetchDataWithAxios<{ data: Property[] }>({
        url: '/api/properties/my-properties',
        method: 'get',
        params: { userId },
    })
}

// Get team properties (for managers)
export async function apiGetTeamProperties(
    userId: string,
    subordinateIds: string[]
) {
    return ApiService.fetchDataWithAxios<{ data: Property[] }>({
        url: '/api/properties/team-properties',
        method: 'get',
        params: {
            userId,
            subordinateIds: subordinateIds.join(','),
        },
    })
}

// Create new property
export async function apiCreateProperty(propertyData: Partial<Property>) {
    return ApiService.fetchDataWithAxios<{ data: Property; message: string }>({
        url: '/api/properties',
        method: 'post',
        data: propertyData,
    })
}

// Update property
export async function apiUpdateProperty(
    propertyId: string,
    updates: Partial<Property>
) {
    return ApiService.fetchDataWithAxios<{ data: Property; message: string }>({
        url: `/api/properties/${propertyId}`,
        method: 'put',
        data: updates,
    })
}

// Delete property (owner or Super Admin)
export async function apiDeleteProperty(propertyId: string) {
    return ApiService.fetchDataWithAxios<{ message: string }>({
        url: `/api/properties/${propertyId}`,
        method: 'delete',
    })
}

// Get property statistics
export async function apiGetPropertyStatistics(userId?: string) {
    return ApiService.fetchDataWithAxios<{ data: PropertyStatistics }>({
        url: '/api/properties/statistics',
        method: 'get',
        params: userId ? { userId } : undefined,
    })
}
