namespace WebRtcApi.Dtos.Submissions;

public class SubmissionHistoryDto
{
    public int SubmissionId { get; set; }
    public int? UserId { get; set; }
    public int ExamCourseId { get; set; }
    public string? ExamType { get; set; }
    public int? ExamId { get; set; }
    public string? Answers { get; set; }
    public string? AnswerText { get; set; }
    public string? AnswerAudioUrl { get; set; }
    public int? TotalWordCount { get; set; }
    public int? TimeSpent { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public decimal? AiScore { get; set; }
    public decimal? MentorScore { get; set; }
    public string? Status { get; set; }
    public string? StudentName { get; set; }
    
    // Exam details
    public string? ExamTitle { get; set; }
    public string? CourseTitle { get; set; }
    public string? CourseCode { get; set; }
    
    // Discussion info
    public int ReplyCount { get; set; }
    
    // Formatted properties
    public string TimeSpentFormatted => TimeSpent.HasValue 
        ? TimeSpan.FromSeconds(TimeSpent.Value).ToString(@"hh\:mm\:ss") 
        : "00:00:00";
    
    public string ScoreFormatted => AiScore.HasValue 
        ? $"{AiScore:F1}/10" 
        : MentorScore.HasValue 
            ? $"{MentorScore:F1}/10" 
            : "Not Graded";
}