using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class ReadingExamSet
{
    public int ExamSetId { get; set; }

    public string ExamSetCode { get; set; } = null!;

    public string ExamSetTitle { get; set; } = null!;

    public int TotalQuestions { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<ReadingExam> ReadingExams { get; set; } = new List<ReadingExam>();


}
