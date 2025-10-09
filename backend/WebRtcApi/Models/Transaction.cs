using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class Transaction
{
    public int TransactionId { get; set; }

    public int? UserId { get; set; }

    public int? PackageId { get; set; }

    public decimal Amount { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual MentorPackage? Package { get; set; }

    public virtual User? User { get; set; }
}
