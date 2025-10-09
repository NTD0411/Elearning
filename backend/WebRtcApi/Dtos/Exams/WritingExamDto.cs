namespace WebRtcApi.Dtos.Exams
{
    public class WritingExamDto
    {
        public int WritingExamId { get; set; }
        public int? ExamSetId { get; set; }
        public string? ExamTitle { get; set; }

        // Task 1
        public string? Task1Title { get; set; }
        public string? Task1Description { get; set; }
        public string? Task1ImageUrl { get; set; }
        public string? Task1Requirements { get; set; }
        public int Task1MinWords { get; set; } = 150;
        public int Task1MaxTime { get; set; } = 20;

        // Task 2
        public string? Task2Title { get; set; }
        public string? Task2Question { get; set; }
        public string? Task2Context { get; set; }
        public string? Task2Requirements { get; set; }
        public int Task2MinWords { get; set; } = 250;
        public int Task2MaxTime { get; set; } = 40;

        // General
        public int TotalTimeMinutes { get; set; } = 60;
        public string? Instructions { get; set; }
        
        [Obsolete("Use Task1Description and Task2Question instead")]
        public string QuestionText { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }
    }

    public class CreateWritingExamDto
    {
        public int ExamSetId { get; set; }

        // Task 1
        public string Task1Title { get; set; } = null!;
        public string Task1Description { get; set; } = null!;
        public string? Task1ImageUrl { get; set; }
        public string? Task1Requirements { get; set; }
        public int Task1MinWords { get; set; } = 150;
        public int Task1MaxTime { get; set; } = 20;

        // Task 2
        public string Task2Title { get; set; } = null!;
        public string Task2Question { get; set; } = null!;
        public string? Task2Context { get; set; }
        public string? Task2Requirements { get; set; }
        public int Task2MinWords { get; set; } = 250;
        public int Task2MaxTime { get; set; } = 40;

        // General
        public int TotalTimeMinutes { get; set; } = 60;
        public string? Instructions { get; set; }
    }

    public class UpdateWritingExamDto
    {
        // Task 1
        public string? Task1Title { get; set; }
        public string? Task1Description { get; set; }
        public string? Task1ImageUrl { get; set; }
        public string? Task1Requirements { get; set; }
        public int? Task1MinWords { get; set; }
        public int? Task1MaxTime { get; set; }

        // Task 2
        public string? Task2Title { get; set; }
        public string? Task2Question { get; set; }
        public string? Task2Context { get; set; }
        public string? Task2Requirements { get; set; }
        public int? Task2MinWords { get; set; }
        public int? Task2MaxTime { get; set; }

        // General
        public int? TotalTimeMinutes { get; set; }
        public string? Instructions { get; set; }
    }
}