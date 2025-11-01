"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [packageId, setPackageId] = useState<number | null>(null);

    useEffect(() => {
        // Lấy packageId từ query params
        if (searchParams) {
            const pkgId = searchParams.get('packageId');
            if (pkgId) {
                setPackageId(parseInt(pkgId, 10));
            }
        }
        toast.success('Thanh toán thành công!');
    }, [searchParams]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-lg w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Thanh toán thành công!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">
                        Cảm ơn bạn đã đăng ký thành công gói mentor hỗ trợ.
                    </p>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => router.push('/packages')}
                            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
                        >
                            Đi đến Packages
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