using WebRtcApi.Models;

namespace WebRtcApi.Repositories.Transactions
{
    public interface ITransactionRepository
    {
        Task<Transaction> CreateAsync(Transaction transaction);
        Task<Transaction> GetByIdAsync(int id);
        Task<Transaction?> GetByOrderCodeAsync(long orderCode); // Lấy transaction theo OrderCode từ PayOS
        Task<IEnumerable<Transaction>> GetByUserIdAsync(int userId);
        Task<Transaction> UpdateAsync(Transaction transaction);
    }
}