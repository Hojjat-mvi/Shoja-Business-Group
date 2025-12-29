import { useSessionUser } from '@/store/authStore'
import {
    SuperAdminDashboard,
    EducationManagerDashboard,
    SalesManagerDashboard,
    AgentDashboard,
} from './dashboards'
import {
    SUPER_ADMIN,
    EDUCATION_MANAGER,
    SALES_MANAGER,
    AGENT,
} from '@/constants/roles.constant'

/**
 * Role-based dashboard router
 * Displays the appropriate dashboard based on user's role
 */
const RoleDashboard = () => {
    const currentUser = useSessionUser((state) => state.user)

    switch (currentUser.role) {
        case SUPER_ADMIN:
            return <SuperAdminDashboard />
        case EDUCATION_MANAGER:
            return <EducationManagerDashboard />
        case SALES_MANAGER:
            return <SalesManagerDashboard />
        case AGENT:
            return <AgentDashboard />
        default:
            return <AgentDashboard />
    }
}

export default RoleDashboard
