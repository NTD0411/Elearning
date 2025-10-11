using System;
using System.Collections.Generic;
using WebRtcApi.Models;
using Microsoft.AspNetCore.Cors; // Add this using directive

namespace WebRtcApi.Models;

[EnableCors("AllowAll")] // Apply the EnableCors attribute at the class level
public partial class SpeakingExam
{
    public int SpeakingExamId { get; set; }

    public int ExamSetId { get; set; }

    public string QuestionText { get; set; } = null!;
    
    // New fields for IELTS Speaking structure
    public int PartNumber { get; set; } // 1, 2, or 3
    
    public string? PartTitle { get; set; } // "Introduction & Interview", "Long Turn", "Discussion"
    
    public string? CueCardTopic { get; set; } // For Part 2 only
    
    public string? CueCardPrompts { get; set; } // Bullet points for Part 2
    
    public int? TimeLimit { get; set; } // Time in minutes for each part

    public DateTime? CreatedAt { get; set; }

    public virtual SpeakingExamSet ExamSet { get; set; }
}


