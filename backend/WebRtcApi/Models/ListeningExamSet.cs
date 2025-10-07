using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class ListeningExamSet
{
    public int ExamSetId { get; set; }

    public string ExamSetCode { get; set; } = null!;

    public string ExamSetTitle { get; set; } = null!;

    public int TotalQuestions { get; set; }
    public string? ListeningImage { get; set; }

    public DateTime? CreatedAt { get; set; }
    public int? ExamCourseId { get; set; }

    public virtual ExamCourse? ExamCourse { get; set; }
    public virtual ICollection<ListeningExam> ListeningExams { get; set; } = new List<ListeningExam>();

    
}
