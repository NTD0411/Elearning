namespace WebRtcApi.Dtos.Submissions;

public class SubmissionDto
{
    public int SubmissionId { get; set; }
    public int? UserId { get; set; }
    public int ExamCourseId { get; set; }
    public string? ExamType { get; set; }
    public int? ExamId { get; set; }
    public string? Answers { get; set; }
    public string? AnswerText { get; set; }
    public string? AnswerChoice { get; set; }
    public string? AnswerFill { get; set; }
    public string? AnswerAudioUrl { get; set; }
    public int? TotalWordCount { get; set; }
    public int? TimeSpent { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public decimal? AiScore { get; set; }
    public decimal? MentorScore { get; set; }
    
    // AI Detailed Scoring Fields for Writing
    public int? AiTaskAchievementScore { get; set; }
    public string? AiTaskAchievementFeedback { get; set; }
    public int? AiCoherenceCohesionScore { get; set; }
    public string? AiCoherenceCohesionFeedback { get; set; }
    public int? AiLexicalResourceScore { get; set; }
    public string? AiLexicalResourceFeedback { get; set; }
    public int? AiGrammaticalRangeScore { get; set; }
    public string? AiGrammaticalRangeFeedback { get; set; }
    public string? AiGeneralFeedback { get; set; }
    
    public string? Status { get; set; }
}