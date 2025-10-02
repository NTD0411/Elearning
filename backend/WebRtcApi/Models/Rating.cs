using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class Rating
{
    public int RatingId { get; set; }

    public int? StudentId { get; set; }

    public int? MentorId { get; set; }

    public int? Score { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? Mentor { get; set; }

    public virtual User? Student { get; set; }
}
