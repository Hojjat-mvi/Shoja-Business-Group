import { mock } from '../MockAdapter'
import { propertiesData } from '../data/propertyData'
import type { Property } from '@/@types/property'

// In-memory copy for CRUD operations
let properties = [...propertiesData]

// GET /api/properties - Get all properties (filtered by permissions)
mock.onGet(/\/api\/properties$/).reply((config) => {
    const { status, propertyType, ownerId } = config.params || {}

    let filtered = [...properties]

    if (status) {
        filtered = filtered.filter((p) => p.status === status)
    }

    if (propertyType) {
        filtered = filtered.filter((p) => p.propertyType === propertyType)
    }

    if (ownerId) {
        filtered = filtered.filter((p) => p.ownerId === ownerId)
    }

    return [200, { data: filtered }]
})

// GET /api/properties/:id - Get single property
mock.onGet(/\/api\/properties\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop()
    const property = properties.find((p) => p.id === id)

    if (property) {
        return [200, { data: property }]
    }
    return [404, { message: 'Property not found' }]
})

// GET /api/properties/my-properties?userId=xxx - Get current user's properties
mock.onGet('/api/properties/my-properties').reply((config) => {
    const userId = config.params?.userId

    const userProperties = properties.filter((p) => p.ownerId === userId)

    return [200, { data: userProperties }]
})

// GET /api/properties/team-properties?userId=xxx - Get subordinates' properties (managers)
mock.onGet('/api/properties/team-properties').reply((config) => {
    const managerId = config.params?.userId
    const subordinateIds = config.params?.subordinateIds?.split(',') || []

    const teamProperties = properties.filter((p) =>
        subordinateIds.includes(p.ownerId)
    )

    return [200, { data: teamProperties }]
})

// POST /api/properties - Create new property
mock.onPost('/api/properties').reply((config) => {
    const newProperty = JSON.parse(config.data) as Omit<Property, 'id'>

    const id = `property-${properties.length + 1}`

    const propertyToCreate: Property = {
        ...newProperty,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    properties.push(propertyToCreate)

    return [
        201,
        { data: propertyToCreate, message: 'Property created successfully' },
    ]
})

// PUT /api/properties/:id - Update property
mock.onPut(/\/api\/properties\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop()
    const updates = JSON.parse(config.data)

    const index = properties.findIndex((p) => p.id === id)

    if (index !== -1) {
        properties[index] = {
            ...properties[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        }

        return [200, { data: properties[index], message: 'Property updated' }]
    }

    return [404, { message: 'Property not found' }]
})

// DELETE /api/properties/:id - Delete property (owner or Super Admin)
mock.onDelete(/\/api\/properties\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop()

    const index = properties.findIndex((p) => p.id === id)

    if (index !== -1) {
        properties.splice(index, 1)
        return [200, { message: 'Property deleted' }]
    }

    return [404, { message: 'Property not found' }]
})

// GET /api/properties/statistics - Get property statistics
mock.onGet('/api/properties/statistics').reply((config) => {
    const userId = config.params?.userId

    let filtered = properties
    if (userId) {
        filtered = properties.filter((p) => p.ownerId === userId)
    }

    const stats = {
        totalProperties: filtered.length,
        availableProperties: filtered.filter((p) => p.status === 'available')
            .length,
        pendingProperties: filtered.filter((p) => p.status === 'pending').length,
        soldProperties: filtered.filter((p) => p.status === 'sold').length,
        totalValue: filtered.reduce((sum, p) => sum + p.price, 0),
        averagePrice:
            filtered.length > 0
                ? filtered.reduce((sum, p) => sum + p.price, 0) / filtered.length
                : 0,
        byType: {
            apartment: filtered.filter((p) => p.propertyType === 'apartment')
                .length,
            villa: filtered.filter((p) => p.propertyType === 'villa').length,
            townhouse: filtered.filter((p) => p.propertyType === 'townhouse')
                .length,
            land: filtered.filter((p) => p.propertyType === 'land').length,
            commercial: filtered.filter((p) => p.propertyType === 'commercial')
                .length,
            other: filtered.filter((p) => p.propertyType === 'other').length,
        },
    }

    return [200, { data: stats }]
})
