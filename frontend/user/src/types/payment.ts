export interface Package {
    packageId: number;
    name: string;
    description: string;
    price: number;
    durationMonths: number;
    createdAt: string;
    createdBy?: {
        id: number;
        name: string;
        avatar: string;
    };
}

export interface CreatePaymentRequest {
    packageId: number;
}

export interface PaymentResponse {
    checkoutUrl: string;
}

export interface Transaction {
    transactionId: number;
    userId?: number;
    packageId?: number;
    orderCode: number;
    amount: number;
    status: string;
    createdAt: string;
    package?: PackageInfo;
}

export interface PackageInfo {
    packageId: number;
    name: string;
    description?: string;
    price: number;
    durationMonths: number;
}

export const TransactionStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED'
} as const;

export type TransactionStatusType = typeof TransactionStatus[keyof typeof TransactionStatus];