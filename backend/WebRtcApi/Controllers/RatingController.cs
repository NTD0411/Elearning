using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;
using WebRtcApi.Models;

namespace WebRtcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RatingController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public RatingController(DatabaseContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Create a new rating
        /// </summary>
        [HttpPost]
        // [Authorize] // Temporarily disabled for testing
        public async Task<ActionResult<Rating>> CreateRating([FromBody] CreateRatingDto ratingDto)
        {
            try
            {
                var student = await _context.Users.FirstOrDefaultAsync(u => u.UserId == ratingDto.StudentId);
                if (student == null || !string.Equals(student.Role, "student", StringComparison.OrdinalIgnoreCase))
                {
                    return Forbid("Only students can submit ratings.");
                }

                var mentor = await _context.Users.FirstOrDefaultAsync(u => u.UserId == ratingDto.MentorId);
                if (mentor == null || !string.Equals(mentor.Role, "mentor", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest("Invalid mentor specified.");
                }

                var hasMentorGradedSubmission = await _context.Feedbacks
                    .Include(f => f.Submission)
                    .AnyAsync(f =>
                        f.MentorId == ratingDto.MentorId &&
                        f.Submission != null &&
                        f.Submission.UserId == ratingDto.StudentId);

                if (!hasMentorGradedSubmission)
                {
                    return BadRequest("You can only rate mentors who have graded your submissions.");
                }

                var rating = new Rating
                {
                    StudentId = ratingDto.StudentId,
                    MentorId = ratingDto.MentorId,
                    Score = ratingDto.RatingValue,
                    Comment = ratingDto.Comment,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Ratings.Add(rating);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Rating created successfully", ratingId = rating.RatingId });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating rating: {ex.Message}");
            }
        }

        /// <summary>
        /// Check if a student is eligible to rate a mentor
        /// </summary>
        [HttpGet("eligibility")]
        public async Task<ActionResult<RatingEligibilityDto>> CheckRatingEligibility([FromQuery] int studentId, [FromQuery] int mentorId)
        {
            try
            {
                var student = await _context.Users.FirstOrDefaultAsync(u => u.UserId == studentId);
                if (student == null || !string.Equals(student.Role, "student", StringComparison.OrdinalIgnoreCase))
                {
                    return Ok(new RatingEligibilityDto { CanRate = false });
                }

                var hasMentorGradedSubmission = await _context.Feedbacks
                    .Include(f => f.Submission)
                    .AnyAsync(f =>
                        f.MentorId == mentorId &&
                        f.Submission != null &&
                        f.Submission.UserId == studentId);

                return Ok(new RatingEligibilityDto { CanRate = hasMentorGradedSubmission });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error checking rating eligibility: {ex.Message}");
            }
        }

        /// <summary>
        /// Get ratings for a specific mentor
        /// </summary>
        [HttpGet("mentor/{mentorId}")]
        public async Task<ActionResult<List<RatingResponseDto>>> GetMentorRatings(int mentorId)
        {
            try
            {
                var ratings = await _context.Ratings
                    .Where(r => r.MentorId == mentorId)
                    .Include(r => r.Student)
                    .Select(r => new RatingResponseDto
                    {
                        RatingId = r.RatingId,
                        StudentId = r.StudentId ?? 0,
                        MentorId = r.MentorId ?? 0,
                        RatingValue = r.Score ?? 0,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt,
                        StudentName = r.Student != null ? r.Student.FullName : "Unknown Student"
                    })
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                return Ok(ratings);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving ratings: {ex.Message}");
            }
        }

        /// <summary>
        /// Get ratings by a specific student
        /// </summary>
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<List<RatingResponseDto>>> GetStudentRatings(int studentId)
        {
            try
            {
                var ratings = await _context.Ratings
                    .Where(r => r.StudentId == studentId)
                    .Include(r => r.Mentor)
                    .Select(r => new RatingResponseDto
                    {
                        RatingId = r.RatingId,
                        StudentId = r.StudentId ?? 0,
                        MentorId = r.MentorId ?? 0,
                        RatingValue = r.Score ?? 0,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt,
                        MentorName = r.Mentor != null ? r.Mentor.FullName : "Unknown Mentor"
                    })
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                return Ok(ratings);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving ratings: {ex.Message}");
            }
        }

        /// <summary>
        /// Get average rating for a mentor
        /// </summary>
        [HttpGet("mentor/{mentorId}/average")]
        public async Task<ActionResult<AverageRatingDto>> GetMentorAverageRating(int mentorId)
        {
            try
            {
                var ratings = await _context.Ratings
                    .Where(r => r.MentorId == mentorId)
                    .Select(r => r.Score ?? 0)
                    .ToListAsync();

                var averageRating = ratings.Count > 0 ? ratings.Average() : 0;
                var totalRatings = ratings.Count;

                return Ok(new AverageRatingDto
                {
                    MentorId = mentorId,
                    AverageRating = Math.Round(averageRating, 2),
                    TotalRatings = totalRatings
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving average rating: {ex.Message}");
            }
        }
    }

    public class CreateRatingDto
    {
        public int StudentId { get; set; }
        public int MentorId { get; set; }
        public int RatingValue { get; set; }
        public string? Comment { get; set; }
    }

    public class RatingResponseDto
    {
        public int RatingId { get; set; }
        public int StudentId { get; set; }
        public int MentorId { get; set; }
        public int RatingValue { get; set; }
        public string? Comment { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? StudentName { get; set; }
        public string? MentorName { get; set; }
    }

    public class AverageRatingDto
    {
        public int MentorId { get; set; }
        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }
    }

    public class RatingEligibilityDto
    {
        public bool CanRate { get; set; }
    }
}

