namespace WebRtcApi.Dtos.Submissions;

public class FeedbackDto
{
    public int FeedbackId { get; set; }
    public int SubmissionId { get; set; }
    public int? MentorId { get; set; }
    public string? MentorName { get; set; }
    public string? FeedbackText { get; set; }
    public DateTime? CreatedAt { get; set; }
    public List<FeedbackReplyDto> Replies { get; set; } = new List<FeedbackReplyDto>();
}

public class FeedbackReplyDto
{
    public int ReplyId { get; set; }
    public int FeedbackId { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public string? ReplyText { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class CreateFeedbackReplyDto
{
    public int FeedbackId { get; set; }
    public int UserId { get; set; }
    public string ReplyText { get; set; } = string.Empty;
}
