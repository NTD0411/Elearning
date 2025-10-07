using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;
using WebRtcApi.Models;
using WebRtcApi.Dtos.ExamCourses;

namespace WebRtcApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamCourseController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public ExamCourseController(DatabaseContext context)
        {
            _context = context;
        }

        // GET: api/ExamCourse
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExamCourseDto>>> GetExamCourses()
        {
            var examCourses = await _context.ExamCourse
                .Select(ec => new ExamCourseDto
                {
                    ExamCourseId = ec.ExamCourseId,
                    CourseTitle = ec.CourseTitle,
                    CourseCode = ec.CourseCode,
                    Description = ec.Description,
                    ExamType = ec.ExamType,
                    CreatedAt = ec.CreatedAt,
                    ReadingExamSetsCount = _context.ExamCourseExamSets.Count(eces => eces.ExamCourseId == ec.ExamCourseId && eces.ExamSetType == "reading"),
                    ListeningExamSetsCount = _context.ExamCourseExamSets.Count(eces => eces.ExamCourseId == ec.ExamCourseId && eces.ExamSetType == "listening"),
                    SpeakingExamSetsCount = _context.ExamCourseExamSets.Count(eces => eces.ExamCourseId == ec.ExamCourseId && eces.ExamSetType == "speaking"),
                    WritingExamSetsCount = _context.ExamCourseExamSets.Count(eces => eces.ExamCourseId == ec.ExamCourseId && eces.ExamSetType == "writing"),
                    TotalExamSets = _context.ExamCourseExamSets.Count(eces => eces.ExamCourseId == ec.ExamCourseId)
                })
                .ToListAsync();

            return Ok(examCourses);
        }

        // GET: api/ExamCourse/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ExamCourseDetailDto>> GetExamCourse(int id)
        {
            var examCourse = await _context.ExamCourse
                .Where(ec => ec.ExamCourseId == id)
                .FirstOrDefaultAsync();

            if (examCourse == null)
                return NotFound();

            // Get exam sets based on type through junction table
            var examSets = await GetExamSetsForCourse(id, examCourse.ExamType);

            var result = new ExamCourseDetailDto
            {
                ExamCourseId = examCourse.ExamCourseId,
                CourseTitle = examCourse.CourseTitle,
                CourseCode = examCourse.CourseCode,
                Description = examCourse.Description,
                ExamType = examCourse.ExamType,
                CreatedAt = examCourse.CreatedAt,
                ReadingExamSets = examCourse.ExamType.ToLower() == "reading" ? examSets : new List<ExamSetSummaryDto>(),
                ListeningExamSets = examCourse.ExamType.ToLower() == "listening" ? examSets : new List<ExamSetSummaryDto>(),
                SpeakingExamSets = examCourse.ExamType.ToLower() == "speaking" ? examSets : new List<ExamSetSummaryDto>(),
                WritingExamSets = examCourse.ExamType.ToLower() == "writing" ? examSets : new List<ExamSetSummaryDto>()
            };

            return Ok(result);
        }

        private async Task<List<ExamSetSummaryDto>> GetExamSetsForCourse(int examCourseId, string examType)
        {
            var examSetIds = await _context.ExamCourseExamSets
                .Where(eces => eces.ExamCourseId == examCourseId && eces.ExamSetType == examType.ToLower())
                .Select(eces => eces.ExamSetId)
                .ToListAsync();

            switch (examType.ToLower())
            {
                case "reading":
                    return await _context.ReadingExamSets
                        .Where(r => examSetIds.Contains(r.ExamSetId))
                        .Select(r => new ExamSetSummaryDto
                        {
                            ExamSetId = r.ExamSetId,
                            ExamSetTitle = r.ExamSetTitle,
                            ExamSetCode = r.ExamSetCode,
                            TotalQuestions = r.TotalQuestions,
                            QuestionCount = _context.ReadingExams.Count(e => e.ExamSetId == r.ExamSetId),
                            Type = "Reading"
                        })
                        .ToListAsync();

                case "listening":
                    return await _context.ListeningExamSets
                        .Where(l => examSetIds.Contains(l.ExamSetId))
                        .Select(l => new ExamSetSummaryDto
                        {
                            ExamSetId = l.ExamSetId,
                            ExamSetTitle = l.ExamSetTitle,
                            ExamSetCode = l.ExamSetCode,
                            TotalQuestions = l.TotalQuestions,
                            QuestionCount = _context.ListeningExams.Count(e => e.ExamSetId == l.ExamSetId),
                            Type = "Listening"
                        })
                        .ToListAsync();

                case "speaking":
                    return await _context.SpeakingExamSets
                        .Where(s => examSetIds.Contains(s.ExamSetId))
                        .Select(s => new ExamSetSummaryDto
                        {
                            ExamSetId = s.ExamSetId,
                            ExamSetTitle = s.ExamSetTitle,
                            ExamSetCode = s.ExamSetCode,
                            TotalQuestions = s.TotalQuestions,
                            QuestionCount = _context.SpeakingExams.Count(e => e.ExamSetId == s.ExamSetId),
                            Type = "Speaking"
                        })
                        .ToListAsync();

                case "writing":
                    return await _context.WritingExamSets
                        .Where(w => examSetIds.Contains(w.ExamSetId))
                        .Select(w => new ExamSetSummaryDto
                        {
                            ExamSetId = w.ExamSetId,
                            ExamSetTitle = w.ExamSetTitle,
                            ExamSetCode = w.ExamSetCode,
                            TotalQuestions = w.TotalQuestions,
                            QuestionCount = _context.WritingExams.Count(e => e.ExamSetId == w.ExamSetId),
                            Type = "Writing"
                        })
                        .ToListAsync();

                default:
                    return new List<ExamSetSummaryDto>();
            }
        }

        // POST: api/ExamCourse
        [HttpPost]
        public async Task<ActionResult<ExamCourseDto>> CreateExamCourse([FromBody] CreateExamCourseDto request)
        {
            var examCourse = new ExamCourse
            {
                CourseTitle = request.CourseTitle,
                CourseCode = request.CourseCode ?? $"EC_{DateTime.Now:yyyyMMddHHmmss}",
                Description = request.Description ?? "",
                ExamType = request.ExamType,
                CreatedAt = DateTime.Now
            };

            _context.ExamCourse.Add(examCourse);
            await _context.SaveChangesAsync();

            // Assign exam sets to the course
            await AssignExamSetsToExamCourse(examCourse.ExamCourseId, request.ExamSetIds, request.ExamType);

            // Return DTO instead of entity to avoid reference loops
            var result = new
            {
                examCourse.ExamCourseId,
                examCourse.CourseTitle,
                examCourse.CourseCode,
                examCourse.Description,
                examCourse.ExamType,
                examCourse.CreatedAt,
                ExamSetCount = request.ExamSetIds.Count
            };

            return CreatedAtAction(nameof(GetExamCourse), new { id = examCourse.ExamCourseId }, result);
        }

        // PUT: api/ExamCourse/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExamCourse(int id, [FromBody] UpdateExamCourseDto request)
        {
            var examCourse = await _context.ExamCourse.FindAsync(id);
            if (examCourse == null)
                return NotFound();

            examCourse.CourseTitle = request.CourseTitle;
            examCourse.Description = request.Description;

            // Update exam sets assignment
            await RemoveExamSetsFromExamCourse(id, examCourse.ExamType);
            await AssignExamSetsToExamCourse(id, request.ExamSetIds, examCourse.ExamType);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/ExamCourse/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<DeleteResultDto>> DeleteExamCourse(int id, [FromBody] DeleteExamCourseDto? deleteRequest = null)
        {
            try
            {
                var examCourse = await _context.ExamCourse.FindAsync(id);
                if (examCourse == null)
                    return NotFound(new DeleteResultDto
                    {
                        Success = false,
                        Message = $"Exam course with ID {id} not found",
                        DeletedExamCourseId = id,
                        DeletedAt = DateTime.Now
                    });

                // Remove submissions first (if any)
                var submissions = await _context.Submissions
                    .Where(s => s.ExamCourseId == id)
                    .ToListAsync();

                var submissionsCount = submissions.Count;
                if (submissions.Any())
                {
                    _context.Submissions.RemoveRange(submissions);
                    Console.WriteLine($"Removing {submissionsCount} submissions for exam course {id}");
                }

                // Remove all exam sets assignments
                var assignments = await _context.ExamCourseExamSets
                    .Where(eces => eces.ExamCourseId == id)
                    .ToListAsync();

                var assignmentsCount = assignments.Count;
                if (assignments.Any())
                {
                    _context.ExamCourseExamSets.RemoveRange(assignments);
                    Console.WriteLine($"Removing {assignmentsCount} exam set assignments for exam course {id}");
                }

                // Finally remove the exam course
                _context.ExamCourse.Remove(examCourse);
                
                // Save all changes
                await _context.SaveChangesAsync();
                Console.WriteLine($"Successfully deleted exam course {id}. Reason: {deleteRequest?.Reason ?? "No reason provided"}");

                return Ok(new DeleteResultDto
                {
                    Success = true,
                    Message = $"Successfully deleted exam course '{examCourse.CourseTitle}'",
                    DeletedExamCourseId = id,
                    DeletedSubmissionsCount = submissionsCount,
                    DeletedAssignmentsCount = assignmentsCount,
                    DeletedAt = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                // Log the exception details
                Console.WriteLine($"Error deleting exam course {id}: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                return BadRequest(new DeleteResultDto
                {
                    Success = false,
                    Message = $"Failed to delete exam course: {ex.Message}",
                    DeletedExamCourseId = id,
                    DeletedAt = DateTime.Now
                });
            }
        }

        // GET: api/ExamCourse/available-examsets/{examType}
        [HttpGet("available-examsets/{examType}")]
        public async Task<ActionResult<IEnumerable<ExamSetSummaryDto>>> GetAvailableExamSets(string examType)
        {
            switch (examType.ToLower())
            {
                case "reading":
                    var readingExamSets = await _context.ReadingExamSets
                        .Select(r => new ExamSetSummaryDto
                        {
                            ExamSetId = r.ExamSetId,
                            ExamSetTitle = r.ExamSetTitle,
                            ExamSetCode = r.ExamSetCode,
                            TotalQuestions = r.TotalQuestions,
                            QuestionCount = _context.ReadingExams.Count(e => e.ExamSetId == r.ExamSetId),
                            Type = "Reading"
                        })
                        .ToListAsync();
                    return Ok(readingExamSets);

                case "listening":
                    var listeningExamSets = await _context.ListeningExamSets
                        .Select(l => new ExamSetSummaryDto
                        {
                            ExamSetId = l.ExamSetId,
                            ExamSetTitle = l.ExamSetTitle,
                            ExamSetCode = l.ExamSetCode,
                            TotalQuestions = l.TotalQuestions,
                            QuestionCount = _context.ListeningExams.Count(e => e.ExamSetId == l.ExamSetId),
                            Type = "Listening"
                        })
                        .ToListAsync();
                    return Ok(listeningExamSets);

                case "speaking":
                    var speakingExamSets = await _context.SpeakingExamSets
                        .Select(s => new ExamSetSummaryDto
                        {
                            ExamSetId = s.ExamSetId,
                            ExamSetTitle = s.ExamSetTitle,
                            ExamSetCode = s.ExamSetCode,
                            TotalQuestions = s.TotalQuestions,
                            QuestionCount = _context.SpeakingExams.Count(e => e.ExamSetId == s.ExamSetId),
                            Type = "Speaking"
                        })
                        .ToListAsync();
                    return Ok(speakingExamSets);

                case "writing":
                    var writingExamSets = await _context.WritingExamSets
                        .Select(w => new ExamSetSummaryDto
                        {
                            ExamSetId = w.ExamSetId,
                            ExamSetTitle = w.ExamSetTitle,
                            ExamSetCode = w.ExamSetCode,
                            TotalQuestions = w.TotalQuestions,
                            QuestionCount = _context.WritingExams.Count(e => e.ExamSetId == w.ExamSetId),
                            Type = "Writing"
                        })
                        .ToListAsync();
                    return Ok(writingExamSets);

                default:
                    return BadRequest("Invalid exam type");
            }
        }

        private async Task AssignExamSetsToExamCourse(int examCourseId, List<int> examSetIds, string examType)
        {
            foreach (var examSetId in examSetIds)
            {
                // Check if this assignment already exists
                var existingAssignment = await _context.ExamCourseExamSets
                    .FirstOrDefaultAsync(eces => eces.ExamCourseId == examCourseId && 
                                                eces.ExamSetId == examSetId && 
                                                eces.ExamSetType == examType);

                if (existingAssignment == null)
                {
                    var assignment = new ExamCourseExamSet
                    {
                        ExamCourseId = examCourseId,
                        ExamSetId = examSetId,
                        ExamSetType = examType,
                        AssignedAt = DateTime.Now
                    };

                    _context.ExamCourseExamSets.Add(assignment);
                }
            }

            await _context.SaveChangesAsync();
        }

        private async Task RemoveExamSetsFromExamCourse(int examCourseId, string examType)
        {
            var assignments = await _context.ExamCourseExamSets
                .Where(eces => eces.ExamCourseId == examCourseId && eces.ExamSetType == examType)
                .ToListAsync();

            _context.ExamCourseExamSets.RemoveRange(assignments);
            await _context.SaveChangesAsync();
        }
    }
}