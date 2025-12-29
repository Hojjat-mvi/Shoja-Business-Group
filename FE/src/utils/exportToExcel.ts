import * as XLSX from 'xlsx'
import type { Contract } from '@/@types/contract'

const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
        pending: 'در انتظار',
        approved: 'تایید شده',
        rejected: 'رد شده',
        paid: 'پرداخت شده',
    }
    return labels[status] || status
}

export function exportContractsToExcel(
    contracts: Contract[],
    filename = 'contracts.xlsx'
) {
    const data = contracts.map((c) => ({
        'شماره قرارداد': c.id,
        کارشناس: c.agentName,
        نقش: c.agentRole,
        مشتری: c.customerName,
        'تلفن مشتری': c.customerPhone || '',
        فروشنده: c.sellerName,
        'تلفن فروشنده': c.sellerPhone || '',
        'مبلغ (تومان)': c.finalPrice,
        'تاریخ قرارداد': new Date(c.contractDate).toLocaleDateString(
            'fa-IR'
        ),
        وضعیت: getStatusLabel(c.status),
        'بررسی شده توسط': c.reviewedByName || '',
        یادداشت: c.reviewNotes || '',
        'تاریخ پرداخت': c.paidAt
            ? new Date(c.paidAt).toLocaleDateString('fa-IR')
            : '',
        'شماره مرجع': c.paymentReference || '',
        'کمیسیون (تومان)': c.commissionAmount || 0,
        'یادداشت کمیسیون': c.commissionNotes || '',
        'کمیسیون ثبت شده توسط': c.commissionEnteredByName || '',
    }))

    const ws = XLSX.utils.json_to_sheet(data)

    // Set column widths
    ws['!cols'] = [
        { wch: 15 }, // شماره قرارداد
        { wch: 20 }, // کارشناس
        { wch: 15 }, // نقش
        { wch: 20 }, // مشتری
        { wch: 15 }, // تلفن مشتری
        { wch: 20 }, // فروشنده
        { wch: 15 }, // تلفن فروشنده
        { wch: 20 }, // مبلغ
        { wch: 15 }, // تاریخ قرارداد
        { wch: 12 }, // وضعیت
        { wch: 20 }, // بررسی شده توسط
        { wch: 30 }, // یادداشت
        { wch: 15 }, // تاریخ پرداخت
        { wch: 15 }, // شماره مرجع
        { wch: 20 }, // کمیسیون
        { wch: 30 }, // یادداشت کمیسیون
        { wch: 20 }, // کمیسیون ثبت شده توسط
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'قراردادها')
    XLSX.writeFile(wb, filename)
}

export interface CommissionData {
    agentId: string
    agentName: string
    agentRole: string
    contractCount: number
    totalSales: number
    totalCommission: number
    paidCommission: number
    pendingCommission: number
    contracts: {
        id: string
        finalPrice: number
        commission: number
        status: string
        contractDate: string
    }[]
}

export function exportCommissionsToExcel(
    commissionData: CommissionData[],
    filename = 'commissions.xlsx'
) {
    // Summary sheet
    const summaryData = commissionData.map((d) => ({
        کارشناس: d.agentName,
        نقش: d.agentRole,
        'تعداد قرارداد': d.contractCount,
        'مجموع فروش (تومان)': d.totalSales,
        'کل کمیسیون (تومان)': d.totalCommission,
        'پرداخت شده (تومان)': d.paidCommission,
        'در انتظار (تومان)': d.pendingCommission,
    }))

    // Detail sheet
    const detailData: any[] = []
    commissionData.forEach((agent) => {
        agent.contracts.forEach((c) => {
            detailData.push({
                کارشناس: agent.agentName,
                'شماره قرارداد': c.id,
                'مبلغ (تومان)': c.finalPrice,
                'کمیسیون (تومان)': c.commission,
                وضعیت: getStatusLabel(c.status),
                تاریخ: new Date(c.contractDate).toLocaleDateString('fa-IR'),
            })
        })
    })

    const wb = XLSX.utils.book_new()

    // Add summary sheet
    const wsSummary = XLSX.utils.json_to_sheet(summaryData)
    wsSummary['!cols'] = [
        { wch: 20 }, // کارشناس
        { wch: 15 }, // نقش
        { wch: 12 }, // تعداد
        { wch: 20 }, // مجموع فروش
        { wch: 20 }, // کل کمیسیون
        { wch: 20 }, // پرداخت شده
        { wch: 20 }, // در انتظار
    ]
    XLSX.utils.book_append_sheet(wb, wsSummary, 'خلاصه')

    // Add detail sheet
    const wsDetail = XLSX.utils.json_to_sheet(detailData)
    wsDetail['!cols'] = [
        { wch: 20 }, // کارشناس
        { wch: 15 }, // شماره قرارداد
        { wch: 20 }, // مبلغ
        { wch: 20 }, // کمیسیون
        { wch: 12 }, // وضعیت
        { wch: 15 }, // تاریخ
    ]
    XLSX.utils.book_append_sheet(wb, wsDetail, 'جزئیات')

    XLSX.writeFile(wb, filename)
}
