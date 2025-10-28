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
    public string? AudioUrl { get; set; } // Audio file cho toàn bộ exam set
    public int TimeLimit { get; set; } = 40; // Thời gian làm bài (phút), mặc định 40 phút

    public DateTime? CreatedAt { get; set; }
    public int? ExamCourseId { get; set; }

    public virtual ExamCourse? ExamCourse { get; set; }
    public virtual ICollection<ListeningExam> ListeningExams { get; set; } = new List<ListeningExam>();

    
}
