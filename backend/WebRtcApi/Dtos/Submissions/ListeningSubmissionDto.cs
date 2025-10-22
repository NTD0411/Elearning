namespace WebRtcApi.Dtos.Submissions;

public class ListeningSubmissionDto
{
    public int UserId { get; set; }
    public int ExamSetId { get; set; }
    public List<ListeningAnswerDto> Answers { get; set; } = new List<ListeningAnswerDto>();
    public int TimeSpent { get; set; } // Thời gian làm bài (giây)
    public DateTime SubmittedAt { get; set; }
}

public class ListeningAnswerDto
{
    public int QuestionId { get; set; }
    public string? AnswerChoice { get; set; } // A, B, C, D, etc.
    public string? AnswerFill { get; set; } // Cho câu điền từ
}

public class ListeningResultDto
{
    public int SubmissionId { get; set; }
    public int UserId { get; set; }
    public int ExamSetId { get; set; }
    public string ExamSetTitle { get; set; } = string.Empty;
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public int IncorrectAnswers { get; set; }
    public decimal Score { get; set; } // Điểm từ 0-9 (IELTS band)
    public int TimeSpent { get; set; }
    public DateTime SubmittedAt { get; set; }
    public List<ListeningAnswerResultDto> AnswerResults { get; set; } = new List<ListeningAnswerResultDto>();
}

public class ListeningAnswerResultDto
{
    public int QuestionId { get; set; }
    public string? QuestionText { get; set; }
    public string? UserAnswer { get; set; }
    public string CorrectAnswer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string? OptionA { get; set; }
    public string? OptionB { get; set; }
    public string? OptionC { get; set; }
    public string? OptionD { get; set; }
    public string AudioUrl { get; set; } = string.Empty;
}
