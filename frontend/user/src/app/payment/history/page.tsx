'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { paymentService } from '@/services/paymentService';
import { Transaction, TransactionStatus } from '@/types/payment';
import { formatCurrency } from '@/utils/format';

export default function PaymentHistoryPage() {
    const { data: session, status } = useSession();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    useEffect(() => {
        const fetchTransactions = async () => {
            if (status === 'loading') {
                return;
            }

            if (status === 'unauthenticated') {
                setError('Please login to view payment history');
                setLoading(false);
                return;
            }

            try {
                const data = await paymentService.getTransactions();
                setTransactions(data);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err instanceof Error ? err.message : 'Unable to load payment history');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [session, status]);

    const filteredTransactions = transactions.filter(transaction => {
        if (selectedStatus === 'all') return true;
        return transaction.status?.toUpperCase() === selectedStatus.toUpperCase();
    });

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case TransactionStatus.COMPLETED:
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case TransactionStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case TransactionStatus.FAILED:
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case TransactionStatus.CANCELLED:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getStatusText = (status: string) => {
        switch (status?.toUpperCase()) {
            case TransactionStatus.COMPLETED:
                return 'Completed';
            case TransactionStatus.PENDING:
                return 'Processing';
            case TransactionStatus.FAILED:
                return 'Failed';
            case TransactionStatus.CANCELLED:
                return 'Cancelled';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading payment history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Error</h2>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Payment History</h1>
                <p className="text-gray-600 dark:text-gray-400">View all your payment transactions</p>
            </div>

            {/* Filter */}
            <div className="mb-6">
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setSelectedStatus('all')}
                        className={`px-4 py-2 rounded-md transition-colors ${
                            selectedStatus === 'all'
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setSelectedStatus(TransactionStatus.COMPLETED)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                            selectedStatus === TransactionStatus.COMPLETED
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => setSelectedStatus(TransactionStatus.PENDING)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                            selectedStatus === TransactionStatus.PENDING
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        Processing
                    </button>
                    <button
                        onClick={() => setSelectedStatus(TransactionStatus.FAILED)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                            selectedStatus === TransactionStatus.FAILED
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        Failed
                    </button>
                    <button
                        onClick={() => setSelectedStatus(TransactionStatus.CANCELLED)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                            selectedStatus === TransactionStatus.CANCELLED
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        Cancelled
                    </button>
                </div>
            </div>

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Transactions Found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        You don't have any payment transactions yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTransactions.map((transaction) => (
                        <div
                            key={transaction.transactionId}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {transaction.package?.name || 'Unknown Package'}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                Order ID: {transaction.orderCode}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                transaction.status
                                            )}`}
                                        >
                                            {getStatusText(transaction.status)}
                                        </span>
                                    </div>

                                    {transaction.package?.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            {transaction.package.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span>
                                            <strong>Time:</strong>{' '}
                                            {transaction.createdAt
                                                ? new Date(transaction.createdAt).toLocaleString('en-US')
                                                : 'N/A'}
                                        </span>
                                        {transaction.package?.durationMonths && (
                                            <span>
                                                <strong>Duration:</strong> {transaction.package.durationMonths} months
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary mb-1">
                                        {formatCurrency(transaction.amount)}
                                    </div>
                                    {transaction.package && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {transaction.package.price !== transaction.amount && (
                                                <span className="line-through mr-2">
                                                    {formatCurrency(transaction.package.price)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

