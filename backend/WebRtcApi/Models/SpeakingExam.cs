using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class SpeakingExam
{
    public int SpeakingExamId { get; set; }

    public int? ExamSetId { get; set; }

    public string QuestionText { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual SpeakingExamSet? ExamSet { get; set; }
}
