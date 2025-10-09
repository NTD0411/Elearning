using System.ComponentModel.DataAnnotations;

namespace WebRtcApi.Dtos.ExamCourses
{
    public class ExamCourseDto
    {
        public int ExamCourseId { get; set; }
        public string CourseTitle { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ExamType { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        
        // Statistics
        public int ReadingExamSetsCount { get; set; }
        public int ListeningExamSetsCount { get; set; }
        public int SpeakingExamSetsCount { get; set; }
        public int WritingExamSetsCount { get; set; }
        public int TotalExamSets { get; set; }
    }

    public class CreateExamCourseDto
    {
        [Required(ErrorMessage = "Course title is required")]
        [StringLength(200, ErrorMessage = "Course title cannot exceed 200 characters")]
        public string CourseTitle { get; set; } = string.Empty;

        [StringLength(50, ErrorMessage = "Course code cannot exceed 50 characters")]
        public string? CourseCode { get; set; }

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Exam type is required")]
        [RegularExpression("^(reading|listening|speaking|writing)$", 
            ErrorMessage = "Exam type must be one of: reading, listening, speaking, writing")]
        public string ExamType { get; set; } = string.Empty;

        [Required(ErrorMessage = "At least one exam set must be selected")]
        [MinLength(1, ErrorMessage = "At least one exam set must be selected")]
        public List<int> ExamSetIds { get; set; } = new List<int>();
    }

    public class UpdateExamCourseDto
    {
        [Required(ErrorMessage = "Course title is required")]
        [StringLength(200, ErrorMessage = "Course title cannot exceed 200 characters")]
        public string CourseTitle { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "At least one exam set must be selected")]
        [MinLength(1, ErrorMessage = "At least one exam set must be selected")]
        public List<int> ExamSetIds { get; set; } = new List<int>();
    }

    public class DeleteExamCourseDto
    {
        [Required(ErrorMessage = "Exam course ID is required")]
        public int ExamCourseId { get; set; }

        public bool ForceDelete { get; set; } = false;

        [StringLength(500, ErrorMessage = "Reason cannot exceed 500 characters")]
        public string? Reason { get; set; }
    }

    public class ExamCourseDetailDto
    {
        public int ExamCourseId { get; set; }
        public string CourseTitle { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ExamType { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public List<ExamSetSummaryDto> ReadingExamSets { get; set; } = new List<ExamSetSummaryDto>();
        public List<ExamSetSummaryDto> ListeningExamSets { get; set; } = new List<ExamSetSummaryDto>();
        public List<ExamSetSummaryDto> SpeakingExamSets { get; set; } = new List<ExamSetSummaryDto>();
        public List<ExamSetSummaryDto> WritingExamSets { get; set; } = new List<ExamSetSummaryDto>();
    }

    public class ExamSetSummaryDto
    {
        public int ExamSetId { get; set; }
        public string ExamSetTitle { get; set; } = string.Empty;
        public string ExamSetCode { get; set; } = string.Empty;
        public int TotalQuestions { get; set; }
        public int QuestionCount { get; set; }
        public string Type { get; set; } = string.Empty;
    }

    public class DeleteResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int DeletedExamCourseId { get; set; }
        public int DeletedSubmissionsCount { get; set; }
        public int DeletedAssignmentsCount { get; set; }
        public DateTime DeletedAt { get; set; }
    }
}