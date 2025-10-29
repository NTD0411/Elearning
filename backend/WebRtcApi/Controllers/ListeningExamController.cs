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
    public class ListeningExamController : ControllerBase
    {
        private readonly IListeningExamRepository _repository;
        private readonly DatabaseContext _context;

        public ListeningExamController(IListeningExamRepository repository, DatabaseContext context)
        {
            _repository = repository;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ListeningExamDto>>> GetAll()
        {
            var listeningExams = await _repository.GetAllAsync();
            var listeningExamDtos = listeningExams.Select(l => new ListeningExamDto
            {
                ListeningExamId = l.ListeningExamId,
                ExamSetId = l.ExamSetId,
                AudioUrl = l.AudioUrl,
                QuestionText = l.QuestionText,
                OptionA = l.OptionA,
                OptionB = l.OptionB,
                OptionC = l.OptionC,
                OptionD = l.OptionD,
                AnswerFill = l.AnswerFill,
                CorrectAnswer = l.CorrectAnswer,
                CreatedAt = l.CreatedAt
            });

            return Ok(listeningExamDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ListeningExamDto>> GetById(int id)
        {
            var listeningExam = await _repository.GetByIdAsync(id);
            if (listeningExam == null)
                return NotFound($"Listening exam with ID {id} not found.");

            var listeningExamDto = new ListeningExamDto
            {
                ListeningExamId = listeningExam.ListeningExamId,
                ExamSetId = listeningExam.ExamSetId,
                AudioUrl = listeningExam.AudioUrl,
                QuestionText = listeningExam.QuestionText,
                OptionA = listeningExam.OptionA,
                OptionB = listeningExam.OptionB,
                OptionC = listeningExam.OptionC,
                OptionD = listeningExam.OptionD,
                AnswerFill = listeningExam.AnswerFill,
                CorrectAnswer = listeningExam.CorrectAnswer,
                CreatedAt = listeningExam.CreatedAt
            };

            return Ok(listeningExamDto);
        }

        [HttpGet("examset/{examSetId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetByExamSetId(int examSetId)
        {
            var listeningExams = await _repository.GetByExamSetIdAsync(examSetId);
            
            // Get the exam set to include image and audio information
            var examSet = await _context.ListeningExamSets.FindAsync(examSetId);
            
            // Determine audio URL - prioritize exam set audio over question audio
            string? audioUrl = null;
            if (!string.IsNullOrEmpty(examSet?.AudioUrl))
            {
                // Use exam set audio URL
                audioUrl = examSet.AudioUrl.StartsWith("http") ? examSet.AudioUrl : $"http://localhost:5074/{examSet.AudioUrl.TrimStart('/')}";
            }
            
            var result = listeningExams.Select(l => new
            {
                questionId = l.ListeningExamId,
                questionText = l.QuestionText,
                questionOrder = l.ListeningExamId, // Using ID as order for now
                // Use exam set audio if available, otherwise fall back to question audio (backward compatibility)
                audioUrl = audioUrl ?? (string.IsNullOrEmpty(l.AudioUrl) ? null : 
                          (l.AudioUrl.StartsWith("http") ? l.AudioUrl : $"http://localhost:5074/{l.AudioUrl.TrimStart('/')}")),
                // Include exam set image information
                listeningImage = examSet?.ListeningImage,
                options = new[]
                {
                    l.OptionA,
                    l.OptionB, 
                    l.OptionC,
                    l.OptionD,
                    l.OptionE,
                    l.OptionF,
                    l.OptionG,
                    l.OptionH
                }.Where(o => !string.IsNullOrEmpty(o)).ToArray(),
                correctAnswer = l.CorrectAnswer,
                points = 1 // Default points
            }).OrderBy(l => l.questionId);

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<ListeningExamDto>> Create([FromBody] CreateListeningExamDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var listeningExam = await _repository.CreateAsync(createDto);
            var listeningExamDto = new ListeningExamDto
            {
                ListeningExamId = listeningExam.ListeningExamId,
                ExamSetId = listeningExam.ExamSetId,
                AudioUrl = listeningExam.AudioUrl,
                QuestionText = listeningExam.QuestionText,
                OptionA = listeningExam.OptionA,
                OptionB = listeningExam.OptionB,
                OptionC = listeningExam.OptionC,
                OptionD = listeningExam.OptionD,
                AnswerFill = listeningExam.AnswerFill,
                CorrectAnswer = listeningExam.CorrectAnswer,
                CreatedAt = listeningExam.CreatedAt
            };

            return CreatedAtAction(nameof(GetById), new { id = listeningExam.ListeningExamId }, listeningExamDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ListeningExamDto>> Update(int id, [FromBody] UpdateListeningExamDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var listeningExam = await _repository.UpdateAsync(id, updateDto);
            if (listeningExam == null)
                return NotFound($"Listening exam with ID {id} not found.");

            var listeningExamDto = new ListeningExamDto
            {
                ListeningExamId = listeningExam.ListeningExamId,
                ExamSetId = listeningExam.ExamSetId,
                AudioUrl = listeningExam.AudioUrl,
                QuestionText = listeningExam.QuestionText,
                OptionA = listeningExam.OptionA,
                OptionB = listeningExam.OptionB,
                OptionC = listeningExam.OptionC,
                OptionD = listeningExam.OptionD,
                AnswerFill = listeningExam.AnswerFill,
                CorrectAnswer = listeningExam.CorrectAnswer,
                CreatedAt = listeningExam.CreatedAt
            };

            return Ok(listeningExamDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _repository.DeleteAsync(id);
            if (!result)
                return NotFound($"Listening exam with ID {id} not found.");

            return NoContent();
        }

        // ========== CHỨC NĂNG LÀM BÀI LISTENING ==========

        [HttpPost("submit")]
        public async Task<ActionResult<ListeningResultDto>> SubmitListeningExam([FromBody] ListeningSubmissionDto submissionDto)
        {
            try
            {
                // Kiểm tra user tồn tại
                var user = await _context.Users.FindAsync(submissionDto.UserId);
                if (user == null)
                    return BadRequest($"User with ID {submissionDto.UserId} not found.");

                // Kiểm tra exam set tồn tại
                var examSet = await _context.ListeningExamSets.FindAsync(submissionDto.ExamSetId);
                if (examSet == null)
                    return BadRequest($"Listening exam set with ID {submissionDto.ExamSetId} not found.");

                // Lấy danh sách câu hỏi để tính điểm
                var questions = await _context.ListeningExams
                    .Where(l => l.ExamSetId == submissionDto.ExamSetId)
                    .ToListAsync();

                // Tính điểm
                var correctAnswers = 0;
                var answerResults = new List<ListeningAnswerResultDto>();

                foreach (var answer in submissionDto.Answers)
                {
                    var question = questions.FirstOrDefault(q => q.ListeningExamId == answer.QuestionId);
                    if (question == null) continue;

                    var userAnswer = answer.AnswerChoice ?? answer.AnswerFill ?? "";
                    var isCorrect = string.Equals(userAnswer.Trim(), question.CorrectAnswer.Trim(), StringComparison.OrdinalIgnoreCase);

                    if (isCorrect) correctAnswers++;

                    answerResults.Add(new ListeningAnswerResultDto
                    {
                        QuestionId = question.ListeningExamId,
                        QuestionText = question.QuestionText,
                        UserAnswer = userAnswer,
                        CorrectAnswer = question.CorrectAnswer,
                        IsCorrect = isCorrect,
                        OptionA = question.OptionA,
                        OptionB = question.OptionB,
                        OptionC = question.OptionC,
                        OptionD = question.OptionD,
                        AudioUrl = question.AudioUrl
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
                    ExamType = "Listening",
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
                var result = new ListeningResultDto
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
                return BadRequest($"Error submitting listening exam: {ex.Message}");
            }
        }

        [HttpGet("result/{submissionId}")]
        public async Task<ActionResult<ListeningResultDto>> GetListeningResult(int submissionId)
        {
            try
            {
                var submission = await _context.Submissions
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.SubmissionId == submissionId && s.ExamType == "Listening");

                if (submission == null)
                    return NotFound($"Listening submission with ID {submissionId} not found.");

                var examSet = await _context.ListeningExamSets.FindAsync(submission.ExamId);
                if (examSet == null)
                    return NotFound("Exam set not found.");

                // Parse answers
                var answers = JsonSerializer.Deserialize<List<ListeningAnswerDto>>(submission.Answers ?? "[]");
                
                // Lấy câu hỏi để tạo kết quả chi tiết
                var questions = await _context.ListeningExams
                    .Where(l => l.ExamSetId == submission.ExamId)
                    .ToListAsync();

                var answerResults = new List<ListeningAnswerResultDto>();
                var correctAnswers = 0;

                foreach (var answer in answers)
                {
                    var question = questions.FirstOrDefault(q => q.ListeningExamId == answer.QuestionId);
                    if (question == null) continue;

                    var userAnswer = answer.AnswerChoice ?? answer.AnswerFill ?? "";
                    var isCorrect = string.Equals(userAnswer.Trim(), question.CorrectAnswer.Trim(), StringComparison.OrdinalIgnoreCase);

                    if (isCorrect) correctAnswers++;

                    answerResults.Add(new ListeningAnswerResultDto
                    {
                        QuestionId = question.ListeningExamId,
                        QuestionText = question.QuestionText,
                        UserAnswer = userAnswer,
                        CorrectAnswer = question.CorrectAnswer,
                        IsCorrect = isCorrect,
                        OptionA = question.OptionA,
                        OptionB = question.OptionB,
                        OptionC = question.OptionC,
                        OptionD = question.OptionD,
                        AudioUrl = question.AudioUrl
                    });
                }

                var result = new ListeningResultDto
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
                return BadRequest($"Error getting listening result: {ex.Message}");
            }
        }

        [HttpGet("user/{userId}/history")]
        public async Task<ActionResult<IEnumerable<ListeningResultDto>>> GetUserListeningHistory(int userId)
        {
            try
            {
                var submissions = await _context.Submissions
                    .Where(s => s.UserId == userId && s.ExamType == "Listening")
                    .OrderByDescending(s => s.SubmittedAt)
                    .ToListAsync();

                var results = new List<ListeningResultDto>();

                foreach (var submission in submissions)
                {
                    var examSet = await _context.ListeningExamSets.FindAsync(submission.ExamId);
                    if (examSet == null) continue;

                    var answers = JsonSerializer.Deserialize<List<ListeningAnswerDto>>(submission.Answers ?? "[]");
                    var questions = await _context.ListeningExams
                        .Where(l => l.ExamSetId == submission.ExamId)
                        .ToListAsync();

                    var correctAnswers = 0;
                    foreach (var answer in answers)
                    {
                        var question = questions.FirstOrDefault(q => q.ListeningExamId == answer.QuestionId);
                        if (question == null) continue;

                        var userAnswer = answer.AnswerChoice ?? answer.AnswerFill ?? "";
                        var isCorrect = string.Equals(userAnswer.Trim(), question.CorrectAnswer.Trim(), StringComparison.OrdinalIgnoreCase);
                        if (isCorrect) correctAnswers++;
                    }

                    results.Add(new ListeningResultDto
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
                        AnswerResults = new List<ListeningAnswerResultDto>() // Không cần chi tiết cho history
                    });
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting user listening history: {ex.Message}");
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