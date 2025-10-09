namespace WebRtcApi.Dtos.Exams
{
    public class SpeakingExamDto
    {
        public int SpeakingExamId { get; set; }
        public int? ExamSetId { get; set; }
        public string QuestionText { get; set; } = null!;
        public int PartNumber { get; set; }
        public string PartTitle { get; set; } = null!;
        public string? CueCardTopic { get; set; }
        public string? CueCardPrompts { get; set; }
        public int? TimeLimit { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class CreateSpeakingExamDto
    {
        public int? ExamSetId { get; set; }
        public string QuestionText { get; set; } = null!;
        public int PartNumber { get; set; }
        public string PartTitle { get; set; } = null!;
        public string? CueCardTopic { get; set; }
        public string? CueCardPrompts { get; set; }
        public int? TimeLimit { get; set; }
    }

    public class UpdateSpeakingExamDto
    {
        public int? ExamSetId { get; set; }
        public string? QuestionText { get; set; }
        public int? PartNumber { get; set; }
        public string? PartTitle { get; set; }
        public string? CueCardTopic { get; set; }
        public string? CueCardPrompts { get; set; }
        public int? TimeLimit { get; set; }
    }
}