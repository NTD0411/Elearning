namespace WebRtcApi.Dtos.Exams
{
    public class ReadingExamDto
    {
        public int ReadingExamId { get; set; }
        public int? ExamSetId { get; set; }
        public string QuestionText { get; set; } = null!;
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? AnswerFill { get; set; }
        public string CorrectAnswer { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }
    }

    public class CreateReadingExamDto
    {
        public int? ExamSetId { get; set; }
        public string QuestionText { get; set; } = null!;
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? AnswerFill { get; set; }
        public string CorrectAnswer { get; set; } = null!;
    }

    public class UpdateReadingExamDto
    {
        public int? ExamSetId { get; set; }
        public string? QuestionText { get; set; }
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? AnswerFill { get; set; }
        public string? CorrectAnswer { get; set; }
    }
}