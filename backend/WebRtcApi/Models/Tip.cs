using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class Tip
{
    public int TipId { get; set; }

    public int? MentorId { get; set; }

    public string? Title { get; set; }

    public string? Content { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? Mentor { get; set; }
}
