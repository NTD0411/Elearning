using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebRtcApi.Repositories.Exams;
using WebRtcApi.Dtos.Exams;
using WebRtcApi.Dtos.Submissions;
using WebRtcApi.Data;
using WebRtcApi.Services;
using WebRtcApi.Models;

namespace WebRtcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReadingExamController : ControllerBase
    {
        private readonly IReadingExamRepository _repository;
        private readonly DatabaseContext _context;
        private readonly ReadingListeningScoringService _scoringService;

        public ReadingExamController(IReadingExamRepository repository, DatabaseContext context, ReadingListeningScoringService scoringService)
        {
            _repository = repository;
            _context = context;
            _scoringService = scoringService;
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

        [HttpGet("examset/{examSetId}/take-exam")]
        public async Task<ActionResult<object>> GetExamForTaking(int examSetId)
        {
            try
            {
                // Get exam set details
                var examSet = await _context.ReadingExamSets
                    .FirstOrDefaultAsync(r => r.ExamSetId == examSetId);

                if (examSet == null)
                    return NotFound("Exam set not found");

                // Get questions for the exam
                var questions = await _repository.GetByExamSetIdAsync(examSetId);
                
                var examData = new
                {
                    examSetId = examSet.ExamSetId,
                    examTitle = examSet.ExamSetTitle,
                    examCode = examSet.ExamSetCode,
                    readingContext = examSet.ReadingContext,
                    readingImage = examSet.ReadingImage,
                    totalQuestions = examSet.TotalQuestions,
                    timeLimit = 60, // 60 minutes default
                    questions = questions.Select((q, index) => new
                    {
                        questionId = q.ReadingExamId,
                        questionNumber = index + 1,
                        questionText = q.QuestionText,
                        questionType = !string.IsNullOrEmpty(q.AnswerFill) ? "fill" : "multiple_choice",
                        options = !string.IsNullOrEmpty(q.AnswerFill) ? null : new[]
                        {
                            new { value = "A", text = q.OptionA },
                            new { value = "B", text = q.OptionB },
                            new { value = "C", text = q.OptionC },
                            new { value = "D", text = q.OptionD }
                        }.Where(o => !string.IsNullOrEmpty(o.text)).ToArray(),
                        points = 1
                    }).ToList()
                };

                return Ok(examData);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving exam: {ex.Message}");
            }
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

        [HttpPost("submit")]
        public async Task<ActionResult<ReadingSubmissionResultDto>> SubmitReadingExam([FromBody] ReadingSubmissionDto submissionDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Score the submission
                var result = await _scoringService.ScoreReadingSubmissionAsync(submissionDto);

                // Save submission to database
                var submission = new Submission
                {
                    UserId = submissionDto.UserId,
                    ExamCourseId = submissionDto.ExamCourseId,
                    ExamType = "reading",
                    ExamId = submissionDto.ExamSetId,
                    Answers = System.Text.Json.JsonSerializer.Serialize(submissionDto.Answers),
                    TimeSpent = submissionDto.TimeSpent,
                    SubmittedAt = submissionDto.SubmittedAt,
                    AiScore = result.Score,
                    Status = "Completed"
                };

                _context.Submissions.Add(submission);
                await _context.SaveChangesAsync();

                result.SubmissionId = submission.SubmissionId;

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error submitting reading exam: {ex.Message}");
            }
        }

        [HttpGet("result/{submissionId}")]
        public async Task<ActionResult<ReadingSubmissionResultDto>> GetReadingResult(int submissionId)
        {
            try
            {
                var submission = await _context.Submissions
                    .FirstOrDefaultAsync(s => s.SubmissionId == submissionId && s.ExamType == "reading");

                if (submission == null)
                    return NotFound("Submission not found");

                // Get the original answers
                var answers = System.Text.Json.JsonSerializer.Deserialize<List<ReadingAnswerDto>>(submission.Answers ?? "[]") ?? new List<ReadingAnswerDto>();

                // Get exam questions for detailed results
                var questions = await _context.ReadingExams
                    .Where(r => r.ExamSetId == submission.ExamId)
                    .ToListAsync();

                var questionResults = new List<ReadingQuestionResultDto>();
                int correctAnswers = 0;

                foreach (var answer in answers)
                {
                    var question = questions.FirstOrDefault(q => q.ReadingExamId == answer.QuestionId);
                    if (question == null) continue;

                    var userAnswer = !string.IsNullOrEmpty(answer.SelectedAnswer) 
                        ? answer.SelectedAnswer 
                        : answer.FillAnswer ?? "";

                    var correctAnswer = question.CorrectAnswer ?? "";
                    var isCorrect = !string.IsNullOrEmpty(userAnswer) && 
                        !string.IsNullOrEmpty(correctAnswer) &&
                        string.Equals(userAnswer.Trim(), correctAnswer.Trim(), StringComparison.OrdinalIgnoreCase);

                    if (isCorrect)
                        correctAnswers++;

                    questionResults.Add(new ReadingQuestionResultDto
                    {
                        QuestionId = answer.QuestionId,
                        UserAnswer = userAnswer,
                        CorrectAnswer = correctAnswer,
                        IsCorrect = isCorrect,
                        Points = isCorrect ? 1 : 0
                    });
                }

                var result = new ReadingSubmissionResultDto
                {
                    SubmissionId = submission.SubmissionId,
                    UserId = submission.UserId ?? 0,
                    ExamSetId = submission.ExamId ?? 0,
                    ExamCourseId = submission.ExamCourseId,
                    Answers = answers,
                    TimeSpent = submission.TimeSpent ?? 0,
                    SubmittedAt = submission.SubmittedAt ?? DateTime.UtcNow,
                    Score = submission.AiScore,
                    CorrectAnswers = correctAnswers,
                    TotalQuestions = questions.Count,
                    QuestionResults = questionResults,
                    Status = submission.Status ?? "submitted"
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving reading result: {ex.Message}");
            }
        }
    }
}