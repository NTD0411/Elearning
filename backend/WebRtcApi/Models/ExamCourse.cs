namespace WebRtcApi.Models
{
    public class ExamCourse
    {
        public int ExamCourseId { get; set; }
        public string CourseTitle { get; set; }
        public string CourseCode { get; set; }
        public string Description { get; set; }
        public string ExamType { get; set; }
        public DateTime CreatedAt { get; set; }

        public virtual ICollection<ListeningExamSet> ListeningExamSets { get; set; }
        public virtual ICollection<ReadingExamSet> ReadingExamSets { get; set; }
        public virtual ICollection<SpeakingExamSet> SpeakingExamSets { get; set; }
        public virtual ICollection<WritingExamSet> WritingExamSets { get; set; }
        public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    }
}
