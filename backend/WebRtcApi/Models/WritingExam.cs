using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class WritingExam
{
    public int WritingExamId { get; set; }

    public int? ExamSetId { get; set; }

    // Task 1 Properties
    public string? Task1Title { get; set; }
    public string? Task1Description { get; set; }
    public string? Task1ImageUrl { get; set; }  // For charts, graphs, diagrams
    public string? Task1Requirements { get; set; }  // Minimum word count, specific requirements
    public int Task1MinWords { get; set; } = 150;  // IELTS Task 1 minimum
    public int Task1MaxTime { get; set; } = 20;  // Recommended time in minutes

    // Task 2 Properties  
    public string? Task2Title { get; set; }
    public string? Task2Question { get; set; }
    public string? Task2Context { get; set; }  // Background information
    public string? Task2Requirements { get; set; }  // Essay structure requirements
    public int Task2MinWords { get; set; } = 250;  // IELTS Task 2 minimum
    public int Task2MaxTime { get; set; } = 40;  // Recommended time in minutes

    // General Properties
    public int TotalTimeMinutes { get; set; } = 60;  // Total exam time
    public string? Instructions { get; set; }  // General instructions
    
    [Obsolete("Use Task1Description and Task2Question instead")]
    public string QuestionText { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual WritingExamSet? ExamSet { get; set; }
}
