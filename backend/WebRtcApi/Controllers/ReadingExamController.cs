using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebRtcApi.Repositories.Exams;
using WebRtcApi.Dtos.Exams;
using WebRtcApi.Dtos.Submissions;
using WebRtcApi.Data;
using WebRtcApi.Models;
using System.Text.Json;

namespace WebRtcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReadingExamController : ControllerBase
    {
        private readonly IReadingExamRepository _repository;
        private readonly DatabaseContext _context;

        public ReadingExamController(IReadingExamRepository repository, DatabaseContext context)
        {
            _repository = repository;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReadingExamDto>>> GetAll()
        {
            var readingExams = await _repository.GetAllAsync();
            var readingExamDtos = readingExams.Select(r => new ReadingExamDto
            {
                ReadingExamId = r.ReadingExamId,
                ExamSetId = r.ExamSetId,
                QuestionText = r.QuestionText,
                OptionA = r.OptionA,
                OptionB = r.OptionB,
                OptionC = r.OptionC,
                OptionD = r.OptionD,
                AnswerFill = r.AnswerFill,
                CorrectAnswer = r.CorrectAnswer,
                CreatedAt = r.CreatedAt
            });

            return Ok(readingExamDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ReadingExamDto>> GetById(int id)
        {
            var readingExam = await _repository.GetByIdAsync(id);
            if (readingExam == null)
                return NotFound($"Reading exam with ID {id} not found.");

            var readingExamDto = new ReadingExamDto
            {
                ReadingExamId = readingExam.ReadingExamId,
                ExamSetId = readingExam.ExamSetId,
                QuestionText = readingExam.QuestionText,
                OptionA = readingExam.OptionA,
                OptionB = readingExam.OptionB,
                OptionC = readingExam.OptionC,
                OptionD = readingExam.OptionD,
                AnswerFill = readingExam.AnswerFill,
                CorrectAnswer = readingExam.CorrectAnswer,
                CreatedAt = readingExam.CreatedAt
            };

            return Ok(readingExamDto);
        }

        [HttpGet("examset/{examSetId}")]
        public async Task<ActionResult<IEnumerable<ReadingExamDto>>> GetByExamSetId(int examSetId)
        {
            var readingExams = await _repository.GetByExamSetIdAsync(examSetId);
            var readingExamDtos = readingExams.Select(r => new ReadingExamDto
            {
                ReadingExamId = r.ReadingExamId,
                ExamSetId = r.ExamSetId,
                QuestionText = r.QuestionText,
                OptionA = r.OptionA,
                OptionB = r.OptionB,
                OptionC = r.OptionC,
                OptionD = r.OptionD,
                AnswerFill = r.AnswerFill,
                CorrectAnswer = r.CorrectAnswer,
                CreatedAt = r.CreatedAt
            });

            return Ok(readingExamDtos);
        }

        [HttpPost]
        public async Task<ActionResult<ReadingExamDto>> Create([FromBody] CreateReadingExamDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var readingExam = await _repository.CreateAsync(createDto);
            var readingExamDto = new ReadingExamDto
            {
                ReadingExamId = readingExam.ReadingExamId,
                ExamSetId = readingExam.ExamSetId,
                QuestionText = readingExam.QuestionText,
                OptionA = readingExam.OptionA,
                OptionB = readingExam.OptionB,
                OptionC = readingExam.OptionC,
                OptionD = readingExam.OptionD,
                AnswerFill = readingExam.AnswerFill,
                CorrectAnswer = readingExam.CorrectAnswer,
                CreatedAt = readingExam.CreatedAt
            };

            return CreatedAtAction(nameof(GetById), new { id = readingExam.ReadingExamId }, readingExamDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ReadingExamDto>> Update(int id, [FromBody] UpdateReadingExamDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var readingExam = await _repository.UpdateAsync(id, updateDto);
            if (readingExam == null)
                return NotFound($"Reading exam with ID {id} not found.");

            var readingExamDto = new ReadingExamDto
            {
                ReadingExamId = readingExam.ReadingExamId,
                ExamSetId = readingExam.ExamSetId,
                QuestionText = readingExam.QuestionText,
                OptionA = readingExam.OptionA,
                OptionB = readingExam.OptionB,
                OptionC = readingExam.OptionC,
                OptionD = readingExam.OptionD,
                AnswerFill = readingExam.AnswerFill,
                CorrectAnswer = readingExam.CorrectAnswer,
                CreatedAt = readingExam.CreatedAt
            };

            return Ok(readingExamDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _repository.DeleteAsync(id);
            if (!result)
                return NotFound($"Reading exam with ID {id} not found.");

            return NoContent();
        }

        // ========== CHỨC NĂNG LÀM BÀI READING ==========

        [HttpGet("examset/{examSetId}/questions")]
        public async Task<ActionResult<object>> GetExamQuestions(int examSetId)
        {
            try
            {
                // Lấy thông tin exam set
                var examSet = await _context.ReadingExamSets
                    .FirstOrDefaultAsync(r => r.ExamSetId == examSetId);

                if (examSet == null)
                    return NotFound($"Reading exam set with ID {examSetId} not found.");

                // Lấy danh sách câu hỏi
                var questions = await _context.ReadingExams
                    .Where(r => r.ExamSetId == examSetId)
                    .OrderBy(r => r.ReadingExamId)
                    .ToListAsync();

                var result = new
                {
                    examSetId = examSet.ExamSetId,
                    examSetTitle = examSet.ExamSetTitle,
                    examSetCode = examSet.ExamSetCode,
                    readingContext = examSet.ReadingContext,
                    readingImage = examSet.ReadingImage,
                    totalQuestions = examSet.TotalQuestions,
                    questions = questions.Select((q, index) => new
                    {
                        questionId = q.ReadingExamId,
                        questionOrder = index + 1,
                        questionText = q.QuestionText,
                        options = new[]
                        {
                            q.OptionA,
                            q.OptionB,
                            q.OptionC,
                            q.OptionD,
                            q.OptionE,
                            q.OptionF,
                            q.OptionG,
                            q.OptionH
                        }.Where(o => !string.IsNullOrEmpty(o)).ToArray(),
                        answerFill = q.AnswerFill,
                        questionType = !string.IsNullOrEmpty(q.AnswerFill) ? "fill" : "choice"
                    }).ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting exam questions: {ex.Message}");
            }
        }

        [HttpPost("submit")]
        public async Task<ActionResult<ReadingResultDto>> SubmitReadingExam([FromBody] ReadingSubmissionDto submissionDto)
        {
            try
            {
                // Kiểm tra user tồn tại
                var user = await _context.Users.FindAsync(submissionDto.UserId);
                if (user == null)
                    return BadRequest($"User with ID {submissionDto.UserId} not found.");

                // Kiểm tra exam set tồn tại
                var examSet = await _context.ReadingExamSets.FindAsync(submissionDto.ExamSetId);
                if (examSet == null)
                    return BadRequest($"Reading exam set with ID {submissionDto.ExamSetId} not found.");

                // Lấy danh sách câu hỏi để tính điểm
                var questions = await _context.ReadingExams
                    .Where(r => r.ExamSetId == submissionDto.ExamSetId)
                    .ToListAsync();

                // Tính điểm
                var correctAnswers = 0;
                var answerResults = new List<ReadingAnswerResultDto>();

                foreach (var answer in submissionDto.Answers)
                {
                    var question = questions.FirstOrDefault(q => q.ReadingExamId == answer.QuestionId);
                    if (question == null) continue;

                    var userAnswer = answer.AnswerChoice ?? answer.AnswerFill ?? "";
                    var isCorrect = string.Equals(userAnswer.Trim(), question.CorrectAnswer.Trim(), StringComparison.OrdinalIgnoreCase);

                    if (isCorrect) correctAnswers++;

                    answerResults.Add(new ReadingAnswerResultDto
                    {
                        QuestionId = question.ReadingExamId,
                        QuestionText = question.QuestionText,
                        UserAnswer = userAnswer,
                        CorrectAnswer = question.CorrectAnswer,
                        IsCorrect = isCorrect,
                        OptionA = question.OptionA,
                        OptionB = question.OptionB,
                        OptionC = question.OptionC,
                        OptionD = question.OptionD
                    });
                }

                // Tính điểm IELTS band (0-9)
                var totalQuestions = questions.Count;
                var percentage = totalQuestions > 0 ? (double)correctAnswers / totalQuestions : 0;
                var score = CalculateIELTSBand(percentage);

                // Tạo submission
                var submission = new Submission
                {
                    UserId = submissionDto.UserId,
                    ExamCourseId = examSet.ExamCourseId ?? 1,
                    ExamType = "Reading",
                    ExamId = submissionDto.ExamSetId,
                    Answers = JsonSerializer.Serialize(submissionDto.Answers),
                    TimeSpent = submissionDto.TimeSpent,
                    SubmittedAt = submissionDto.SubmittedAt,
                    AiScore = score,
                    Status = "Completed"
                };

                _context.Submissions.Add(submission);
                await _context.SaveChangesAsync();

                // Tạo kết quả
                var result = new ReadingResultDto
                {
                    SubmissionId = submission.SubmissionId,
                    UserId = submissionDto.UserId,
                    ExamSetId = submissionDto.ExamSetId,
                    ExamSetTitle = examSet.ExamSetTitle,
                    TotalQuestions = totalQuestions,
                    CorrectAnswers = correctAnswers,
                    IncorrectAnswers = totalQuestions - correctAnswers,
                    Score = score,
                    TimeSpent = submissionDto.TimeSpent,
                    SubmittedAt = submissionDto.SubmittedAt,
                    AnswerResults = answerResults
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error submitting reading exam: {ex.Message}");
            }
        }

        [HttpGet("result/{submissionId}")]
        public async Task<ActionResult<ReadingResultDto>> GetReadingResult(int submissionId)
        {
            try
            {
                var submission = await _context.Submissions
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.SubmissionId == submissionId && s.ExamType == "Reading");

                if (submission == null)
                    return NotFound($"Reading submission with ID {submissionId} not found.");

                var examSet = await _context.ReadingExamSets.FindAsync(submission.ExamId);
                if (examSet == null)
                    return NotFound("Exam set not found.");

                // Parse answers
                var answers = JsonSerializer.Deserialize<List<ReadingAnswerDto>>(submission.Answers ?? "[]");
                
                // Lấy câu hỏi để tạo kết quả chi tiết
                var questions = await _context.ReadingExams
                    .Where(r => r.ExamSetId == submission.ExamId)
                    .ToListAsync();

                var answerResults = new List<ReadingAnswerResultDto>();
                var correctAnswers = 0;

                foreach (var answer in answers)
                {
                    var question = questions.FirstOrDefault(q => q.ReadingExamId == answer.QuestionId);
                    if (question == null) continue;

                    var userAnswer = answer.AnswerChoice ?? answer.AnswerFill ?? "";
                    var isCorrect = string.Equals(userAnswer.Trim(), question.CorrectAnswer.Trim(), StringComparison.OrdinalIgnoreCase);

                    if (isCorrect) correctAnswers++;

                    answerResults.Add(new ReadingAnswerResultDto
                    {
                        QuestionId = question.ReadingExamId,
                        QuestionText = question.QuestionText,
                        UserAnswer = userAnswer,
                        CorrectAnswer = question.CorrectAnswer,
                        IsCorrect = isCorrect,
                        OptionA = question.OptionA,
                        OptionB = question.OptionB,
                        OptionC = question.OptionC,
                        OptionD = question.OptionD
                    });
                }

                var result = new ReadingResultDto
                {
                    SubmissionId = submission.SubmissionId,
                    UserId = submission.UserId ?? 0,
                    ExamSetId = submission.ExamId ?? 0,
                    ExamSetTitle = examSet.ExamSetTitle,
                    TotalQuestions = questions.Count,
                    CorrectAnswers = correctAnswers,
                    IncorrectAnswers = questions.Count - correctAnswers,
                    Score = submission.AiScore ?? 0,
                    TimeSpent = submission.TimeSpent ?? 0,
                    SubmittedAt = submission.SubmittedAt ?? DateTime.UtcNow,
                    AnswerResults = answerResults
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting reading result: {ex.Message}");
            }
        }

        [HttpGet("user/{userId}/history")]
        public async Task<ActionResult<IEnumerable<ReadingResultDto>>> GetUserReadingHistory(int userId)
        {
            try
            {
                var submissions = await _context.Submissions
                    .Where(s => s.UserId == userId && s.ExamType == "Reading")
                    .OrderByDescending(s => s.SubmittedAt)
                    .ToListAsync();

                var results = new List<ReadingResultDto>();

                foreach (var submission in submissions)
                {
                    var examSet = await _context.ReadingExamSets.FindAsync(submission.ExamId);
                    if (examSet == null) continue;

                    var answers = JsonSerializer.Deserialize<List<ReadingAnswerDto>>(submission.Answers ?? "[]");
                    var questions = await _context.ReadingExams
                        .Where(r => r.ExamSetId == submission.ExamId)
                        .ToListAsync();

                    var correctAnswers = 0;
                    foreach (var answer in answers)
                    {
                        var question = questions.FirstOrDefault(q => q.ReadingExamId == answer.QuestionId);
                        if (question == null) continue;

                        var userAnswer = answer.AnswerChoice ?? answer.AnswerFill ?? "";
                        var isCorrect = string.Equals(userAnswer.Trim(), question.CorrectAnswer.Trim(), StringComparison.OrdinalIgnoreCase);
                        if (isCorrect) correctAnswers++;
                    }

                    results.Add(new ReadingResultDto
                    {
                        SubmissionId = submission.SubmissionId,
                        UserId = submission.UserId ?? 0,
                        ExamSetId = submission.ExamId ?? 0,
                        ExamSetTitle = examSet.ExamSetTitle,
                        TotalQuestions = questions.Count,
                        CorrectAnswers = correctAnswers,
                        IncorrectAnswers = questions.Count - correctAnswers,
                        Score = submission.AiScore ?? 0,
                        TimeSpent = submission.TimeSpent ?? 0,
                        SubmittedAt = submission.SubmittedAt ?? DateTime.UtcNow,
                        AnswerResults = new List<ReadingAnswerResultDto>() // Không cần chi tiết cho history
                    });
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting user reading history: {ex.Message}");
            }
        }

        private decimal CalculateIELTSBand(double percentage)
        {
            // Chuyển đổi phần trăm thành IELTS band score (0-9)
            if (percentage >= 0.95) return 9.0m;
            if (percentage >= 0.90) return 8.5m;
            if (percentage >= 0.85) return 8.0m;
            if (percentage >= 0.80) return 7.5m;
            if (percentage >= 0.75) return 7.0m;
            if (percentage >= 0.70) return 6.5m;
            if (percentage >= 0.65) return 6.0m;
            if (percentage >= 0.60) return 5.5m;
            if (percentage >= 0.55) return 5.0m;
            if (percentage >= 0.50) return 4.5m;
            if (percentage >= 0.45) return 4.0m;
            if (percentage >= 0.40) return 3.5m;
            if (percentage >= 0.35) return 3.0m;
            if (percentage >= 0.30) return 2.5m;
            if (percentage >= 0.25) return 2.0m;
            if (percentage >= 0.20) return 1.5m;
            if (percentage >= 0.15) return 1.0m;
            return 0.5m;
        }
    }
}