using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;
using WebRtcApi.Dtos.Submissions;
using WebRtcApi.Models;

namespace WebRtcApi.Services
{
    public class ReadingListeningScoringService
    {
        private readonly DatabaseContext _context;
        private readonly ILogger<ReadingListeningScoringService> _logger;

        public ReadingListeningScoringService(DatabaseContext context, ILogger<ReadingListeningScoringService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ReadingSubmissionResultDto> ScoreReadingSubmissionAsync(ReadingSubmissionDto submissionDto)
        {
            try
            {
                // Get the exam questions with correct answers
                var questions = await _context.ReadingExams
                    .Where(r => r.ExamSetId == submissionDto.ExamSetId)
                    .ToListAsync();

                var questionResults = new List<ReadingQuestionResultDto>();
                int correctAnswers = 0;
                int totalQuestions = questions.Count;

                foreach (var answer in submissionDto.Answers)
                {
                    var question = questions.FirstOrDefault(q => q.ReadingExamId == answer.QuestionId);
                    if (question == null) continue;

                    var userAnswer = !string.IsNullOrEmpty(answer.SelectedAnswer) 
                        ? answer.SelectedAnswer 
                        : answer.FillAnswer ?? "";

                    var correctAnswer = question.CorrectAnswer ?? "";
                    var isCorrect = IsAnswerCorrect(userAnswer, correctAnswer, question);

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

                // Calculate score (percentage)
                var score = totalQuestions > 0 ? (decimal)correctAnswers / totalQuestions * 100 : 0;

                return new ReadingSubmissionResultDto
                {
                    UserId = submissionDto.UserId,
                    ExamSetId = submissionDto.ExamSetId,
                    ExamCourseId = submissionDto.ExamCourseId,
                    Answers = submissionDto.Answers,
                    TimeSpent = submissionDto.TimeSpent,
                    SubmittedAt = submissionDto.SubmittedAt,
                    Score = Math.Round(score, 2),
                    CorrectAnswers = correctAnswers,
                    TotalQuestions = totalQuestions,
                    QuestionResults = questionResults
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scoring reading submission for user {UserId}", submissionDto.UserId);
                throw;
            }
        }

        public async Task<ListeningSubmissionResultDto> ScoreListeningSubmissionAsync(ListeningSubmissionDto submissionDto)
        {
            try
            {
                // Get the exam questions with correct answers
                var questions = await _context.ListeningExams
                    .Where(l => l.ExamSetId == submissionDto.ExamSetId)
                    .ToListAsync();

                var questionResults = new List<ListeningQuestionResultDto>();
                int correctAnswers = 0;
                int totalQuestions = questions.Count;

                foreach (var answer in submissionDto.Answers)
                {
                    var question = questions.FirstOrDefault(q => q.ListeningExamId == answer.QuestionId);
                    if (question == null) continue;

                    var userAnswer = !string.IsNullOrEmpty(answer.SelectedAnswer) 
                        ? answer.SelectedAnswer 
                        : answer.FillAnswer ?? "";

                    var correctAnswer = question.CorrectAnswer ?? "";
                    var isCorrect = IsAnswerCorrect(userAnswer, correctAnswer, question);

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

                // Calculate score (percentage)
                var score = totalQuestions > 0 ? (decimal)correctAnswers / totalQuestions * 100 : 0;

                return new ListeningSubmissionResultDto
                {
                    UserId = submissionDto.UserId,
                    ExamSetId = submissionDto.ExamSetId,
                    ExamCourseId = submissionDto.ExamCourseId,
                    Answers = submissionDto.Answers,
                    TimeSpent = submissionDto.TimeSpent,
                    SubmittedAt = submissionDto.SubmittedAt,
                    Score = Math.Round(score, 2),
                    CorrectAnswers = correctAnswers,
                    TotalQuestions = totalQuestions,
                    QuestionResults = questionResults
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scoring listening submission for user {UserId}", submissionDto.UserId);
                throw;
            }
        }

        private bool IsAnswerCorrect(string userAnswer, string correctAnswer, object question)
        {
            if (string.IsNullOrEmpty(userAnswer) || string.IsNullOrEmpty(correctAnswer))
                return false;

            // Normalize answers for comparison
            var normalizedUserAnswer = userAnswer.Trim().ToUpperInvariant();
            var normalizedCorrectAnswer = correctAnswer.Trim().ToUpperInvariant();

            // For multiple choice questions, compare directly
            if (normalizedCorrectAnswer.Length == 1 && "ABCD".Contains(normalizedCorrectAnswer))
            {
                return normalizedUserAnswer == normalizedCorrectAnswer;
            }

            // For fill-in-the-blank questions, use more flexible matching
            return IsFillAnswerCorrect(normalizedUserAnswer, normalizedCorrectAnswer);
        }

        private bool IsFillAnswerCorrect(string userAnswer, string correctAnswer)
        {
            // Split correct answer by common separators (comma, semicolon, pipe)
            var correctAnswers = correctAnswer.Split(new[] { ',', ';', '|' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(a => a.Trim().ToUpperInvariant())
                .ToList();

            // Check if user answer matches any of the correct answers
            return correctAnswers.Any(ca => 
                string.Equals(userAnswer, ca, StringComparison.OrdinalIgnoreCase) ||
                userAnswer.Contains(ca) ||
                ca.Contains(userAnswer));
        }
    }
}
