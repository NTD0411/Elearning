using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebRtcApi.Dtos.Payments;
using WebRtcApi.Models;
using WebRtcApi.Repositories.Packages;
using WebRtcApi.Repositories.Transactions;
using Net.payOS;
using Net.payOS.Types;

namespace WebRtcApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPackageRepository _packageRepository;
        private readonly ITransactionRepository _transactionRepository;
        private readonly PayOS _payOS;

        public PaymentController(PayOS payOS, IPackageRepository packageRepository, ITransactionRepository transactionRepository)
        {
            _payOS = payOS;
            _packageRepository = packageRepository;
            _transactionRepository = transactionRepository;
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreatePaymentLink([FromBody] PaymentRequest paymentRequest)
        {
            try
            {
                // Lấy UserId từ JWT token (giống như TipsController)
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user authentication." });
                }

                // Lấy thông tin gói từ PackageId
                var package = await _packageRepository.GetByIdAsync(paymentRequest.PackageId);
                if (package == null)
                {
                    return NotFound(new { message = "Package not found." });
                }

                var totalAmount = package.Price;

                // Tạo mã đơn cho PayOS (dùng PackageId * 10^10 + timestamp để tạo orderCode duy nhất dạng số)
                var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                var orderCode = paymentRequest.PackageId * 10000000000L + timestamp;

                // URL callback - PayOS sẽ redirect về backend endpoint để update transaction trước khi redirect frontend
                var backendBaseUrl = "http://localhost:5074"; // Hoặc dùng configuration
                var frontEndBaseUrl = "http://localhost:3000";
                var successUrl = $"{backendBaseUrl}/api/payment/success?orderCode={orderCode}";
                var cancelUrl = $"{backendBaseUrl}/api/payment/cancel?orderCode={orderCode}";

                // Tạo danh sách ItemData cho PayOS
                var items = new List<ItemData>
                {
                    new ItemData(
                        package.Name,
                        1,
                        (int)totalAmount
                    )
                };

                // PayOS yêu cầu description tối đa 25 ký tự (tính cả UTF-8)
                var description = package.Name;
                if (description.Length > 25)
                {
                    description = description.Substring(0, 25);
                }

                var paymentData = new PaymentData(
                    orderCode,
                    (int)totalAmount,
                    description,
                    items,
                    cancelUrl,
                    successUrl
                );

                // Gọi PayOS để tạo liên kết thanh toán
                var paymentLink = await _payOS.createPaymentLink(paymentData);
                Console.WriteLine($"Tạo liên kết thanh toán thành công: {paymentLink.checkoutUrl}");

                // Lưu transaction vào database với status PENDING
                var transaction = new WebRtcApi.Models.Transaction
                {
                    UserId = userId,
                    PackageId = paymentRequest.PackageId,
                    OrderCode = orderCode,
                    Amount = totalAmount,
                    Status = WebRtcApi.Models.Transaction.TransactionStatus.PENDING,
                    CreatedAt = DateTime.UtcNow
                };

                await _transactionRepository.CreateAsync(transaction);

                // Trả về URL thanh toán
                return Ok(new { checkoutUrl = paymentLink.checkoutUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Error creating payment link", details = ex.Message });
            }
        }

        [HttpGet("success")]
        public async Task<IActionResult> PaymentSuccess([FromQuery] long orderCode)
        {
            try
            {
                // Extract packageId từ orderCode (format: {packageId * 10^10 + timestamp})
                var packageId = (int)(orderCode / 10000000000L);

                // Tìm transaction theo OrderCode và cập nhật status thành COMPLETED
                var transaction = await _transactionRepository.GetByOrderCodeAsync(orderCode);
                if (transaction != null)
                {
                    transaction.Status = WebRtcApi.Models.Transaction.TransactionStatus.COMPLETED;
                    await _transactionRepository.UpdateAsync(transaction);
                }

                // Chuyển hướng đến Front-end sau khi thanh toán thành công
                var frontEndUrl = $"http://localhost:3000/payment/success?packageId={packageId}";
                return Redirect(frontEndUrl);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating transaction: {ex.Message}");
                // Vẫn redirect về frontend dù có lỗi
                var packageId = (int)(orderCode / 10000000000L);
                var frontEndUrl = $"http://localhost:3000/payment/success?packageId={packageId}";
                return Redirect(frontEndUrl);
            }
        }

        [HttpGet("cancel")]
        public async Task<IActionResult> PaymentCancel([FromQuery] long orderCode)
        {
            try
            {
                // Extract packageId từ orderCode (format: {packageId * 10^10 + timestamp})
                var packageId = (int)(orderCode / 10000000000L);

                // Tìm transaction theo OrderCode và cập nhật status thành CANCELLED
                var transaction = await _transactionRepository.GetByOrderCodeAsync(orderCode);
                if (transaction != null)
                {
                    transaction.Status = WebRtcApi.Models.Transaction.TransactionStatus.CANCELLED;
                    await _transactionRepository.UpdateAsync(transaction);
                }

                // Chuyển hướng đến Front-end khi thanh toán bị hủy
                var frontEndUrl = "http://localhost:3000/payment/cancel";
                return Redirect(frontEndUrl);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating transaction: {ex.Message}");
                // Vẫn redirect về frontend dù có lỗi
                var frontEndUrl = "http://localhost:3000/payment/cancel";
                return Redirect(frontEndUrl);
            }
        }

        [Authorize]
        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions()
        {
            try
            {
                // Lấy UserId từ JWT token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user authentication." });
                }

                // Lấy danh sách transaction của user
                var transactions = await _transactionRepository.GetByUserIdAsync(userId);

                // Map sang DTO
                var transactionDtos = transactions.Select(t => new TransactionDto
                {
                    TransactionId = t.TransactionId,
                    UserId = t.UserId,
                    PackageId = t.PackageId,
                    OrderCode = t.OrderCode,
                    Amount = t.Amount,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt,
                    Package = t.Package != null ? new PackageInfoDto
                    {
                        PackageId = t.Package.PackageId,
                        Name = t.Package.Name,
                        Description = t.Package.Description,
                        Price = t.Package.Price,
                        DurationMonths = t.Package.DurationMonths
                    } : null
                }).ToList();

                return Ok(transactionDtos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Error fetching transactions", details = ex.Message });
            }
        }
    }

    // Mô hình yêu cầu thanh toán
    public class PaymentRequest
    {
        public int PackageId { get; set; }
    }
}
