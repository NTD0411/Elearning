using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;
using WebRtcApi.Models;
using WebRtcApi.Dtos.Submissions;
using WebRtcApi.Services;
using System.Text.Json;

namespace WebRtcApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubmissionController : ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly AIWritingScoringService _aiScoringService;
    private readonly ILogger<SubmissionController> _logger;

    public SubmissionController(DatabaseContext context, IWebHostEnvironment environment, 
        AIWritingScoringService aiScoringService, ILogger<SubmissionController> logger)
    {
        _context = context;
        _environment = environment;
        _aiScoringService = aiScoringService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<SubmissionDto>> CreateSubmission(CreateSubmissionDto createDto)
    {
        try
        {
            var submission = new Submission
            {
                UserId = createDto.UserId,
                ExamCourseId = 1, // Tạm thời hardcode, sẽ update sau
                ExamType = createDto.ExamType,
                ExamId = createDto.ExamId,
                Answers = createDto.Answers,
                TotalWordCount = createDto.TotalWordCount,
                TimeSpent = createDto.TimeSpent,
                SubmittedAt = createDto.SubmittedAt,
                Status = "Submitted"
            };

            _context.Submissions.Add(submission);
            await _context.SaveChangesAsync();

            // AI Scoring for Writing submissions
            if (createDto.ExamType?.ToLower() == "writing" && !string.IsNullOrEmpty(createDto.Answers))
            {
                _logger.LogInformation("Starting AI scoring for writing submission {SubmissionId}", submission.SubmissionId);
                try
                {
                    await ScoreWritingSubmissionAsync(submission, createDto);
                    // Refresh submission to get updated AI scores
                    await _context.Entry(submission).ReloadAsync();
                    _logger.LogInformation("AI scoring completed successfully for submission {SubmissionId}", submission.SubmissionId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "AI scoring failed for submission {SubmissionId}", submission.SubmissionId);
                    // Continue with submission even if AI scoring fails
                }
            }

            var submissionDto = new SubmissionDto
            {
                SubmissionId = submission.SubmissionId,
                UserId = submission.UserId,
                ExamCourseId = submission.ExamCourseId,
                ExamType = submission.ExamType,
                ExamId = submission.ExamId,
                Answers = submission.Answers,
                TotalWordCount = submission.TotalWordCount,
                TimeSpent = submission.TimeSpent,
                SubmittedAt = submission.SubmittedAt,
                AiScore = submission.AiScore,
                MentorScore = submission.MentorScore,
                AiTaskAchievementScore = submission.AiTaskAchievementScore,
                AiTaskAchievementFeedback = submission.AiTaskAchievementFeedback,
                AiCoherenceCohesionScore = submission.AiCoherenceCohesionScore,
                AiCoherenceCohesionFeedback = submission.AiCoherenceCohesionFeedback,
                AiLexicalResourceScore = submission.AiLexicalResourceScore,
                AiLexicalResourceFeedback = submission.AiLexicalResourceFeedback,
                AiGrammaticalRangeScore = submission.AiGrammaticalRangeScore,
                AiGrammaticalRangeFeedback = submission.AiGrammaticalRangeFeedback,
                AiGeneralFeedback = submission.AiGeneralFeedback,
                Status = submission.Status
            };

            return CreatedAtAction(nameof(GetSubmission), new { id = submission.SubmissionId }, submissionDto);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error creating submission: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SubmissionDto>> GetSubmission(int id)
    {
        var submission = await _context.Submissions
            .Include(s => s.User)
            .Include(s => s.ExamCourse)
            .FirstOrDefaultAsync(s => s.SubmissionId == id);

        if (submission == null)
        {
            return NotFound();
        }

        var submissionDto = new SubmissionDto
        {
            SubmissionId = submission.SubmissionId,
            UserId = submission.UserId,
            ExamCourseId = submission.ExamCourseId,
            ExamType = submission.ExamType,
            ExamId = submission.ExamId,
            Answers = submission.Answers,
            AnswerText = submission.AnswerText,
            AnswerChoice = submission.AnswerChoice,
            AnswerFill = submission.AnswerFill,
            AnswerAudioUrl = submission.AnswerAudioUrl,
            TotalWordCount = submission.TotalWordCount,
            TimeSpent = submission.TimeSpent,
            SubmittedAt = submission.SubmittedAt,
            AiScore = submission.AiScore,
            MentorScore = submission.MentorScore,
            Status = submission.Status
        };

        return Ok(submissionDto);
    }

    [HttpGet("user/{userId}/history")]
    public async Task<ActionResult<IEnumerable<SubmissionHistoryDto>>> GetUserSubmissionHistory(int userId)
    {
        var submissions = await _context.Submissions
            .Where(s => s.UserId == userId)
            .Include(s => s.ExamCourse)
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync();

        var historyDtos = new List<SubmissionHistoryDto>();

        foreach (var submission in submissions)
        {
            var historyDto = new SubmissionHistoryDto
            {
                SubmissionId = submission.SubmissionId,
                UserId = submission.UserId,
                ExamCourseId = submission.ExamCourseId,
                ExamType = submission.ExamType,
                ExamId = submission.ExamId,
                Answers = submission.Answers,
                TotalWordCount = submission.TotalWordCount,
                TimeSpent = submission.TimeSpent,
                SubmittedAt = submission.SubmittedAt,
                AiScore = submission.AiScore,
                MentorScore = submission.MentorScore,
                Status = submission.Status,
                CourseTitle = submission.ExamCourse?.CourseTitle,
                CourseCode = submission.ExamCourse?.CourseCode
            };

            // Get exam title based on exam type
            if (submission.ExamType?.ToLower() == "writing" && submission.ExamId.HasValue)
            {
                var writingExam = await _context.WritingExams
                    .Include(w => w.ExamSet)
                    .FirstOrDefaultAsync(w => w.WritingExamId == submission.ExamId);
                historyDto.ExamTitle = writingExam?.ExamSet?.ExamSetTitle ?? "Writing Exam";
            }
            else if (submission.ExamType?.ToLower() == "reading" && submission.ExamId.HasValue)
            {
                var readingExamSet = await _context.ReadingExamSets
                    .FirstOrDefaultAsync(r => r.ExamSetId == submission.ExamId);
                historyDto.ExamTitle = readingExamSet?.ExamSetTitle ?? "Reading Exam";
            }
            else if (submission.ExamType?.ToLower() == "listening" && submission.ExamId.HasValue)
            {
                var listeningExam = await _context.ListeningExams
                    .Include(l => l.ExamSet)
                    .FirstOrDefaultAsync(l => l.ListeningExamId == submission.ExamId);
                historyDto.ExamTitle = listeningExam?.ExamSet?.ExamSetTitle ?? "Listening Exam";
            }
            else if (submission.ExamType?.ToLower() == "speaking" && submission.ExamId.HasValue)
            {
                var speakingExam = await _context.SpeakingExams
                    .Include(s => s.ExamSet)
                    .FirstOrDefaultAsync(s => s.SpeakingExamId == submission.ExamId);
                historyDto.ExamTitle = speakingExam?.ExamSet?.ExamSetTitle ?? "Speaking Exam";
            }

            historyDtos.Add(historyDto);
        }

        return Ok(historyDtos);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<SubmissionDto>>> GetUserSubmissions(int userId)
    {
        var submissions = await _context.Submissions
            .Where(s => s.UserId == userId)
            .Include(s => s.ExamCourse)
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync();

        var submissionDtos = submissions.Select(s => new SubmissionDto
        {
            SubmissionId = s.SubmissionId,
            UserId = s.UserId,
            ExamCourseId = s.ExamCourseId,
            ExamType = s.ExamType,
            ExamId = s.ExamId,
            Answers = s.Answers,
            TotalWordCount = s.TotalWordCount,
            TimeSpent = s.TimeSpent,
            SubmittedAt = s.SubmittedAt,
            AiScore = s.AiScore,
            MentorScore = s.MentorScore,
            Status = s.Status
        }).ToList();

        return Ok(submissionDtos);
    }

    [HttpGet("exam/{examType}/{examId}")]
    public async Task<ActionResult<IEnumerable<SubmissionDto>>> GetExamSubmissions(string examType, int examId)
    {
        var submissions = await _context.Submissions
            .Where(s => s.ExamType == examType && s.ExamId == examId)
            .Include(s => s.User)
            .Include(s => s.ExamCourse)
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync();

        var submissionDtos = submissions.Select(s => new SubmissionDto
        {
            SubmissionId = s.SubmissionId,
            UserId = s.UserId,
            ExamCourseId = s.ExamCourseId,
            ExamType = s.ExamType,
            ExamId = s.ExamId,
            Answers = s.Answers,
            TotalWordCount = s.TotalWordCount,
            TimeSpent = s.TimeSpent,
            SubmittedAt = s.SubmittedAt,
            AiScore = s.AiScore,
            MentorScore = s.MentorScore,
            Status = s.Status
        }).ToList();

        return Ok(submissionDtos);
    }

    [HttpGet("mentor")]
    public async Task<ActionResult<IEnumerable<SubmissionHistoryDto>>> GetMentorSubmissions()
    {
        try
        {
            // Get all Writing and Speaking submissions that need grading
            var submissions = await _context.Submissions
                .Where(s => (s.ExamType != null && (s.ExamType.ToLower() == "writing" || s.ExamType.ToLower() == "speaking")))
                .Include(s => s.User)
                .Include(s => s.ExamCourse)
                .Include(s => s.Feedbacks)
                    .ThenInclude(f => f.FeedbackReplies)
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync();

            var historyDtos = new List<SubmissionHistoryDto>();

            foreach (var submission in submissions)
            {
                var historyDto = new SubmissionHistoryDto
                {
                    SubmissionId = submission.SubmissionId,
                    UserId = submission.UserId,
                    ExamCourseId = submission.ExamCourseId,
                    ExamType = submission.ExamType,
                    ExamId = submission.ExamId,
                    Answers = submission.Answers,
                    AnswerText = submission.AnswerText,
                    AnswerAudioUrl = submission.AnswerAudioUrl,
                    TotalWordCount = submission.TotalWordCount,
                    TimeSpent = submission.TimeSpent,
                    SubmittedAt = submission.SubmittedAt,
                    AiScore = submission.AiScore,
                    MentorScore = submission.MentorScore,
                    Status = submission.Status,
                    CourseTitle = submission.ExamCourse?.CourseTitle,
                    CourseCode = submission.ExamCourse?.CourseCode,
                    StudentName = submission.User?.FullName ?? "Unknown Student",
                    ReplyCount = submission.Feedbacks.SelectMany(f => f.FeedbackReplies).Count()
                };

                // Get exam title based on exam type
                if (submission.ExamType?.ToLower() == "writing" && submission.ExamId.HasValue)
                {
                    var writingExam = await _context.WritingExams
                        .Include(w => w.ExamSet)
                        .FirstOrDefaultAsync(w => w.WritingExamId == submission.ExamId);
                    historyDto.ExamTitle = writingExam?.ExamSet?.ExamSetTitle ?? "Writing Exam";
                }
                else if (submission.ExamType?.ToLower() == "speaking" && submission.ExamId.HasValue)
                {
                    var speakingExam = await _context.SpeakingExams
                        .Include(s => s.ExamSet)
                        .FirstOrDefaultAsync(s => s.SpeakingExamId == submission.ExamId);
                    historyDto.ExamTitle = speakingExam?.ExamSet?.ExamSetTitle ?? "Speaking Exam";
                }

                historyDtos.Add(historyDto);
            }

            return Ok(historyDtos);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error fetching mentor submissions: {ex.Message}");
        }
    }

    [HttpPut("{id}/grade")]
    public async Task<ActionResult> GradeSubmission(int id, GradeSubmissionDto gradeDto)
    {
        try
        {
            Console.WriteLine($"Grading submission {id} with mentor ID: {gradeDto.MentorId}");
            
            var submission = await _context.Submissions
                .Include(s => s.Feedbacks)
                .FirstOrDefaultAsync(s => s.SubmissionId == id);

            if (submission == null)
            {
                return NotFound();
            }

            submission.MentorScore = gradeDto.MentorScore;
            submission.Status = gradeDto.Status;

            // Check if feedback already exists for this submission
            var existingFeedback = await _context.Feedbacks
                .FirstOrDefaultAsync(f => f.SubmissionId == id);

            if (existingFeedback != null)
            {
                // Update existing feedback
                existingFeedback.MentorId = gradeDto.MentorId;
                existingFeedback.FeedbackText = gradeDto.FeedbackContent;
                existingFeedback.CreatedAt = DateTime.UtcNow;
            }
            else
            {
                // Create new feedback
                var feedback = new Feedback
                {
                    SubmissionId = id,
                    MentorId = gradeDto.MentorId,
                    FeedbackText = gradeDto.FeedbackContent,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Feedbacks.Add(feedback);
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest($"Error grading submission: {ex.Message}");
        }
    }
    [HttpPost("speaking")]
    public async Task<ActionResult<SubmissionDto>> CreateSpeakingSubmission([FromForm] SpeakingSubmissionDto speakingDto)
    {
        try
        {
            _logger.LogInformation("Creating speaking submission for UserId: {UserId}, ExamSetId: {ExamSetId}", 
                speakingDto.UserId, speakingDto.ExamSetId);

            // Check if user exists
            var user = await _context.Users.FindAsync(speakingDto.UserId);
            if (user == null)
            {
                _logger.LogWarning("User with ID {UserId} not found", speakingDto.UserId);
                return BadRequest($"User with ID {speakingDto.UserId} not found");
            }

            _logger.LogInformation("User found: {UserName} with role: {Role}", user.FullName, user.Role);

            var submission = new Submission
            {
                UserId = speakingDto.UserId,
                ExamCourseId = 1, // Tạm thời hardcode
                ExamType = "speaking",
                ExamId = speakingDto.ExamSetId,
                Answers = "", // Sẽ lưu paths của audio files
                SubmittedAt = DateTime.UtcNow,
                Status = "submitted"
            };

            _context.Submissions.Add(submission);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Submission created with ID: {SubmissionId}", submission.SubmissionId);

            // Save audio files
            var audioFiles = new List<string>();
            var uploadsDir = Path.Combine(_environment.WebRootPath, "uploads", "speaking");
            
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }

            _logger.LogInformation("Processing {Count} audio files", speakingDto.AudioFiles.Count);

            foreach (var file in speakingDto.AudioFiles)
            {
                if (file.Length > 0)
                {
                    var fileName = $"{submission.SubmissionId}_{file.FileName}_{Guid.NewGuid()}.wav";
                    var filePath = Path.Combine(uploadsDir, fileName);
                    
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    
                    audioFiles.Add($"/uploads/speaking/{fileName}");
                    _logger.LogInformation("Saved audio file: {FileName}", fileName);
                }
            }

            // Update submission with audio file paths
            submission.Answers = string.Join(";", audioFiles);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Speaking submission completed successfully. SubmissionId: {SubmissionId}", submission.SubmissionId);

            var submissionDto = new SubmissionDto
            {
                SubmissionId = submission.SubmissionId,
                UserId = submission.UserId,
                ExamCourseId = submission.ExamCourseId,
                ExamType = submission.ExamType,
                ExamId = submission.ExamId,
                Answers = submission.Answers,
                SubmittedAt = submission.SubmittedAt,
                Status = submission.Status
            };

            return Ok(submissionDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating speaking submission for UserId: {UserId}", speakingDto.UserId);
            return BadRequest($"Error creating speaking submission: {ex.Message}");
        }
    }

    private async Task ScoreWritingSubmissionAsync(Submission submission, CreateSubmissionDto createDto)
    {
        try
        {
            _logger.LogInformation("Starting AI scoring for submission {SubmissionId}", submission.SubmissionId);

            // Get the writing exam prompt
            var writingExam = await _context.WritingExams
                .Include(w => w.ExamSet)
                .FirstOrDefaultAsync(w => w.WritingExamId == submission.ExamId);

            if (writingExam == null)
            {
                _logger.LogWarning("Writing exam not found for ID {ExamId}", submission.ExamId);
                return;
            }

            // Extract writing prompts and student responses from answers JSON
            var prompt = ExtractWritingPrompt(writingExam);
            var studentResponse = ExtractStudentResponse(createDto.Answers);

            if (string.IsNullOrEmpty(studentResponse))
            {
                _logger.LogWarning("No student response found for submission {SubmissionId}", submission.SubmissionId);
                return;
            }

            // Determine writing type (Task 1 or Task 2)
            var writingType = DetermineWritingType(writingExam);

            // Call AI scoring service
            var scoreResult = await _aiScoringService.ScoreWritingAsync(prompt, studentResponse, writingType);

            // Update submission with AI scores
            submission.AiScore = scoreResult.OverallBand;
            submission.AiTaskAchievementScore = scoreResult.TaskAchievementScore;
            submission.AiTaskAchievementFeedback = scoreResult.TaskAchievementFeedback;
            submission.AiCoherenceCohesionScore = scoreResult.CoherenceCohesionScore;
            submission.AiCoherenceCohesionFeedback = scoreResult.CoherenceCohesionFeedback;
            submission.AiLexicalResourceScore = scoreResult.LexicalResourceScore;
            submission.AiLexicalResourceFeedback = scoreResult.LexicalResourceFeedback;
            submission.AiGrammaticalRangeScore = scoreResult.GrammaticalRangeScore;
            submission.AiGrammaticalRangeFeedback = scoreResult.GrammaticalRangeFeedback;
            submission.AiGeneralFeedback = scoreResult.GeneralFeedback;
            submission.Status = "AI Scored";

            await _context.SaveChangesAsync();

            _logger.LogInformation("AI scoring completed for submission {SubmissionId}. Overall band: {Band}", 
                submission.SubmissionId, scoreResult.OverallBand);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during AI scoring for submission {SubmissionId}", submission.SubmissionId);
            
            // Set a flag to indicate AI scoring failed
            submission.Status = "AI Scoring Failed";
            submission.AiGeneralFeedback = "AI scoring encountered an error. This might be due to API quota exceeded or network issues.";
            await _context.SaveChangesAsync();
            
            // Don't throw - allow submission to succeed even if AI scoring fails
        }
    }

    private string ExtractWritingPrompt(WritingExam writingExam)
    {
        // Combine all prompts/questions into one string
        var prompts = new List<string>();
        
        // Task 1 prompt
        if (!string.IsNullOrEmpty(writingExam.Task1Description))
        {
            var task1Prompt = $"Task 1: {writingExam.Task1Description}";
            if (!string.IsNullOrEmpty(writingExam.Task1Requirements))
                task1Prompt += $"\nRequirements: {writingExam.Task1Requirements}";
            if (writingExam.Task1MinWords > 0)
                task1Prompt += $"\nMinimum words: {writingExam.Task1MinWords}";
            prompts.Add(task1Prompt);
        }
            
        // Task 2 prompt
        if (!string.IsNullOrEmpty(writingExam.Task2Question))
        {
            var task2Prompt = $"Task 2: {writingExam.Task2Question}";
            if (!string.IsNullOrEmpty(writingExam.Task2Context))
                task2Prompt += $"\nContext: {writingExam.Task2Context}";
            if (!string.IsNullOrEmpty(writingExam.Task2Requirements))
                task2Prompt += $"\nRequirements: {writingExam.Task2Requirements}";
            if (writingExam.Task2MinWords > 0)
                task2Prompt += $"\nMinimum words: {writingExam.Task2MinWords}";
            prompts.Add(task2Prompt);
        }

        // Fallback to old QuestionText if new fields are empty
        if (prompts.Count == 0 && !string.IsNullOrEmpty(writingExam.QuestionText))
        {
            prompts.Add(writingExam.QuestionText);
        }

        return string.Join("\n\n", prompts);
    }

    private string ExtractStudentResponse(string? answersJson)
    {
        if (string.IsNullOrEmpty(answersJson))
            return string.Empty;

        try
        {
            // Parse JSON and extract text responses
            var answers = JsonSerializer.Deserialize<JsonElement>(answersJson);
            var responses = new List<string>();

            // Extract Task 1 response
            if (answers.TryGetProperty("task1", out var task1))
            {
                if (task1.TryGetProperty("answer", out var task1Answer))
                {
                    responses.Add($"Task 1 Response:\n{task1Answer.GetString()}");
                }
            }

            // Extract Task 2 response
            if (answers.TryGetProperty("task2", out var task2))
            {
                if (task2.TryGetProperty("answer", out var task2Answer))
                {
                    responses.Add($"Task 2 Response:\n{task2Answer.GetString()}");
                }
            }

            return string.Join("\n\n", responses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing student response JSON");
            return answersJson ?? string.Empty;
        }
    }

    private string DetermineWritingType(WritingExam writingExam)
    {
        // Check if it has both tasks or just one
        var hasTask1 = !string.IsNullOrEmpty(writingExam.Task1Description);
        var hasTask2 = !string.IsNullOrEmpty(writingExam.Task2Question);

        if (hasTask1 && hasTask2)
            return "IELTS Writing (Task 1 + Task 2)";
        else if (hasTask1)
            return "IELTS Writing Task 1";
        else if (hasTask2)
            return "IELTS Writing Task 2";
        else
            return "IELTS Writing";
    }

    [HttpPost("test-ai-scoring")]
    public async Task<ActionResult> TestAIScoring([FromBody] TestAIScoringRequest request)
    {
        try
        {
            _logger.LogInformation("Testing AI scoring with sample data");
            
            var scoreResult = await _aiScoringService.ScoreWritingAsync(
                request.Prompt, 
                request.StudentResponse, 
                request.WritingType);

            return Ok(new
            {
                success = true,
                result = scoreResult
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing AI scoring");
            return BadRequest(new
            {
                success = false,
                error = ex.Message
            });
        }
    }

    [HttpGet("feedback/{submissionId}")]
    public async Task<ActionResult<FeedbackDto>> GetSubmissionFeedback(int submissionId)
    {
        try
        {
            var feedback = await _context.Feedbacks
                .Include(f => f.Mentor)
                .Include(f => f.FeedbackReplies)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(f => f.SubmissionId == submissionId);

            if (feedback == null)
            {
                return NotFound("No feedback found for this submission");
            }

            var feedbackDto = new FeedbackDto
            {
                FeedbackId = feedback.FeedbackId,
                SubmissionId = feedback.SubmissionId ?? 0,
                MentorId = feedback.MentorId,
                MentorName = feedback.Mentor?.FullName,
                FeedbackText = feedback.FeedbackText,
                CreatedAt = feedback.CreatedAt,
                Replies = feedback.FeedbackReplies.Select(r => new FeedbackReplyDto
                {
                    ReplyId = r.ReplyId,
                    FeedbackId = r.FeedbackId ?? 0,
                    UserId = r.UserId ?? 0,
                    UserName = r.User?.FullName,
                    ReplyText = r.ReplyText,
                    CreatedAt = r.CreatedAt
                }).ToList()
            };

            return Ok(feedbackDto);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error fetching feedback: {ex.Message}");
        }
    }

    [HttpPost("feedback/reply")]
    public async Task<ActionResult> CreateFeedbackReply(CreateFeedbackReplyDto replyDto)
    {
        try
        {
            var feedback = await _context.Feedbacks.FindAsync(replyDto.FeedbackId);
            if (feedback == null)
            {
                return NotFound("Feedback not found");
            }

            var reply = new FeedbackReply
            {
                FeedbackId = replyDto.FeedbackId,
                UserId = replyDto.UserId,
                ReplyText = replyDto.ReplyText,
                CreatedAt = DateTime.UtcNow
            };

            _context.FeedbackReplies.Add(reply);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Reply created successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest($"Error creating reply: {ex.Message}");
        }
    }

    [HttpGet("ai-feedback/{id}")]
    public async Task<ActionResult<SubmissionDto>> GetAIFeedback(int id)
    {
        try
        {
            var submission = await _context.Submissions.FindAsync(id);
            if (submission == null)
            {
                return NotFound($"Submission with ID {id} not found.");
            }

            var submissionDto = new SubmissionDto
            {
                SubmissionId = submission.SubmissionId,
                UserId = submission.UserId,
                ExamCourseId = submission.ExamCourseId,
                ExamType = submission.ExamType,
                ExamId = submission.ExamId,
                Answers = submission.Answers,
                TotalWordCount = submission.TotalWordCount,
                TimeSpent = submission.TimeSpent,
                SubmittedAt = submission.SubmittedAt,
                AiScore = submission.AiScore,
                MentorScore = submission.MentorScore,
                AiTaskAchievementScore = submission.AiTaskAchievementScore,
                AiTaskAchievementFeedback = submission.AiTaskAchievementFeedback,
                AiCoherenceCohesionScore = submission.AiCoherenceCohesionScore,
                AiCoherenceCohesionFeedback = submission.AiCoherenceCohesionFeedback,
                AiLexicalResourceScore = submission.AiLexicalResourceScore,
                AiLexicalResourceFeedback = submission.AiLexicalResourceFeedback,
                AiGrammaticalRangeScore = submission.AiGrammaticalRangeScore,
                AiGrammaticalRangeFeedback = submission.AiGrammaticalRangeFeedback,
                AiGeneralFeedback = submission.AiGeneralFeedback,
                Status = submission.Status
            };

            return Ok(submissionDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting AI feedback for submission {SubmissionId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}

public class TestAIScoringRequest
{
    public string Prompt { get; set; } = string.Empty;
    public string StudentResponse { get; set; } = string.Empty;
    public string WritingType { get; set; } = "IELTS Writing";
}