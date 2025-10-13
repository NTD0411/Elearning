using Microsoft.AspNetCore.Mvc;
using WebRtcApi.Repositories.Exams;
using WebRtcApi.Dtos.Exams;
using WebRtcApi.Dtos.Submissions;
using WebRtcApi.Data;
using WebRtcApi.Services;
using WebRtcApi.Models;
using Microsoft.EntityFrameworkCore;

namespace WebRtcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListeningExamController : ControllerBase
    {
        private readonly IListeningExamRepository _repository;
        private readonly DatabaseContext _context;
        private readonly ReadingListeningScoringService _scoringService;

        public ListeningExamController(IListeningExamRepository repository, DatabaseContext context, ReadingListeningScoringService scoringService)
        {
            _repository = repository;
            _context = context;
            _scoringService = scoringService;
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
            
            // Get the exam set to include image information
            var examSet = await _context.ListeningExamSets.FindAsync(examSetId);
            
            var result = listeningExams.Select(l => new
            {
                questionId = l.ListeningExamId,
                questionText = l.QuestionText,
                questionOrder = l.ListeningExamId, // Using ID as order for now
                audioUrl = l.AudioUrl,
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

        [HttpGet("examset/{examSetId}/take-exam")]
        public async Task<ActionResult<object>> GetExamForTaking(int examSetId)
        {
            try
            {
                // Get exam set details
                var examSet = await _context.ListeningExamSets
                    .FirstOrDefaultAsync(l => l.ExamSetId == examSetId);

                if (examSet == null)
                    return NotFound("Exam set not found");

                // Get questions for the exam
                var questions = await _repository.GetByExamSetIdAsync(examSetId);
                
                var examData = new
                {
                    examSetId = examSet.ExamSetId,
                    examTitle = examSet.ExamSetTitle,
                    examCode = examSet.ExamSetCode,
                    listeningImage = examSet.ListeningImage,
                    totalQuestions = examSet.TotalQuestions,
                    timeLimit = 40, // 40 minutes default for listening
                    questions = questions.Select((q, index) => new
                    {
                        questionId = q.ListeningExamId,
                        questionNumber = index + 1,
                        questionText = q.QuestionText,
                        questionType = !string.IsNullOrEmpty(q.AnswerFill) ? "fill" : "multiple_choice",
                        audioUrl = q.AudioUrl,
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

        [HttpPost("submit")]
        public async Task<ActionResult<ListeningSubmissionResultDto>> SubmitListeningExam([FromBody] ListeningSubmissionDto submissionDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Score the submission
                var result = await _scoringService.ScoreListeningSubmissionAsync(submissionDto);

                // Save submission to database
                var submission = new Submission
                {
                    UserId = submissionDto.UserId,
                    ExamCourseId = submissionDto.ExamCourseId,
                    ExamType = "listening",
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
                return BadRequest($"Error submitting listening exam: {ex.Message}");
            }
        }

        [HttpGet("result/{submissionId}")]
        public async Task<ActionResult<ListeningSubmissionResultDto>> GetListeningResult(int submissionId)
        {
            try
            {
                var submission = await _context.Submissions
                    .FirstOrDefaultAsync(s => s.SubmissionId == submissionId && s.ExamType == "listening");

                if (submission == null)
                    return NotFound("Submission not found");

                // Get the original answers
                var answers = System.Text.Json.JsonSerializer.Deserialize<List<ListeningAnswerDto>>(submission.Answers ?? "[]") ?? new List<ListeningAnswerDto>();

                // Get exam questions for detailed results
                var questions = await _context.ListeningExams
                    .Where(l => l.ExamSetId == submission.ExamId)
                    .ToListAsync();

                var questionResults = new List<ListeningQuestionResultDto>();
                int correctAnswers = 0;

                foreach (var answer in answers)
                {
                    var question = questions.FirstOrDefault(q => q.ListeningExamId == answer.QuestionId);
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

                    questionResults.Add(new ListeningQuestionResultDto
                    {
                        QuestionId = answer.QuestionId,
                        UserAnswer = userAnswer,
                        CorrectAnswer = correctAnswer,
                        IsCorrect = isCorrect,
                        Points = isCorrect ? 1 : 0
                    });
                }

                var result = new ListeningSubmissionResultDto
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
                return BadRequest($"Error retrieving listening result: {ex.Message}");
            }
        }
    }
}