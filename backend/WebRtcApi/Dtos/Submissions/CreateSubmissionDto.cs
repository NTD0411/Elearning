namespace WebRtcApi.Dtos.Submissions;

public class CreateSubmissionDto
{
    public int UserId { get; set; }
    public string ExamType { get; set; } = string.Empty; // "Reading", "Writing", "Listening", "Speaking"
    public int ExamId { get; set; } // ID của exam cụ thể
    public string Answers { get; set; } = string.Empty; // JSON string
    public int? TotalWordCount { get; set; }
    public int? TimeSpent { get; set; } // Thời gian làm bài (giây)
    public DateTime SubmittedAt { get; set; }
}