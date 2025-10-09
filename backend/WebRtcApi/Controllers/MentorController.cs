using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebRtcApi.Dtos.Users;
using WebRtcApi.Repositories.Users;

namespace WebRtcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class MentorController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public MentorController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        /// <summary>
        /// Get all mentors for management
        /// </summary>
        [HttpGet("management")]
        [Authorize] // Require admin role
        public async Task<ActionResult<List<MentorManagementDto>>> GetMentorManagementList()
        {
            try
            {
                var mentors = await _userRepository.GetMentorManagementListAsync();
                return Ok(mentors);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving mentor management list: {ex.Message}");
            }
        }

        /// <summary>
        /// Get mentor management details by ID
        /// </summary>
        [HttpGet("management/{id}")]
        [Authorize]
        public async Task<ActionResult<MentorManagementDto>> GetMentorManagement(int id)
        {
            try
            {
                var mentor = await _userRepository.GetMentorManagementByIdAsync(id);
                if (mentor == null)
                {
                    return NotFound($"Mentor with ID {id} not found");
                }
                return Ok(mentor);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving mentor management details: {ex.Message}");
            }
        }

        /// <summary>
        /// Ban a mentor
        /// </summary>
        [HttpPost("{id}/ban")]
        [Authorize]
        public async Task<ActionResult> BanMentor(int id, [FromBody] BanMentorRequestDto request)
        {
            try
            {
                var success = await _userRepository.BanMentorAsync(id, request.Reason);
                if (!success)
                {
                    return NotFound($"Mentor with ID {id} not found");
                }
                return Ok(new { message = "Mentor banned successfully", reason = request.Reason });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error banning mentor: {ex.Message}");
            }
        }

        /// <summary>
        /// Unban a mentor
        /// </summary>
        [HttpPost("{id}/unban")]
        [Authorize]
        public async Task<ActionResult> UnbanMentor(int id)
        {
            try
            {
                var success = await _userRepository.UnbanMentorAsync(id);
                if (!success)
                {
                    return NotFound($"Mentor with ID {id} not found");
                }
                return Ok(new { message = "Mentor unbanned successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error unbanning mentor: {ex.Message}");
            }
        }

        /// <summary>
        /// Update mentor status
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<ActionResult> UpdateMentorStatus(int id, [FromBody] MentorStatusUpdateDto statusUpdate)
        {
            try
            {
                var success = await _userRepository.UpdateMentorStatusAsync(id, statusUpdate);
                if (!success)
                {
                    return NotFound($"Mentor with ID {id} not found");
                }
                return Ok(new { message = $"Mentor status updated to {statusUpdate.Status}" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error updating mentor status: {ex.Message}");
            }
        }

        /// <summary>
        /// Get mentor statistics
        /// </summary>
        [HttpGet("statistics")]
        [Authorize]
        public async Task<ActionResult> GetMentorStatistics()
        {
            try
            {
                var mentors = await _userRepository.GetMentorManagementListAsync();
                
                var statistics = new
                {
                    TotalMentors = mentors.Count,
                    ActiveMentors = mentors.Count(m => m.Status == "Active"),
                    BannedMentors = mentors.Count(m => m.Status == "Banned"),
                    PendingApproval = mentors.Count(m => m.Approved == false),
                    ApprovedMentors = mentors.Count(m => m.Approved == true)
                };

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving mentor statistics: {ex.Message}");
            }
        }
    }

    public class BanMentorRequestDto
    {
        public required string Reason { get; set; }
    }
}