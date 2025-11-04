using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebRtcApi.Dtos.LearningGoals;
using WebRtcApi.Services;

namespace WebRtcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LearningRoadmapController : ControllerBase
    {
        private readonly ILearningRoadmapService _roadmapService;
        private readonly ILogger<LearningRoadmapController> _logger;

        public LearningRoadmapController(
            ILearningRoadmapService roadmapService,
            ILogger<LearningRoadmapController> logger)
        {
            _roadmapService = roadmapService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        /// <summary>
        /// Create a new learning goal with AI-generated roadmap
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateLearningGoal([FromBody] CreateLearningGoalDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized("User not authenticated");

                var result = await _roadmapService.CreateLearningGoalAsync(userId, dto);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating learning goal");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get user's active learning goal
        /// </summary>
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveGoal()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized("User not authenticated");

                var goal = await _roadmapService.GetUserGoalAsync(userId);
                
                if (goal == null)
                    return NotFound(new { success = false, message = "No active goal found" });

                return Ok(new { success = true, data = goal });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active goal");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get all user's learning goals (history)
        /// </summary>
        [HttpGet("all")]
        public async Task<IActionResult> GetAllGoals()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized("User not authenticated");

                var goals = await _roadmapService.GetAllUserGoalsAsync(userId);
                return Ok(new { success = true, data = goals });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all goals");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Manually mark a step as completed
        /// </summary>
        [HttpPost("step/{stepId}/complete")]
        public async Task<IActionResult> CompleteStep(int stepId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized("User not authenticated");

                var success = await _roadmapService.CompleteStepAsync(userId, stepId);
                
                if (!success)
                    return NotFound(new { success = false, message = "Step not found" });

                return Ok(new { success = true, message = "Step marked as completed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing step");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get progress statistics
        /// </summary>
        [HttpGet("progress")]
        public async Task<IActionResult> GetProgress()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized("User not authenticated");

                var goal = await _roadmapService.GetUserGoalAsync(userId);
                
                if (goal == null)
                    return NotFound(new { success = false, message = "No active goal found" });

                var stats = new
                {
                    currentBand = goal.CurrentBand,
                    targetBand = goal.TargetBand,
                    progressPercentage = goal.ProgressPercentage,
                    completedExams = goal.CompletedExams,
                    totalExamsRequired = goal.TotalExamsRequired,
                    completedSteps = goal.RoadmapSteps.Count(s => s.IsCompleted),
                    totalSteps = goal.RoadmapSteps.Count,
                    daysRemaining = (goal.TargetDate - DateTime.Now).Days,
                    status = goal.Status
                };

                return Ok(new { success = true, data = stats });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting progress");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
