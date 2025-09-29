using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class ListeningExamSet
{
    public int ExamSetId { get; set; }

    public string ExamSetCode { get; set; } = null!;

    public string ExamSetTitle { get; set; } = null!;

    public int TotalQuestions { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<ListeningExam> ListeningExams { get; set; } = new List<ListeningExam>();

    public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}
