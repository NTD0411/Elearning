import { getSession } from 'next-auth/react';
import { Transaction } from '@/types/payment';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5074';
const API_BASE = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

export interface CreatePaymentRequest {
    packageId: number;
}

export interface PaymentResponse {
    checkoutUrl: string;
}

export const paymentService = {
    async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
        const session = await getSession();
        const token = session?.accessToken as string | undefined;
        const res = await fetch(`${API_BASE}/payment/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || 'Không thể tạo giao dịch');
        }

        return res.json();
    },

    async getTransactions(): Promise<Transaction[]> {
        const session = await getSession();
        const token = session?.accessToken as string | undefined;
        const res = await fetch(`${API_BASE}/payment/transactions`, {
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || 'Không thể tải lịch sử giao dịch');
        }

        return res.json();
    }
};