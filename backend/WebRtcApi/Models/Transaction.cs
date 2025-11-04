using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class Transaction
{
    public int TransactionId { get; set; }

    public int? UserId { get; set; }

    public int? PackageId { get; set; }

    public long OrderCode { get; set; } // Mã đơn hàng PayOS (quan trọng để tra cứu) - phải là số

    public decimal Amount { get; set; }

    public string Status { get; set; } = "PENDING";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual MentorPackage? Package { get; set; }

    public virtual User? User { get; set; }

    public static class TransactionStatus
    {
        public const string PENDING = "PENDING";
        public const string COMPLETED = "COMPLETED";
        public const string FAILED = "FAILED";
        public const string CANCELLED = "CANCELLED";
    }
}
