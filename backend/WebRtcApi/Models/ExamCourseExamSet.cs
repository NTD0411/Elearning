using System.ComponentModel.DataAnnotations;

namespace WebRtcApi.Models
{
    public class ExamCourseExamSet
    {
        [Key]
        public int Id { get; set; }
        
        public int ExamCourseId { get; set; }
        public ExamCourse ExamCourse { get; set; }
        
        public int ExamSetId { get; set; }
        public string ExamSetType { get; set; } // "Reading", "Listening", "Speaking", "Writing"
        
        public DateTime AssignedAt { get; set; } = DateTime.Now;
    }
}