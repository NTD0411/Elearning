using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;

namespace WebRtcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExamController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public ExamController(DatabaseContext context)
        {
            _context = context;
        }

        [HttpGet("available")]
        public async Task<ActionResult<object>> GetAvailableExams()
        {
            try
            {
                var readingExams = await _context.ReadingExamSets
                    .Select(r => new
                    {
                        examSetId = r.ExamSetId,
                        examTitle = r.ExamSetTitle,
                        examCode = r.ExamSetCode,
                        examType = "reading",
                        totalQuestions = r.TotalQuestions,
                        readingContext = r.ReadingContext,
                        readingImage = r.ReadingImage,
                        createdAt = r.CreatedAt,
                        questionCount = _context.ReadingExams.Count(e => e.ExamSetId == r.ExamSetId)
                    })
                    .ToListAsync();

                var listeningExams = await _context.ListeningExamSets
                    .Select(l => new
                    {
                        examSetId = l.ExamSetId,
                        examTitle = l.ExamSetTitle,
                        examCode = l.ExamSetCode,
                        examType = "listening",
                        totalQuestions = l.TotalQuestions,
                        listeningImage = l.ListeningImage,
                        createdAt = l.CreatedAt,
                        questionCount = _context.ListeningExams.Count(e => e.ExamSetId == l.ExamSetId)
                    })
                    .ToListAsync();

                var speakingExams = await _context.SpeakingExamSets
                    .Select(s => new
                    {
                        examSetId = s.ExamSetId,
                        examTitle = s.ExamSetTitle,
                        examCode = s.ExamSetCode,
                        examType = "speaking",
                        totalQuestions = s.TotalQuestions,
                        createdAt = s.CreatedAt,
                        questionCount = _context.SpeakingExams.Count(e => e.ExamSetId == s.ExamSetId)
                    })
                    .ToListAsync();

                var writingExams = await _context.WritingExamSets
                    .Select(w => new
                    {
                        examSetId = w.ExamSetId,
                        examTitle = w.ExamSetTitle,
                        examCode = w.ExamSetCode,
                        examType = "writing",
                        totalQuestions = w.TotalQuestions,
                        createdAt = w.CreatedAt,
                        questionCount = _context.WritingExams.Count(e => e.ExamSetId == w.ExamSetId)
                    })
                    .ToListAsync();

                var result = new
                {
                    reading = readingExams,
                    listening = listeningExams,
                    speaking = speakingExams,
                    writing = writingExams,
                    summary = new
                    {
                        totalReading = readingExams.Count,
                        totalListening = listeningExams.Count,
                        totalSpeaking = speakingExams.Count,
                        totalWriting = writingExams.Count,
                        totalExams = readingExams.Count + listeningExams.Count + speakingExams.Count + writingExams.Count
                    }
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving available exams: {ex.Message}");
            }
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<object>> GetExamsByCourse(int courseId)
        {
            try
            {
                var course = await _context.ExamCourse
                    .FirstOrDefaultAsync(ec => ec.ExamCourseId == courseId);

                if (course == null)
                    return NotFound("Course not found");

                // Get exam sets assigned to this course
                var examSetAssignments = await _context.ExamCourseExamSets
                    .Where(eces => eces.ExamCourseId == courseId)
                    .ToListAsync();

                var exams = new List<object>();

                foreach (var assignment in examSetAssignments)
                {
                    switch (assignment.ExamSetType.ToLower())
                    {
                        case "reading":
                            var readingExam = await _context.ReadingExamSets
                                .Where(r => r.ExamSetId == assignment.ExamSetId)
                                .Select(r => new
                                {
                                    examSetId = r.ExamSetId,
                                    examTitle = r.ExamSetTitle,
                                    examCode = r.ExamSetCode,
                                    examType = "reading",
                                    totalQuestions = r.TotalQuestions,
                                    readingContext = r.ReadingContext,
                                    readingImage = r.ReadingImage,
                                    createdAt = r.CreatedAt,
                                    questionCount = _context.ReadingExams.Count(e => e.ExamSetId == r.ExamSetId)
                                })
                                .FirstOrDefaultAsync();
                            if (readingExam != null) exams.Add(readingExam);
                            break;

                        case "listening":
                            var listeningExam = await _context.ListeningExamSets
                                .Where(l => l.ExamSetId == assignment.ExamSetId)
                                .Select(l => new
                                {
                                    examSetId = l.ExamSetId,
                                    examTitle = l.ExamSetTitle,
                                    examCode = l.ExamSetCode,
                                    examType = "listening",
                                    totalQuestions = l.TotalQuestions,
                                    listeningImage = l.ListeningImage,
                                    createdAt = l.CreatedAt,
                                    questionCount = _context.ListeningExams.Count(e => e.ExamSetId == l.ExamSetId)
                                })
                                .FirstOrDefaultAsync();
                            if (listeningExam != null) exams.Add(listeningExam);
                            break;

                        case "speaking":
                            var speakingExam = await _context.SpeakingExamSets
                                .Where(s => s.ExamSetId == assignment.ExamSetId)
                                .Select(s => new
                                {
                                    examSetId = s.ExamSetId,
                                    examTitle = s.ExamSetTitle,
                                    examCode = s.ExamSetCode,
                                    examType = "speaking",
                                    totalQuestions = s.TotalQuestions,
                                    createdAt = s.CreatedAt,
                                    questionCount = _context.SpeakingExams.Count(e => e.ExamSetId == s.ExamSetId)
                                })
                                .FirstOrDefaultAsync();
                            if (speakingExam != null) exams.Add(speakingExam);
                            break;

                        case "writing":
                            var writingExam = await _context.WritingExamSets
                                .Where(w => w.ExamSetId == assignment.ExamSetId)
                                .Select(w => new
                                {
                                    examSetId = w.ExamSetId,
                                    examTitle = w.ExamSetTitle,
                                    examCode = w.ExamSetCode,
                                    examType = "writing",
                                    totalQuestions = w.TotalQuestions,
                                    createdAt = w.CreatedAt,
                                    questionCount = _context.WritingExams.Count(e => e.ExamSetId == w.ExamSetId)
                                })
                                .FirstOrDefaultAsync();
                            if (writingExam != null) exams.Add(writingExam);
                            break;
                    }
                }

                var result = new
                {
                    courseId = course.ExamCourseId,
                    courseTitle = course.CourseTitle,
                    courseCode = course.CourseCode,
                    examType = course.ExamType,
                    exams = exams,
                    totalExams = exams.Count
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving course exams: {ex.Message}");
            }
        }
    }
}
