namespace WebRtcApi.Dtos.Submissions;

public class ReadingSubmissionDto
{
    public int UserId { get; set; }
    public int ExamSetId { get; set; }
    public List<ReadingAnswerDto> Answers { get; set; } = new List<ReadingAnswerDto>();
    public int TimeSpent { get; set; } // Thời gian làm bài (giây)
    public DateTime SubmittedAt { get; set; }
}

public class ReadingAnswerDto
{
    public int QuestionId { get; set; }
    public string? AnswerChoice { get; set; } // A, B, C, D, etc.
    public string? AnswerFill { get; set; } // Cho câu điền từ
}

public class ReadingResultDto
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
    public List<ReadingAnswerResultDto> AnswerResults { get; set; } = new List<ReadingAnswerResultDto>();
}

public class ReadingAnswerResultDto
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? UserAnswer { get; set; }
    public string CorrectAnswer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string? OptionA { get; set; }
    public string? OptionB { get; set; }
    public string? OptionC { get; set; }
    public string? OptionD { get; set; }
}
