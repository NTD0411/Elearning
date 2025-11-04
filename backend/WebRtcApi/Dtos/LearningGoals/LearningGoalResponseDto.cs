using System;
using System.Collections.Generic;

namespace WebRtcApi.Dtos.LearningGoals
{
    public class LearningGoalResponseDto
    {
        public int LearningGoalId { get; set; }
        public int UserId { get; set; }
        public string GoalTitle { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string TargetBand { get; set; } = string.Empty;
        public string FocusSkill { get; set; } = string.Empty;
        public DateTime TargetDate { get; set; }
        public decimal CurrentBand { get; set; }
        public decimal ProgressPercentage { get; set; }
        public int CompletedExams { get; set; }
        public int TotalExamsRequired { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? AiGeneratedPlan { get; set; }
        public List<RoadmapStepDto> RoadmapSteps { get; set; } = new();
    }

    public class RoadmapStepDto
    {
        public int RoadmapStepId { get; set; }
        public int StepOrder { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string SkillType { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public int RecommendedExamSets { get; set; }
        public string? ResourceLinks { get; set; }
        public string? Tips { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int ExamsCompleted { get; set; }
        public List<RecommendedCourseDto> RecommendedCourses { get; set; } = new();
    }

    public class RecommendedCourseDto
    {
        public int RoadmapCourseId { get; set; }
        public int ExamCourseId { get; set; }
        public string CourseTitle { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string ExamType { get; set; } = string.Empty;
        public int TotalExamSets { get; set; }
        public int RecommendationOrder { get; set; }
        public string? ReasonForRecommendation { get; set; }
        public bool IsCompleted { get; set; }
    }
}
