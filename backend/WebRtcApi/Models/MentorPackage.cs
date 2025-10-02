using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class MentorPackage
{
    public int PackageId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public int DurationMonths { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
