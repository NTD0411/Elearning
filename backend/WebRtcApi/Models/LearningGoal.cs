using System;
using System.Collections.Generic;

namespace WebRtcApi.Models
{
    public class LearningGoal
    {
        public int LearningGoalId { get; set; }
        public int UserId { get; set; }
        
        // Goal information
        public required string GoalTitle { get; set; }
        public string? Description { get; set; }
        public required string TargetBand { get; set; } // "5.0", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"
        public required string FocusSkill { get; set; } // "Reading", "Writing", "Listening", "Speaking", "All"
        public DateTime TargetDate { get; set; }
        
        // Current progress
        public decimal CurrentBand { get; set; } = 0m;
        public decimal ProgressPercentage { get; set; } = 0m;
        public int CompletedExams { get; set; } = 0;
        public int TotalExamsRequired { get; set; }
        
        // Status
        public required string Status { get; set; } = "active"; // "active", "completed", "paused"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        
        // AI generated roadmap
        public string? AiGeneratedPlan { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual ICollection<RoadmapStep> RoadmapSteps { get; set; } = new List<RoadmapStep>();
    }
}
