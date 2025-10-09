using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;
using WebRtcApi.Models;
using WebRtcApi.Dtos.Submissions;

namespace WebRtcApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubmissionController : ControllerBase
{
    private readonly DatabaseContext _context;

    public SubmissionController(DatabaseContext context)
    {
        _context = context;
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

}