using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class Submission
{
    public int SubmissionId { get; set; }

    public int? UserId { get; set; }

    public int ExamCourseId {  get; set; }

    public string? ExamType { get; set; } // "Reading", "Writing", "Listening", "Speaking"

    public int? ExamId { get; set; } // ID của exam cụ thể (WritingExamId, ReadingExamId, etc.)

    public string? Answers { get; set; } // JSON string chứa tất cả câu trả lời

    public string? AnswerText { get; set; }

    public string? AnswerChoice { get; set; }

    public string? AnswerFill { get; set; }

    public string? AnswerAudioUrl { get; set; }

    public int? TotalWordCount { get; set; } // Tổng số từ (cho Writing)

    public int? TimeSpent { get; set; } // Thời gian làm bài (giây)

    public DateTime? SubmittedAt { get; set; }

    public decimal? AiScore { get; set; }

    public decimal? MentorScore { get; set; }

    public string? Status { get; set; }

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ExamCourse? ExamCourse { get; set; }
    public virtual User? User { get; set; }

}
