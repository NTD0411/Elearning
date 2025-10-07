using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class FeedbackReply
{
    public int ReplyId { get; set; }

    public int? FeedbackId { get; set; }

    public int? UserId { get; set; }

    public string ReplyText { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual Feedback? Feedback { get; set; }

    public virtual User? User { get; set; }
}
