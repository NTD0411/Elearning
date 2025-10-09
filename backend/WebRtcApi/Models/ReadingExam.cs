using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class ReadingExam
{
    public int ReadingExamId { get; set; }

    public int? ExamSetId { get; set; }

    public string QuestionText { get; set; } = null!;

    public string? OptionA { get; set; }

    public string? OptionB { get; set; }

    public string? OptionC { get; set; }

    public string? OptionD { get; set; }

    public string? OptionE { get; set; }

    public string? OptionF { get; set; }

    public string? OptionG { get; set; }

    public string? OptionH { get; set; }

    

    public string? AnswerFill { get; set; }

    public string CorrectAnswer { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual ReadingExamSet? ExamSet { get; set; }
}
