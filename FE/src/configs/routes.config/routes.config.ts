import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'
import {
    SUPER_ADMIN,
    EDUCATION_MANAGER,
    SALES_MANAGER,
    AGENT,
} from '@/constants/roles.constant'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    // Dashboard - Role-based
    {
        key: 'dashboard',
        path: '/home',
        component: lazy(() => import('@/views/RoleDashboard')),
        authority: [],
    },
    // Users Management
    {
        key: 'users.list',
        path: '/users',
        component: lazy(() => import('@/views/users/UserList')),
        authority: [SUPER_ADMIN, EDUCATION_MANAGER, SALES_MANAGER],
    },
    {
        key: 'users.new',
        path: '/users/new',
        component: lazy(() => import('@/views/users/UserForm')),
        authority: [SUPER_ADMIN, EDUCATION_MANAGER, SALES_MANAGER],
    },
    {
        key: 'users.edit',
        path: '/users/edit/:id',
        component: lazy(() => import('@/views/users/UserForm')),
        authority: [SUPER_ADMIN, EDUCATION_MANAGER, SALES_MANAGER],
    },
    {
        key: 'users.detail',
        path: '/users/:id',
        component: lazy(() => import('@/views/users/UserDetail')),
        authority: [SUPER_ADMIN, EDUCATION_MANAGER, SALES_MANAGER],
    },
    {
        key: 'users.pendingApprovals',
        path: '/users/pending-approvals',
        component: lazy(() => import('@/views/users/PendingApprovals')),
        authority: [SUPER_ADMIN],
    },
    // Properties Management
    {
        key: 'properties',
        path: '/properties',
        component: lazy(() => import('@/views/properties/PropertyList')),
        authority: [],
    },
    {
        key: 'properties.new',
        path: '/properties/new',
        component: lazy(() => import('@/views/properties/PropertyForm')),
        authority: [],
    },
    {
        key: 'properties.edit',
        path: '/properties/edit/:id',
        component: lazy(() => import('@/views/properties/PropertyForm')),
        authority: [],
    },
    {
        key: 'properties.detail',
        path: '/properties/:id',
        component: lazy(() => import('@/views/properties/PropertyDetail')),
        authority: [],
    },
    // Contracts Management
    {
        key: 'contracts.list',
        path: '/contracts',
        component: lazy(() => import('@/views/contracts/ContractList')),
        authority: [],
    },
    {
        key: 'contracts.upload',
        path: '/contracts/upload',
        component: lazy(() => import('@/views/contracts/ContractForm')),
        authority: [],
    },
    {
        key: 'contracts.detail',
        path: '/contracts/:id',
        component: lazy(() => import('@/views/contracts/ContractDetail')),
        authority: [],
    },
    {
        key: 'contracts.pendingApprovals',
        path: '/contracts/pending',
        component: lazy(() => import('@/views/contracts/PendingApprovals')),
        authority: [SUPER_ADMIN],
    },
    {
        key: 'contracts.commissions',
        path: '/contracts/commissions',
        component: lazy(() => import('@/views/contracts/CommissionSummary')),
        authority: [],
    },
    {
        key: 'contracts.edit',
        path: '/contracts/edit/:id',
        component: lazy(() => import('@/views/contracts/ContractForm')),
        authority: [SUPER_ADMIN],
    },
    // Profile
    {
        key: 'profile',
        path: '/profile',
        component: lazy(() => import('@/views/profile/UserProfile')),
        authority: [],
    },
    // API Test
    {
        key: 'apiTest',
        path: '/test-apis',
        component: lazy(() => import('@/views/ApiTest')),
        authority: [],
    },
    ...othersRoute,
]
