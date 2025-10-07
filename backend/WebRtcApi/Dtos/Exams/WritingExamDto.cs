namespace WebRtcApi.Dtos.Exams
{
    public class WritingExamDto
    {
        public int WritingExamId { get; set; }
        public int? ExamSetId { get; set; }
        public string QuestionText { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }
    }

    public class CreateWritingExamDto
    {
        public int? ExamSetId { get; set; }
        public string QuestionText { get; set; } = null!;
    }

    public class UpdateWritingExamDto
    {
        public int? ExamSetId { get; set; }
        public string? QuestionText { get; set; }
    }
}