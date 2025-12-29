import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE
} from '@/constants/navigation.constant'
import { SUPER_ADMIN, EDUCATION_MANAGER, SALES_MANAGER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    {
        key: 'dashboard',
        path: '/home',
        title: 'داشبورد',
        translateKey: 'nav.dashboard',
        icon: 'home',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'users',
        path: '',
        title: 'مدیریت کاربران',
        translateKey: 'nav.users.users',
        icon: 'users',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [SUPER_ADMIN, EDUCATION_MANAGER, SALES_MANAGER],
        subMenu: [
            {
                key: 'users.list',
                path: '/users',
                title: 'لیست کاربران',
                translateKey: 'nav.users.list',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [SUPER_ADMIN, EDUCATION_MANAGER, SALES_MANAGER],
                subMenu: [],
            },
            {
                key: 'users.pendingApprovals',
                path: '/users/pending-approvals',
                title: 'تاییدیه‌های در انتظار',
                translateKey: 'nav.users.pendingApprovals',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [SUPER_ADMIN],
                subMenu: [],
            },
        ],
    },
    {
        key: 'properties',
        path: '/properties',
        title: 'املاک',
        translateKey: 'nav.properties',
        icon: 'building',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'contracts',
        path: '',
        title: 'قراردادها',
        translateKey: 'nav.contracts',
        icon: 'document',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [],
        subMenu: [
            {
                key: 'contracts.list',
                path: '/contracts',
                title: 'لیست قراردادها',
                translateKey: 'nav.contracts.list',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'contracts.pendingApprovals',
                path: '/contracts/pending',
                title: 'تاییدیه‌های در انتظار',
                translateKey: 'nav.contracts.pendingApprovals',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [SUPER_ADMIN],
                subMenu: [],
            },
            {
                key: 'contracts.commissions',
                path: '/contracts/commissions',
                title: 'خلاصه کمیسیون‌ها',
                translateKey: 'nav.contracts.commissions',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
        ],
    },
]

export default navigationConfig
