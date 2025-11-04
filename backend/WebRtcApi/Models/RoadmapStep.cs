using System;

namespace WebRtcApi.Models
{
    public class RoadmapStep
    {
        public int RoadmapStepId { get; set; }
        public int LearningGoalId { get; set; }
        
        // Step information
        public int StepOrder { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string SkillType { get; set; } // "Reading", "Writing", "Listening", "Speaking"
        public required string Difficulty { get; set; } // "beginner", "intermediate", "advanced"
        
        // Recommended practice
        public int RecommendedExamSets { get; set; }
        public string? ResourceLinks { get; set; }
        public string? Tips { get; set; }
        
        // Progress tracking
        public bool IsCompleted { get; set; } = false;
        public DateTime? CompletedAt { get; set; }
        public int ExamsCompleted { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual LearningGoal LearningGoal { get; set; } = null!;
        public virtual ICollection<RoadmapCourse> RecommendedCourses { get; set; } = new List<RoadmapCourse>();
    }
}
