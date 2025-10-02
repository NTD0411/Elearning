using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebRtcApi.Dtos.Tips;
using WebRtcApi.Repositories.Tips;

namespace WebRtcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TipController : ControllerBase
    {
        private readonly ITipRepository _tipRepository;

        public TipController(ITipRepository tipRepository)
        {
            _tipRepository = tipRepository;
        }

        /// <summary>
        /// Get all tips with optional filtering
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<TipDto>>> GetTips([FromQuery] TipFilterDto filter)
        {
            try
            {
                var tips = await _tipRepository.GetTipsAsync(filter);
                return Ok(tips);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving tips: {ex.Message}");
            }
        }

        /// <summary>
        /// Get tip by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<TipDto>> GetTip(int id)
        {
            try
            {
                var tip = await _tipRepository.GetTipByIdAsync(id);
                if (tip == null)
                {
                    return NotFound($"Tip with ID {id} not found");
                }
                return Ok(tip);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving tip: {ex.Message}");
            }
        }

        /// <summary>
        /// Get tips by mentor ID
        /// </summary>
        [HttpGet("mentor/{mentorId}")]
        public async Task<ActionResult<List<TipDto>>> GetTipsByMentor(int mentorId)
        {
            try
            {
                var tips = await _tipRepository.GetTipsByMentorAsync(mentorId);
                return Ok(tips);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving mentor tips: {ex.Message}");
            }
        }

        /// <summary>
        /// Create a new tip (Mentor only)
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<TipDto>> CreateTip([FromBody] CreateTipDto createTipDto)
        {
            try
            {
                // Get mentor ID from JWT token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized("User ID not found in token");
                }

                if (!int.TryParse(userIdClaim.Value, out int mentorId))
                {
                    return BadRequest("Invalid user ID format");
                }

                // Check if user is a mentor
                var roleClaim = User.FindFirst(ClaimTypes.Role);
                if (roleClaim?.Value != "mentor")
                {
                    return StatusCode(403, new { message = "Only mentors can create tips" });
                }

                var tip = await _tipRepository.CreateTipAsync(createTipDto, mentorId);
                
                // Return the created tip with mentor info
                var createdTip = await _tipRepository.GetTipByIdAsync(tip.TipId);
                return CreatedAtAction(nameof(GetTip), new { id = tip.TipId }, createdTip);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating tip: {ex.Message}");
            }
        }

        /// <summary>
        /// Update a tip (Mentor only - own tips)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult> UpdateTip(int id, [FromBody] UpdateTipDto updateTipDto)
        {
            try
            {
                // Get mentor ID from JWT token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized("User ID not found in token");
                }

                if (!int.TryParse(userIdClaim.Value, out int mentorId))
                {
                    return BadRequest("Invalid user ID format");
                }

                // Check if user is a mentor
                var roleClaim = User.FindFirst(ClaimTypes.Role);
                if (roleClaim?.Value != "mentor")
                {
                    return StatusCode(403, new { message = "Only mentors can update tips" });
                }

                var success = await _tipRepository.UpdateTipAsync(id, updateTipDto, mentorId);
                if (!success)
                {
                    return NotFound($"Tip with ID {id} not found or you don't have permission to update it");
                }

                return Ok(new { message = "Tip updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error updating tip: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete a tip (Mentor only - own tips)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteTip(int id)
        {
            try
            {
                // Get mentor ID from JWT token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized("User ID not found in token");
                }

                if (!int.TryParse(userIdClaim.Value, out int mentorId))
                {
                    return BadRequest("Invalid user ID format");
                }

                // Check if user is a mentor
                var roleClaim = User.FindFirst(ClaimTypes.Role);
                if (roleClaim?.Value != "mentor")
                {
                    return StatusCode(403, new { message = "Only mentors can delete tips" });
                }

                var success = await _tipRepository.DeleteTipAsync(id, mentorId);
                if (!success)
                {
                    return NotFound($"Tip with ID {id} not found or you don't have permission to delete it");
                }

                return Ok(new { message = "Tip deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error deleting tip: {ex.Message}");
            }
        }
    }
}
