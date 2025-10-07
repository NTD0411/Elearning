using System;
using System.Collections.Generic;
using System.Net.Http.Headers;

namespace WebRtcApi.Models;

public partial class ListeningExam
{
    public int ListeningExamId { get; set; }

    public int? ExamSetId { get; set; }

    public string AudioUrl { get; set; } = null!;

    public string? QuestionText { get; set; }

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

    public virtual ListeningExamSet? ExamSet { get; set; }
}
