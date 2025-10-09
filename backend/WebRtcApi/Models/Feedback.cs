using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class Feedback
{
    public int FeedbackId { get; set; }

    public int? SubmissionId { get; set; }

    public int? MentorId { get; set; }

    public string? FeedbackText { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<FeedbackReply> FeedbackReplies { get; set; } = new List<FeedbackReply>();

    public virtual User? Mentor { get; set; }

    public virtual Submission? Submission { get; set; }
}
