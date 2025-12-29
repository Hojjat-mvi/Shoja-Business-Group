import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthority from '@/utils/hooks/useAuthority'
import { useSessionUser } from '@/store/authStore'
import { getRoleLevel } from '@/constants/roles.constant'

type AuthorityGuardProps = PropsWithChildren<{
    userAuthority?: string[]
    authority?: string[]
    requireAll?: boolean // Require all authorities instead of any
    minRoleLevel?: number // Minimum role level required (1-4)
}>

const AuthorityGuard = (props: AuthorityGuardProps) => {
    const {
        userAuthority = [],
        authority = [],
        requireAll = false,
        minRoleLevel,
        children,
    } = props

    const currentUser = useSessionUser((state) => state.user)

    // Use legacy authority check (backward compatibility)
    const legacyRoleMatched = useAuthority(userAuthority, authority)

    // New hierarchical role check
    let hierarchicalRoleMatched = true

    // Check minimum role level if specified
    if (minRoleLevel !== undefined && currentUser.role) {
        const userRoleLevel = getRoleLevel(currentUser.role)
        hierarchicalRoleMatched = userRoleLevel >= minRoleLevel
    }

    // Check new role system
    if (authority.length > 0 && currentUser.role) {
        if (requireAll) {
            // User must have all specified authorities
            hierarchicalRoleMatched =
                hierarchicalRoleMatched &&
                authority.every((role) =>
                    [...(currentUser.authority || []), currentUser.role].includes(
                        role
                    )
                )
        } else {
            // User must have at least one authority (default behavior)
            hierarchicalRoleMatched =
                hierarchicalRoleMatched &&
                authority.some((role) =>
                    [...(currentUser.authority || []), currentUser.role].includes(
                        role
                    )
                )
        }
    }

    // Combine both checks: pass if either legacy OR new role system matches
    const roleMatched = legacyRoleMatched || hierarchicalRoleMatched

    return <>{roleMatched ? children : <Navigate to="/access-denied" />}</>
}

export default AuthorityGuard
