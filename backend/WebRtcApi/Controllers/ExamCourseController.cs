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
        private readonly ILogger<ExamCourseController> _logger;

        public ExamCourseController(DatabaseContext context, ILogger<ExamCourseController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/ExamCourse
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExamCourseDto>>> GetExamCourses()
        {
            try
            {
                _logger.LogInformation("Fetching all exam courses");
                
                if (_context.ExamCourse == null)
                {
                    _logger.LogError("ExamCourse DbSet is null");
                    return StatusCode(500, "Database configuration error");
                }

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

                _logger.LogInformation($"Successfully fetched {examCourses.Count} exam courses");
                return Ok(examCourses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching exam courses");
                return StatusCode(500, new { message = "Internal server error while fetching exam courses", error = ex.Message });
            }
        }

        // GET: api/ExamCourse/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ExamCourseDetailDto>> GetExamCourse(int id)
        {
            try
            {
                _logger.LogInformation($"Fetching exam course with id: {id}");

                if (_context.ExamCourse == null)
                {
                    _logger.LogError("ExamCourse DbSet is null");
                    return StatusCode(500, "Database configuration error");
                }

                var examCourse = await _context.ExamCourse
                    .Where(ec => ec.ExamCourseId == id)
                    .FirstOrDefaultAsync();

                if (examCourse == null)
                {
                    _logger.LogWarning($"Exam course with id {id} not found");
                    return NotFound($"Exam course with ID {id} not found");
                }

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

                _logger.LogInformation($"Successfully fetched exam course with id: {id}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching exam course with id: {id}");
                return StatusCode(500, new { message = "Internal server error while fetching exam course", error = ex.Message });
            }
        }

        private async Task<List<ExamSetSummaryDto>> GetExamSetsForCourse(int examCourseId, string examType)
        {
            try
            {
                _logger.LogInformation($"Fetching exam sets for course {examCourseId} of type {examType}");

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
                        _logger.LogWarning($"Invalid exam type: {examType}");
                        return new List<ExamSetSummaryDto>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching exam sets for course {examCourseId} of type {examType}");
                throw;
            }
        }

        // POST: api/ExamCourse
        [HttpPost]
        public async Task<ActionResult<ExamCourseDto>> CreateExamCourse([FromBody] CreateExamCourseDto request)
        {
            try
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating exam course");
                return StatusCode(500, new { message = "Internal server error while creating exam course", error = ex.Message });
            }
        }

        // PUT: api/ExamCourse/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExamCourse(int id, [FromBody] UpdateExamCourseDto request)
        {
            try
            {
                var examCourse = await _context.ExamCourse.FindAsync(id);
                if (examCourse == null)
                {
                    _logger.LogWarning($"Exam course with id {id} not found");
                    return NotFound($"Exam course with ID {id} not found");
                }

                examCourse.CourseTitle = request.CourseTitle;
                examCourse.Description = request.Description;

                // Update exam sets assignment
                await RemoveExamSetsFromExamCourse(id, examCourse.ExamType);
                await AssignExamSetsToExamCourse(id, request.ExamSetIds, examCourse.ExamType);

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Successfully updated exam course with id: {id}");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating exam course with id: {id}");
                return StatusCode(500, new { message = "Internal server error while updating exam course", error = ex.Message });
            }
        }

        // DELETE: api/ExamCourse/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<DeleteResultDto>> DeleteExamCourse(int id, [FromBody] DeleteExamCourseDto? deleteRequest = null)
        {
            try
            {
                var examCourse = await _context.ExamCourse.FindAsync(id);
                if (examCourse == null)
                {
                    _logger.LogWarning($"Exam course with id {id} not found");
                    return NotFound(new DeleteResultDto
                    {
                        Success = false,
                        Message = $"Exam course with ID {id} not found",
                        DeletedExamCourseId = id,
                        DeletedAt = DateTime.Now
                    });
                }

                // Remove submissions first (if any)
                var submissions = await _context.Submissions
                    .Where(s => s.ExamCourseId == id)
                    .ToListAsync();

                var submissionsCount = submissions.Count;
                if (submissions.Any())
                {
                    _context.Submissions.RemoveRange(submissions);
                    _logger.LogInformation($"Removing {submissionsCount} submissions for exam course {id}");
                }

                // Remove all exam sets assignments
                var assignments = await _context.ExamCourseExamSets
                    .Where(eces => eces.ExamCourseId == id)
                    .ToListAsync();

                var assignmentsCount = assignments.Count;
                if (assignments.Any())
                {
                    _context.ExamCourseExamSets.RemoveRange(assignments);
                    _logger.LogInformation($"Removing {assignmentsCount} exam set assignments for exam course {id}");
                }

                // Finally remove the exam course
                _context.ExamCourse.Remove(examCourse);
                
                // Save all changes
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Successfully deleted exam course {id}. Reason: {deleteRequest?.Reason ?? "No reason provided"}");

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
                _logger.LogError(ex, $"Error deleting exam course with id: {id}");
                return StatusCode(500, new { message = "Internal server error while deleting exam course", error = ex.Message });
            }
        }

        // GET: api/ExamCourse/available-examsets/{examType}
        [HttpGet("available-examsets/{examType}")]
        public async Task<ActionResult<IEnumerable<ExamSetSummaryDto>>> GetAvailableExamSets(string examType)
        {
            try
            {
                _logger.LogInformation($"Fetching available exam sets for type: {examType}");

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
                        _logger.LogWarning($"Invalid exam type: {examType}");
                        return BadRequest("Invalid exam type");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching available exam sets for type: {examType}");
                return StatusCode(500, new { message = "Internal server error while fetching available exam sets", error = ex.Message });
            }
        }

        private async Task AssignExamSetsToExamCourse(int examCourseId, List<int> examSetIds, string examType)
        {
            try
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
                _logger.LogInformation($"Successfully assigned exam sets to course {examCourseId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error assigning exam sets to course {examCourseId}");
                throw;
            }
        }

        private async Task RemoveExamSetsFromExamCourse(int examCourseId, string examType)
        {
            try
            {
                var assignments = await _context.ExamCourseExamSets
                    .Where(eces => eces.ExamCourseId == examCourseId && eces.ExamSetType == examType)
                    .ToListAsync();

                _context.ExamCourseExamSets.RemoveRange(assignments);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Successfully removed exam sets from course {examCourseId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error removing exam sets from course {examCourseId}");
                throw;
            }
        }
    }
}