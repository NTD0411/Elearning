import { MentorPackage } from '@/types/package';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5074/api';

export interface CreatePaymentRequest {
    packageId: number;
}

export interface PaymentResponse {
    checkoutUrl: string;
}

export interface Transaction {
    transactionId: number;
    userId: number;
    packageId: number;
    amount: number;
    status: string;
    createdAt: string;
    paymentId?: string;
    paymentMethod?: string;
    transactionReference?: string;
    package?: MentorPackage;
}

export async function getPackages(): Promise<MentorPackage[]> {
    const res = await fetch(`${API_URL}/package`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Không thể tải danh sách gói');
    return res.json();
}

export async function createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    const res = await fetch(`${API_URL}/payment/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Không thể tạo giao dịch');
    }

    return res.json();
}

export async function getTransactions(): Promise<Transaction[]> {
    const res = await fetch(`${API_URL}/payment/transactions`, {
        credentials: 'include'
    });

    if (!res.ok) {
        throw new Error('Không thể tải lịch sử giao dịch');
    }

    return res.json();
}