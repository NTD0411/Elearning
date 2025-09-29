using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class SpeakingExamSet
{
    public int ExamSetId { get; set; }

    public string ExamSetCode { get; set; } = null!;

    public string ExamSetTitle { get; set; } = null!;

    public int TotalQuestions { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<SpeakingExam> SpeakingExams { get; set; } = new List<SpeakingExam>();

    public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}
