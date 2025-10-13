using System.ComponentModel.DataAnnotations;

namespace WebRtcApi.Dtos.Submissions
{
    public class ListeningSubmissionDto
    {
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int ExamSetId { get; set; }
        
        [Required]
        public int ExamCourseId { get; set; }
        
        [Required]
        public List<ListeningAnswerDto> Answers { get; set; } = new();
        
        [Required]
        public int TimeSpent { get; set; } // in seconds
        
        [Required]
        public DateTime SubmittedAt { get; set; }
    }

    public class ListeningAnswerDto
    {
        [Required]
        public int QuestionId { get; set; }
        
        public string? SelectedAnswer { get; set; } // For multiple choice (A, B, C, D)
        
        public string? FillAnswer { get; set; } // For fill-in-the-blank
    }

    public class ListeningSubmissionResultDto
    {
        public int SubmissionId { get; set; }
        public int UserId { get; set; }
        public int ExamSetId { get; set; }
        public int ExamCourseId { get; set; }
        public string ExamType { get; set; } = "listening";
        public List<ListeningAnswerDto> Answers { get; set; } = new();
        public int TimeSpent { get; set; }
        public DateTime SubmittedAt { get; set; }
        public decimal? Score { get; set; }
        public int CorrectAnswers { get; set; }
        public int TotalQuestions { get; set; }
        public List<ListeningQuestionResultDto> QuestionResults { get; set; } = new();
        public string Status { get; set; } = "submitted";
    }

    public class ListeningQuestionResultDto
    {
        public int QuestionId { get; set; }
        public string? UserAnswer { get; set; }
        public string? CorrectAnswer { get; set; }
        public bool IsCorrect { get; set; }
        public int Points { get; set; }
    }
}
