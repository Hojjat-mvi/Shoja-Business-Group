import { Badge } from '@/components/ui'
import type { ContractStatus } from '@/@types/contract'
import classNames from 'classnames'

export interface ContractStatusBadgeProps {
    status: ContractStatus
    className?: string
}

const contractStatusLabels: Record<ContractStatus, string> = {
    pending: 'در انتظار بررسی',
    approved: 'تایید شده',
    rejected: 'رد شده',
    paid: 'پرداخت شده',
}

const contractStatusColors: Record<ContractStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    paid: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
}

const ContractStatusBadge = ({
    status,
    className,
}: ContractStatusBadgeProps) => {
    return (
        <Badge
            className={classNames(
                contractStatusColors[status],
                'font-medium',
                className
            )}
        >
            {contractStatusLabels[status]}
        </Badge>
    )
}

export default ContractStatusBadge
