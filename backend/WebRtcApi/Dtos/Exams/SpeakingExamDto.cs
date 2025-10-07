namespace WebRtcApi.Dtos.Exams
{
    public class SpeakingExamDto
    {
        public int SpeakingExamId { get; set; }
        public int? ExamSetId { get; set; }
        public string QuestionText { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }
    }

    public class CreateSpeakingExamDto
    {
        public int? ExamSetId { get; set; }
        public string QuestionText { get; set; } = null!;
    }

    public class UpdateSpeakingExamDto
    {
        public int? ExamSetId { get; set; }
        public string? QuestionText { get; set; }
    }
}