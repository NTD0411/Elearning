using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class WritingExamSet
{
    public int ExamSetId { get; set; }

    public string ExamSetCode { get; set; } = null!;

    public string ExamSetTitle { get; set; } = null!;

    public int TotalQuestions { get; set; } = 2; // Always 2 tasks for IELTS Writing

    public DateTime? CreatedAt { get; set; }

    public int? ExamCourseId { get; set; }

    // Writing-specific properties
    public string? ExamType { get; set; } = "Academic"; // Academic or General Training
    public string? Description { get; set; }
    public int TotalTimeMinutes { get; set; } = 60; // Standard IELTS Writing time
    public string? Instructions { get; set; }

    public virtual ExamCourse? ExamCourse { get; set; }

    public virtual ICollection<WritingExam> WritingExams { get; set; } = new List<WritingExam>();
}
