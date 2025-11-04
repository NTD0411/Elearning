using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebRtcApi.Data;
using WebRtcApi.Dtos.Exams;
using WebRtcApi.Models;
using WebRtcApi.Services;

namespace WebRtcApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AIExamGeneratorController : ControllerBase
    {
        private readonly AIExamGeneratorService _aiExamGeneratorService;
        private readonly DatabaseContext _context;
        private readonly ILogger<AIExamGeneratorController> _logger;

        public AIExamGeneratorController(
            AIExamGeneratorService aiExamGeneratorService,
            DatabaseContext context,
            ILogger<AIExamGeneratorController> logger)
        {
            _aiExamGeneratorService = aiExamGeneratorService;
            _context = context;
            _logger = logger;
        }

        // ============= READING EXAM GENERATION =============

        [HttpPost("generate-reading")]
        public async Task<ActionResult<GenerateReadingExamResponse>> GenerateReadingExam([FromBody] GenerateReadingExamRequest request)
        {
            try
            {
                _logger.LogInformation("Generating Reading exam with topic: {Topic}", request.Topic);

                // Generate exam using AI
                var generated = await _aiExamGeneratorService.GenerateReadingExamAsync(
                    request.Topic,
                    request.Difficulty,
                    request.NumberOfQuestions
                );

                // Save to database
                var examSet = new ReadingExamSet
                {
                    ExamSetCode = generated.ExamSetCode,
                    ExamSetTitle = generated.ExamSetTitle,
                    TotalQuestions = generated.Questions.Count,
                    ReadingContext = generated.ReadingContext,
                    CreatedAt = DateTime.Now,
                    ExamCourseId = request.ExamCourseId
                };

                _context.ReadingExamSets.Add(examSet);
                await _context.SaveChangesAsync();

                // Save questions
                var questions = new List<AIReadingQuestionDto>();
                foreach (var q in generated.Questions)
                {
                    var question = new ReadingExam
                    {
                        ExamSetId = examSet.ExamSetId,
                        QuestionText = q.QuestionText,
                        OptionA = q.OptionA,
                        OptionB = q.OptionB,
                        OptionC = q.OptionC,
                        OptionD = q.OptionD,
                        OptionE = q.OptionE,
                        OptionF = q.OptionF,
                        OptionG = q.OptionG,
                        OptionH = q.OptionH,
                        CorrectAnswer = q.CorrectAnswer,
                        CreatedAt = DateTime.Now
                    };

                    _context.ReadingExams.Add(question);
                    await _context.SaveChangesAsync();

                    questions.Add(new AIReadingQuestionDto
                    {
                        ReadingExamId = question.ReadingExamId,
                        QuestionText = question.QuestionText,
                        OptionA = question.OptionA,
                        OptionB = question.OptionB,
                        OptionC = question.OptionC,
                        OptionD = question.OptionD,
                        OptionE = question.OptionE,
                        OptionF = question.OptionF,
                        OptionG = question.OptionG,
                        OptionH = question.OptionH,
                        CorrectAnswer = question.CorrectAnswer
                    });
                }

                return Ok(new GenerateReadingExamResponse
                {
                    Success = true,
                    Message = "Reading exam generated successfully",
                    ExamSet = new AIReadingExamSetDto
                    {
                        ExamSetId = examSet.ExamSetId,
                        ExamSetCode = examSet.ExamSetCode,
                        ExamSetTitle = examSet.ExamSetTitle,
                        TotalQuestions = examSet.TotalQuestions,
                        ReadingContext = examSet.ReadingContext,
                        CreatedAt = examSet.CreatedAt ?? DateTime.Now
                    },
                    Questions = questions
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Reading exam");
                return StatusCode(500, new GenerateReadingExamResponse
                {
                    Success = false,
                    Message = $"Error: {ex.Message}"
                });
            }
        }

        // ============= LISTENING EXAM GENERATION =============

        [HttpPost("generate-listening")]
        public async Task<ActionResult<GenerateListeningExamResponse>> GenerateListeningExam([FromBody] GenerateListeningExamRequest request)
        {
            try
            {
                _logger.LogInformation("Generating Listening exam with topic: {Topic}", request.Topic);

                var generated = await _aiExamGeneratorService.GenerateListeningExamAsync(
                    request.Topic,
                    request.Difficulty,
                    request.NumberOfQuestions
                );

                var examSet = new ListeningExamSet
                {
                    ExamSetCode = generated.ExamSetCode,
                    ExamSetTitle = generated.ExamSetTitle,
                    TotalQuestions = generated.Questions.Count,
                    TimeLimit = generated.TimeLimit,
                    AudioUrl = generated.AudioUrl ?? "", // Use TTS-generated audio URL
                    CreatedAt = DateTime.Now,
                    ExamCourseId = request.ExamCourseId
                };

                _context.ListeningExamSets.Add(examSet);
                await _context.SaveChangesAsync();

                var questions = new List<AIListeningQuestionDto>();
                foreach (var q in generated.Questions)
                {
                    var question = new ListeningExam
                    {
                        ExamSetId = examSet.ExamSetId,
                        AudioUrl = examSet.AudioUrl, // Use ExamSet's audio URL (same for all questions)
                        QuestionText = q.QuestionText,
                        OptionA = q.OptionA,
                        OptionB = q.OptionB,
                        OptionC = q.OptionC,
                        OptionD = q.OptionD,
                        OptionE = q.OptionE,
                        OptionF = q.OptionF,
                        OptionG = q.OptionG,
                        OptionH = q.OptionH,
                        CorrectAnswer = q.CorrectAnswer,
                        CreatedAt = DateTime.Now
                    };

                    _context.ListeningExams.Add(question);
                    await _context.SaveChangesAsync();

                    questions.Add(new AIListeningQuestionDto
                    {
                        ListeningExamId = question.ListeningExamId,
                        QuestionText = question.QuestionText,
                        OptionA = question.OptionA,
                        OptionB = question.OptionB,
                        OptionC = question.OptionC,
                        OptionD = question.OptionD,
                        OptionE = question.OptionE,
                        OptionF = question.OptionF,
                        OptionG = question.OptionG,
                        OptionH = question.OptionH,
                        CorrectAnswer = question.CorrectAnswer,
                        AudioUrl = question.AudioUrl
                    });
                }

                return Ok(new GenerateListeningExamResponse
                {
                    Success = true,
                    Message = "Listening exam generated successfully with auto-generated audio!",
                    ExamSet = new AIListeningExamSetDto
                    {
                        ExamSetId = examSet.ExamSetId,
                        ExamSetCode = examSet.ExamSetCode,
                        ExamSetTitle = examSet.ExamSetTitle,
                        TotalQuestions = examSet.TotalQuestions,
                        TimeLimit = examSet.TimeLimit,
                        AudioUrl = examSet.AudioUrl,
                        CreatedAt = examSet.CreatedAt ?? DateTime.Now
                    },
                    Questions = questions,
                    AudioScript = generated.AudioScript,
                    AudioDescription = generated.AudioDescription
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Listening exam");
                return StatusCode(500, new GenerateListeningExamResponse
                {
                    Success = false,
                    Message = $"Error: {ex.Message}"
                });
            }
        }

        // ============= WRITING EXAM GENERATION =============

        [HttpPost("generate-writing")]
        public async Task<ActionResult<GenerateWritingExamResponse>> GenerateWritingExam([FromBody] GenerateWritingExamRequest request)
        {
            try
            {
                _logger.LogInformation("Generating Writing exam with topic: {Topic}", request.Topic);

                var generated = await _aiExamGeneratorService.GenerateWritingExamAsync(
                    request.Topic,
                    request.Difficulty,
                    request.EssayType
                );

                var examSet = new WritingExamSet
                {
                    ExamSetCode = generated.ExamSetCode,
                    ExamSetTitle = generated.ExamSetTitle,
                    TotalQuestions = 2, // Task 1 + Task 2
                    CreatedAt = DateTime.Now,
                    ExamCourseId = request.ExamCourseId
                };

                _context.WritingExamSets.Add(examSet);
                await _context.SaveChangesAsync();

                var exam = new WritingExam
                {
                    ExamSetId = examSet.ExamSetId,
                    Task1Title = generated.Task1Title,
                    Task1Description = generated.Task1Description,
                    Task1ImageUrl = null, // Admin will add image based on Task1ImageDescription
                    Task1Requirements = generated.Task1Requirements,
                    Task1MinWords = generated.Task1MinWords,
                    Task1MaxTime = generated.Task1MaxTime,
                    Task2Title = generated.Task2Title,
                    Task2Question = generated.Task2Question,
                    Task2Context = generated.Task2Context,
                    Task2Requirements = generated.Task2Requirements,
                    Task2MinWords = generated.Task2MinWords,
                    Task2MaxTime = generated.Task2MaxTime,
                    TotalTimeMinutes = generated.TotalTimeMinutes,
                    Instructions = generated.Instructions,
#pragma warning disable CS0618 // Type or member is obsolete
                    QuestionText = generated.Task2Question, // For backward compatibility
#pragma warning restore CS0618 // Type or member is obsolete
                    CreatedAt = DateTime.Now
                };

                _context.WritingExams.Add(exam);
                await _context.SaveChangesAsync();

                return Ok(new GenerateWritingExamResponse
                {
                    Success = true,
                    Message = $"Writing exam generated successfully. Task 1 Image Description: {generated.Task1ImageDescription}",
                    ExamSet = new AIWritingExamSetDto
                    {
                        ExamSetId = examSet.ExamSetId,
                        ExamSetCode = examSet.ExamSetCode,
                        ExamSetTitle = examSet.ExamSetTitle,
                        TotalQuestions = examSet.TotalQuestions,
                        CreatedAt = examSet.CreatedAt ?? DateTime.Now
                    },
                    Exam = new AIWritingExamDetailsDto
                    {
                        WritingExamId = exam.WritingExamId,
                        Task1Title = exam.Task1Title,
                        Task1Description = exam.Task1Description,
                        Task1ImageUrl = exam.Task1ImageUrl,
                        Task1Requirements = exam.Task1Requirements,
                        Task1MinWords = exam.Task1MinWords,
                        Task1MaxTime = exam.Task1MaxTime,
                        Task2Title = exam.Task2Title,
                        Task2Question = exam.Task2Question,
                        Task2Context = exam.Task2Context,
                        Task2Requirements = exam.Task2Requirements,
                        Task2MinWords = exam.Task2MinWords,
                        Task2MaxTime = exam.Task2MaxTime,
                        TotalTimeMinutes = exam.TotalTimeMinutes,
                        Instructions = exam.Instructions
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Writing exam");
                return StatusCode(500, new GenerateWritingExamResponse
                {
                    Success = false,
                    Message = $"Error: {ex.Message}"
                });
            }
        }

        // ============= SPEAKING EXAM GENERATION =============

        [HttpPost("generate-speaking")]
        public async Task<ActionResult<GenerateSpeakingExamResponse>> GenerateSpeakingExam([FromBody] GenerateSpeakingExamRequest request)
        {
            try
            {
                _logger.LogInformation("Generating Speaking exam with topic: {Topic}", request.Topic);

                var generated = await _aiExamGeneratorService.GenerateSpeakingExamAsync(
                    request.Topic,
                    request.Difficulty
                );

                var examSet = new SpeakingExamSet
                {
                    ExamSetCode = generated.ExamSetCode,
                    ExamSetTitle = generated.ExamSetTitle,
                    TotalQuestions = generated.Part1Questions.Count + 1 + generated.Part3Questions.Count,
                    CreatedAt = DateTime.Now,
                    ExamCourseId = request.ExamCourseId
                };

                _context.SpeakingExamSets.Add(examSet);
                await _context.SaveChangesAsync();

                var questions = new List<AISpeakingQuestionDto>();

                // Add Part 1 questions
                foreach (var q in generated.Part1Questions)
                {
                    var question = new SpeakingExam
                    {
                        ExamSetId = examSet.ExamSetId,
                        PartNumber = q.PartNumber,
                        PartTitle = q.PartTitle,
                        QuestionText = q.QuestionText,
                        TimeLimit = q.TimeLimit,
                        CreatedAt = DateTime.Now
                    };

                    _context.SpeakingExams.Add(question);
                    await _context.SaveChangesAsync();

                    questions.Add(new AISpeakingQuestionDto
                    {
                        SpeakingExamId = question.SpeakingExamId,
                        PartNumber = question.PartNumber,
                        PartTitle = question.PartTitle,
                        QuestionText = question.QuestionText,
                        TimeLimit = question.TimeLimit ?? 0
                    });
                }

                // Add Part 2 (Cue Card)
                var part2 = new SpeakingExam
                {
                    ExamSetId = examSet.ExamSetId,
                    PartNumber = generated.Part2CueCard.PartNumber,
                    PartTitle = generated.Part2CueCard.PartTitle,
                    QuestionText = generated.Part2CueCard.QuestionText,
                    CueCardTopic = generated.Part2CueCard.CueCardTopic,
                    CueCardPrompts = generated.Part2CueCard.CueCardPrompts,
                    TimeLimit = generated.Part2CueCard.TimeLimit,
                    CreatedAt = DateTime.Now
                };

                _context.SpeakingExams.Add(part2);
                await _context.SaveChangesAsync();

                questions.Add(new AISpeakingQuestionDto
                {
                    SpeakingExamId = part2.SpeakingExamId,
                    PartNumber = part2.PartNumber,
                    PartTitle = part2.PartTitle,
                    QuestionText = part2.QuestionText,
                    CueCardTopic = part2.CueCardTopic,
                    CueCardPrompts = part2.CueCardPrompts,
                    TimeLimit = part2.TimeLimit ?? 0
                });

                // Add Part 3 questions
                foreach (var q in generated.Part3Questions)
                {
                    var question = new SpeakingExam
                    {
                        ExamSetId = examSet.ExamSetId,
                        PartNumber = q.PartNumber,
                        PartTitle = q.PartTitle,
                        QuestionText = q.QuestionText,
                        TimeLimit = q.TimeLimit,
                        CreatedAt = DateTime.Now
                    };

                    _context.SpeakingExams.Add(question);
                    await _context.SaveChangesAsync();

                    questions.Add(new AISpeakingQuestionDto
                    {
                        SpeakingExamId = question.SpeakingExamId,
                        PartNumber = question.PartNumber,
                        PartTitle = question.PartTitle,
                        QuestionText = question.QuestionText,
                        TimeLimit = question.TimeLimit ?? 0
                    });
                }

                return Ok(new GenerateSpeakingExamResponse
                {
                    Success = true,
                    Message = "Speaking exam generated successfully",
                    ExamSet = new AISpeakingExamSetDto
                    {
                        ExamSetId = examSet.ExamSetId,
                        ExamSetCode = examSet.ExamSetCode,
                        ExamSetTitle = examSet.ExamSetTitle,
                        TotalQuestions = examSet.TotalQuestions,
                        CreatedAt = examSet.CreatedAt ?? DateTime.Now
                    },
                    Questions = questions
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Speaking exam");
                return StatusCode(500, new GenerateSpeakingExamResponse
                {
                    Success = false,
                    Message = $"Error: {ex.Message}"
                });
            }
        }
    }
}
