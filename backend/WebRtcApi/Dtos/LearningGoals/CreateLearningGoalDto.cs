using System;
using System.ComponentModel.DataAnnotations;

namespace WebRtcApi.Dtos.LearningGoals
{
    public class CreateLearningGoalDto
    {
        [Required]
        [StringLength(200)]
        public required string GoalTitle { get; set; }
        
        public string? Description { get; set; }
        
        [Required]
        public required string TargetBand { get; set; } // "5.0", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"
        
        [Required]
        public required string FocusSkill { get; set; } // "Reading", "Writing", "Listening", "Speaking", "All"
        
        [Required]
        public DateTime TargetDate { get; set; }
        
        public decimal CurrentBand { get; set; } = 0m;
    }
}
