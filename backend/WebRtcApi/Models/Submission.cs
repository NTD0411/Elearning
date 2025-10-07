using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class Submission
{
    public int SubmissionId { get; set; }

    public int? UserId { get; set; }

    public int ExamCourseId {  get; set; }

    public string? AnswerText { get; set; }

    public string? AnswerChoice { get; set; }

    public string? AnswerFill { get; set; }

    public string? AnswerAudioUrl { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public decimal? AiScore { get; set; }

    public decimal? MentorScore { get; set; }

    public string? Status { get; set; }

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ExamCourse? ExamCourse { get; set; }
    public virtual User? User { get; set; }

}
