import { Card } from '@/components/ui'
import classNames from 'classnames'
import type { ReactNode } from 'react'

export interface StatCardProps {
    title: string
    value: string | number
    icon?: ReactNode
    iconClass?: string
    trend?: {
        value: number
        isPositive: boolean
    }
    className?: string
}

const StatCard = ({
    title,
    value,
    icon,
    iconClass,
    trend,
    className,
}: StatCardProps) => {
    return (
        <Card className={classNames('p-4', className)}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {title}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {value}
                    </h3>
                    {trend && (
                        <div className="mt-2 flex items-center gap-1">
                            <span
                                className={classNames(
                                    'text-sm font-medium',
                                    trend.isPositive
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                )}
                            >
                                {trend.isPositive ? '+' : ''}
                                {trend.value}%
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                نسبت به ماه قبل
                            </span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div
                        className={classNames(
                            'flex h-12 w-12 items-center justify-center rounded-lg',
                            iconClass ||
                                'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400'
                        )}
                    >
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    )
}

export default StatCard
