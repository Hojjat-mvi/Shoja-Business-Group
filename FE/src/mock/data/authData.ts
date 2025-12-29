import { usersData } from './userData'
import {
    SUPER_ADMIN,
    EDUCATION_MANAGER,
    SALES_MANAGER,
    AGENT,
} from '@/constants/roles.constant'

// Create sign-in accounts for testing with hierarchical user data
export const signInUserData = [
    // Super Admin
    {
        id: 'user-1',
        avatar: '/img/avatars/avatar-1.jpg',
        userName: 'محمد رضایی',
        email: 'admin@shojabg.com',
        authority: [SUPER_ADMIN],
        password: '123456',
        role: SUPER_ADMIN,
        managerId: null,
        managerName: undefined,
        phone: '09121234567',
        status: 'active',
    },
    // Education Manager 1
    {
        id: 'user-2',
        avatar: '/img/avatars/avatar-2.jpg',
        userName: 'فاطمه احمدی',
        email: 'em1@shojabg.com',
        authority: [EDUCATION_MANAGER],
        password: '123456',
        role: EDUCATION_MANAGER,
        managerId: 'user-1',
        managerName: 'محمد رضایی',
        phone: '09121234568',
        status: 'active',
    },
    // Education Manager 2
    {
        id: 'user-3',
        avatar: '/img/avatars/avatar-3.jpg',
        userName: 'علی کریمی',
        email: 'em2@shojabg.com',
        authority: [EDUCATION_MANAGER],
        password: '123456',
        role: EDUCATION_MANAGER,
        managerId: 'user-1',
        managerName: 'محمد رضایی',
        phone: '09121234569',
        status: 'active',
    },
    // Sales Manager 1
    {
        id: 'user-4',
        avatar: '/img/avatars/avatar-4.jpg',
        userName: 'زهرا محمدی',
        email: 'sm1@shojabg.com',
        authority: [SALES_MANAGER],
        password: '123456',
        role: SALES_MANAGER,
        managerId: 'user-2',
        managerName: 'فاطمه احمدی',
        phone: '09121234570',
        status: 'active',
    },
    // Agent 1
    {
        id: 'user-8',
        avatar: '/img/avatars/avatar-8.jpg',
        userName: 'سارا جعفری',
        email: 'agent1@shojabg.com',
        authority: [AGENT],
        password: '123456',
        role: AGENT,
        managerId: 'user-4',
        managerName: 'زهرا محمدی',
        phone: '09121234574',
        status: 'active',
    },
]

export { usersData }
