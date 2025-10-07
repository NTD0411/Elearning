using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class WritingExam
{
    public int WritingExamId { get; set; }

    public int? ExamSetId { get; set; }

    public string QuestionText { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual WritingExamSet? ExamSet { get; set; }
}
