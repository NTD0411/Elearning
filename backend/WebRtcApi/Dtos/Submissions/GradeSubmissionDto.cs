namespace WebRtcApi.Dtos.Submissions;

public class GradeSubmissionDto
{
    public decimal MentorScore { get; set; }
    public string FeedbackContent { get; set; } = string.Empty;
    public string Status { get; set; } = "Graded";
    public int MentorId { get; set; }
}