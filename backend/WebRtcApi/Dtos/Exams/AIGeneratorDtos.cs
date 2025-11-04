namespace WebRtcApi.Dtos.Exams
{
    // ============= Reading Exam DTOs =============
    
    public class GenerateReadingExamRequest
    {
        public string Topic { get; set; } = "";
        public string Difficulty { get; set; } = "Medium"; // Easy, Medium, Hard
        public int NumberOfQuestions { get; set; } = 10;
        public int? ExamCourseId { get; set; } // Optional: Link to existing course
    }

    public class GenerateReadingExamResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public AIReadingExamSetDto? ExamSet { get; set; }
        public List<AIReadingQuestionDto>? Questions { get; set; }
    }

    // ============= Listening Exam DTOs =============
    
    public class GenerateListeningExamRequest
    {
        public string Topic { get; set; } = "";
        public string Difficulty { get; set; } = "Medium";
        public int NumberOfQuestions { get; set; } = 10;
        public int? ExamCourseId { get; set; }
    }

    public class GenerateListeningExamResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public AIListeningExamSetDto? ExamSet { get; set; }
        public List<AIListeningQuestionDto>? Questions { get; set; }
        public string? AudioScript { get; set; } // For admin to create audio
        public string? AudioDescription { get; set; }
    }

    // ============= Writing Exam DTOs =============
    
    public class GenerateWritingExamRequest
    {
        public string Topic { get; set; } = "";
        public string Difficulty { get; set; } = "Medium";
        public string EssayType { get; set; } = "Opinion"; // Opinion, Discussion, Problem-Solution, etc.
        public int? ExamCourseId { get; set; }
    }

    public class GenerateWritingExamResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public AIWritingExamSetDto? ExamSet { get; set; }
        public AIWritingExamDetailsDto? Exam { get; set; }
    }

    // ============= Speaking Exam DTOs =============
    
    public class GenerateSpeakingExamRequest
    {
        public string Topic { get; set; } = "";
        public string Difficulty { get; set; } = "Medium";
        public int? ExamCourseId { get; set; }
    }

    public class GenerateSpeakingExamResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public AISpeakingExamSetDto? ExamSet { get; set; }
        public List<AISpeakingQuestionDto>? Questions { get; set; }
    }

    // ============= Exam Set DTOs =============

    public class AIReadingExamSetDto
    {
        public int ExamSetId { get; set; }
        public string ExamSetCode { get; set; } = "";
        public string ExamSetTitle { get; set; } = "";
        public int TotalQuestions { get; set; }
        public string? ReadingContext { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AIListeningExamSetDto
    {
        public int ExamSetId { get; set; }
        public string ExamSetCode { get; set; } = "";
        public string ExamSetTitle { get; set; } = "";
        public int TotalQuestions { get; set; }
        public int TimeLimit { get; set; }
        public string? AudioUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AIWritingExamSetDto
    {
        public int ExamSetId { get; set; }
        public string ExamSetCode { get; set; } = "";
        public string ExamSetTitle { get; set; } = "";
        public int TotalQuestions { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AISpeakingExamSetDto
    {
        public int ExamSetId { get; set; }
        public string ExamSetCode { get; set; } = "";
        public string ExamSetTitle { get; set; } = "";
        public int TotalQuestions { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // ============= Individual Exam DTOs =============

    public class AIReadingQuestionDto
    {
        public int ReadingExamId { get; set; }
        public string QuestionText { get; set; } = "";
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? OptionE { get; set; }
        public string? OptionF { get; set; }
        public string? OptionG { get; set; }
        public string? OptionH { get; set; }
        public string CorrectAnswer { get; set; } = "";
    }

    public class AIListeningQuestionDto
    {
        public int ListeningExamId { get; set; }
        public string QuestionText { get; set; } = "";
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? OptionE { get; set; }
        public string? OptionF { get; set; }
        public string? OptionG { get; set; }
        public string? OptionH { get; set; }
        public string CorrectAnswer { get; set; } = "";
        public string AudioUrl { get; set; } = "";
    }

    public class AIWritingExamDetailsDto
    {
        public int WritingExamId { get; set; }
        public string? Task1Title { get; set; }
        public string? Task1Description { get; set; }
        public string? Task1ImageUrl { get; set; }
        public string? Task1Requirements { get; set; }
        public int Task1MinWords { get; set; }
        public int Task1MaxTime { get; set; }
        public string? Task2Title { get; set; }
        public string? Task2Question { get; set; }
        public string? Task2Context { get; set; }
        public string? Task2Requirements { get; set; }
        public int Task2MinWords { get; set; }
        public int Task2MaxTime { get; set; }
        public int TotalTimeMinutes { get; set; }
        public string? Instructions { get; set; }
    }

    public class AISpeakingQuestionDto
    {
        public int SpeakingExamId { get; set; }
        public int PartNumber { get; set; }
        public string PartTitle { get; set; } = "";
        public string QuestionText { get; set; } = "";
        public string? CueCardTopic { get; set; }
        public string? CueCardPrompts { get; set; }
        public int TimeLimit { get; set; }
    }
}
