"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function PaymentCancelPage() {
    const router = useRouter();

    useEffect(() => {
        toast.error('Thanh toán đã bị hủy');
        const timer = setTimeout(() => {
            router.push('/payment/history');
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-lg w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Thanh toán đã bị hủy</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">
                        Bạn sẽ được chuyển đến trang lịch sử thanh toán trong vài giây...
                    </p>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => router.push('/payment/history')}
                            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
                        >
                            Đi đến Lịch sử thanh toán
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="text-gray-600 dark:text-gray-300 hover:underline"
                        >
                            Quay lại trang trước
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}