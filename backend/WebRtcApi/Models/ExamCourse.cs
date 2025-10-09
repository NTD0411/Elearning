namespace WebRtcApi.Models
{
    public class ExamCourse
    {
        public int ExamCourseId { get; set; }
        public required string CourseTitle { get; set; }
        public required string CourseCode { get; set; }
        public string Description { get; set; } = "";
        public required string ExamType { get; set; }
        public DateTime CreatedAt { get; set; }

        // Many-to-many relationship through junction table
        public virtual ICollection<ExamCourseExamSet> ExamCourseExamSets { get; set; } = new List<ExamCourseExamSet>();
        public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    }
}
