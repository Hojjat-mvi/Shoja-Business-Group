import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Property, PropertyStatus, PropertyType } from '@/@types/property'
import {
    apiGetProperties,
    apiGetMyProperties,
    apiGetTeamProperties,
    apiCreateProperty,
    apiUpdateProperty,
    apiDeleteProperty,
    type PropertyFilters,
} from '@/services/PropertyService'

type PropertyState = {
    properties: Property[]
    myProperties: Property[]
    teamProperties: Property[]
    selectedProperty: Property | null
    filters: PropertyFilters
    lastFetch: number | null
}

type PropertyAction = {
    setProperties: (properties: Property[]) => void
    setMyProperties: (properties: Property[]) => void
    setTeamProperties: (properties: Property[]) => void
    addProperty: (property: Property) => void
    updateProperty: (propertyId: string, updates: Partial<Property>) => void
    setSelectedProperty: (property: Property | null) => void
    setFilters: (filters: PropertyFilters) => void
    clearFilters: () => void
    clearPropertyData: () => void

    // API methods
    fetchProperties: (filters?: PropertyFilters) => Promise<void>
    fetchMyProperties: (userId: string) => Promise<void>
    fetchTeamProperties: (userId: string, subordinateIds: string[]) => Promise<void>
    createProperty: (propertyData: Partial<Property>) => Promise<void>
    deleteProperty: (propertyId: string) => Promise<void>
    updatePropertyAction: (propertyId: string, updates: Partial<Property>) => Promise<void>
}

const initialState: PropertyState = {
    properties: [],
    myProperties: [],
    teamProperties: [],
    selectedProperty: null,
    filters: {},
    lastFetch: null,
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const usePropertyStore = create<PropertyState & PropertyAction>()(
    persist(
        (set, get) => ({
            ...initialState,

            setProperties: (properties) =>
                set(() => ({
                    properties,
                    lastFetch: Date.now(),
                })),

            setMyProperties: (properties) =>
                set(() => ({
                    myProperties: properties,
                })),

            setTeamProperties: (properties) =>
                set(() => ({
                    teamProperties: properties,
                })),

            addProperty: (property) =>
                set((state) => ({
                    properties: [...state.properties, property],
                    myProperties: [...state.myProperties, property],
                })),

            updateProperty: (propertyId, updates) =>
                set((state) => ({
                    properties: state.properties.map((property) =>
                        property.id === propertyId
                            ? { ...property, ...updates }
                            : property
                    ),
                    myProperties: state.myProperties.map((property) =>
                        property.id === propertyId
                            ? { ...property, ...updates }
                            : property
                    ),
                    teamProperties: state.teamProperties.map((property) =>
                        property.id === propertyId
                            ? { ...property, ...updates }
                            : property
                    ),
                    selectedProperty:
                        state.selectedProperty?.id === propertyId
                            ? { ...state.selectedProperty, ...updates }
                            : state.selectedProperty,
                })),

            setSelectedProperty: (property) =>
                set(() => ({
                    selectedProperty: property,
                })),

            setFilters: (filters) =>
                set((state) => ({
                    filters: { ...state.filters, ...filters },
                })),

            clearFilters: () =>
                set(() => ({
                    filters: {},
                })),

            clearPropertyData: () => set(initialState),

            // API methods
            fetchProperties: async (filters?: PropertyFilters) => {
                const state = get()
                const now = Date.now()

                // Use cached data if it's fresh enough
                if (state.lastFetch && now - state.lastFetch < CACHE_DURATION && state.properties.length > 0) {
                    return
                }

                const response = await apiGetProperties(filters)
                if (response.data) {
                    set({ properties: response.data, lastFetch: now })
                }
            },

            fetchMyProperties: async (userId: string) => {
                const response = await apiGetMyProperties(userId)
                if (response.data) {
                    set({ myProperties: response.data })
                }
            },

            fetchTeamProperties: async (userId: string, subordinateIds: string[]) => {
                const response = await apiGetTeamProperties(userId, subordinateIds)
                if (response.data) {
                    set({ teamProperties: response.data })
                }
            },

            createProperty: async (propertyData: Partial<Property>) => {
                const response = await apiCreateProperty(propertyData)
                if (response.data) {
                    set((state) => ({
                        properties: [...state.properties, response.data],
                        myProperties: [...state.myProperties, response.data],
                    }))
                }
            },

            deleteProperty: async (propertyId: string) => {
                await apiDeleteProperty(propertyId)
                set((state) => ({
                    properties: state.properties.filter((p) => p.id !== propertyId),
                    myProperties: state.myProperties.filter(
                        (p) => p.id !== propertyId
                    ),
                    teamProperties: state.teamProperties.filter(
                        (p) => p.id !== propertyId
                    ),
                    selectedProperty:
                        state.selectedProperty?.id === propertyId
                            ? null
                            : state.selectedProperty,
                }))
            },

            updatePropertyAction: async (
                propertyId: string,
                updates: Partial<Property>
            ) => {
                const response = await apiUpdateProperty(propertyId, updates)
                if (response.data) {
                    set((state) => ({
                        properties: state.properties.map((p) =>
                            p.id === propertyId ? response.data : p
                        ),
                        myProperties: state.myProperties.map((p) =>
                            p.id === propertyId ? response.data : p
                        ),
                        teamProperties: state.teamProperties.map((p) =>
                            p.id === propertyId ? response.data : p
                        ),
                    }))
                }
            },
        }),
        {
            name: 'property-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)
