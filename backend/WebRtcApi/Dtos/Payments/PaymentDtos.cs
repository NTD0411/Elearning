namespace WebRtcApi.Dtos.Payments
{
    public class CreatePaymentRequest
    {
        public int PackageId { get; set; }
        public string ReturnUrl { get; set; }
        public string CancelUrl { get; set; }
    }

    public class PaymentResponse
    {
        public string CheckoutUrl { get; set; }
        public string QrCode { get; set; }
        public string OrderCode { get; set; }
    }

    public class PaymentWebhookRequest
    {
        public string OrderCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? PaymentId { get; set; }
        public string? PaymentMethod { get; set; }
        public string? TransactionTime { get; set; }
        public Dictionary<string, string>? ExtraData { get; set; }
    }

    public class TransactionDto
    {
        public int TransactionId { get; set; }
        public int? UserId { get; set; }
        public int? PackageId { get; set; }
        public long OrderCode { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public PackageInfoDto? Package { get; set; }
    }

    public class PackageInfoDto
    {
        public int PackageId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int DurationMonths { get; set; }
    }
}