namespace WebRtcApi.Dtos.Exams
{
    public class ListeningExamDto
    {
        public int ListeningExamId { get; set; }
        public int? ExamSetId { get; set; }
        public string AudioUrl { get; set; } = null!;
        public string? QuestionText { get; set; }
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? AnswerFill { get; set; }
        public string CorrectAnswer { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }
    }

    public class CreateListeningExamDto
    {
        public int? ExamSetId { get; set; }
        public string AudioUrl { get; set; } = null!;
        public string? QuestionText { get; set; }
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? AnswerFill { get; set; }
        public string CorrectAnswer { get; set; } = null!;
    }

    public class UpdateListeningExamDto
    {
        public int? ExamSetId { get; set; }
        public string? AudioUrl { get; set; }
        public string? QuestionText { get; set; }
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? AnswerFill { get; set; }
        public string? CorrectAnswer { get; set; }
    }
}