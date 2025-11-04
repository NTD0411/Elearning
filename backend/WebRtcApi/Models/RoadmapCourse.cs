using System;

namespace WebRtcApi.Models
{
    /// <summary>
    /// Junction table linking roadmap steps to recommended courses
    /// </summary>
    public class RoadmapCourse
    {
        public int RoadmapCourseId { get; set; }
        public int RoadmapStepId { get; set; }
        public int ExamCourseId { get; set; }
        
        // AI recommendation details
        public int RecommendationOrder { get; set; } // 1, 2, 3... priority order
        public string? ReasonForRecommendation { get; set; } // Why AI picked this course
        public bool IsCompleted { get; set; } = false;
        public DateTime? CompletedAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual RoadmapStep RoadmapStep { get; set; } = null!;
        public virtual ExamCourse ExamCourse { get; set; } = null!;
    }
}
