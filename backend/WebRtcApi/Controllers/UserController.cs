using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebRtcApi.Dtos.Users;
using WebRtcApi.Repositories.Users;

namespace WebRtcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UserController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        /// <summary>
        /// Get paginated list of users with filters
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<PaginatedUserListDto>> GetUsers([FromQuery] UserFilterDto filter)
        {
            try
            {
                var result = await _userRepository.GetUsersAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving users: {ex.Message}");
            }
        }

        /// <summary>
        /// Get all students
        /// </summary>
        [HttpGet("students")]
        public async Task<ActionResult<List<UserListDto>>> GetStudents()
        {
            try
            {
                var students = await _userRepository.GetStudentsAsync();
                return Ok(students);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving students: {ex.Message}");
            }
        }

        /// <summary>
        /// Get all mentors
        /// </summary>
        [HttpGet("mentors")]
        public async Task<ActionResult<List<UserListDto>>> GetMentors()
        {
            try
            {
                var mentors = await _userRepository.GetMentorsAsync();
                return Ok(mentors);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving mentors: {ex.Message}");
            }
        }

        /// <summary>
        /// Get user by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<UserListDto>> GetUser(int id)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound($"User with ID {id} not found");
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving user: {ex.Message}");
            }
        }

        /// <summary>
        /// Update user role
        /// </summary>
        [HttpPut("{id}/role")]
        public async Task<ActionResult> UpdateUserRole(int id, [FromBody] string role)
        {
            try
            {
                var success = await _userRepository.UpdateUserRoleAsync(id, role);
                if (!success)
                {
                    return NotFound($"User with ID {id} not found");
                }
                return Ok(new { message = "User role updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error updating user role: {ex.Message}");
            }
        }

        /// <summary>
        /// Student submits a mentor request (certificate url + experience)
        /// </summary>
        [HttpPost("{id}/mentor-request")]
        // [Authorize] // Temporarily disabled for testing
        public async Task<ActionResult> CreateMentorRequest(int id, [FromBody] MentorRequestDto request)
        {
            try
            {
                var ok = await _userRepository.CreateMentorRequestAsync(id, request.CertificateUrl, request.Experience);
                if (!ok) return NotFound($"User with ID {id} not found");
                return Ok(new { message = "Mentor request submitted" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating mentor request: {ex.Message}");
            }
        }

        /// <summary>
        /// Admin gets pending mentor requests
        /// </summary>
        [HttpGet("mentor-requests/pending")]
        // [Authorize] // Temporarily disabled for testing
        public async Task<ActionResult<List<UserListDto>>> GetPendingMentorRequests()
        {
            try
            {
                var list = await _userRepository.GetPendingMentorRequestsAsync();
                return Ok(list);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving mentor requests: {ex.Message}");
            }
        }

        /// <summary>
        /// Admin approves mentor request (promote role to mentor)
        /// </summary>
        [HttpPost("{id}/mentor-requests/approve")]
        // [Authorize] // Temporarily disabled for testing
        public async Task<ActionResult> ApproveMentorRequest(int id)
        {
            try
            {
                var ok = await _userRepository.ApproveMentorRequestAsync(id);
                if (!ok) return NotFound($"User with ID {id} not found");
                return Ok(new { message = "Mentor request approved" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error approving mentor request: {ex.Message}");
            }
        }

        /// <summary>
        /// Admin rejects mentor request
        /// </summary>
        [HttpPost("{id}/mentor-requests/reject")]
        // [Authorize] // Temporarily disabled for testing
        public async Task<ActionResult> RejectMentorRequest(int id, [FromBody] string reason)
        {
            try
            {
                var ok = await _userRepository.RejectMentorRequestAsync(id, reason);
                if (!ok) return NotFound($"User with ID {id} not found");
                return Ok(new { message = "Mentor request rejected" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error rejecting mentor request: {ex.Message}");
            }
        }

        /// <summary>
        /// Update user status
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize] // Require authentication
        public async Task<ActionResult> UpdateUserStatus(int id, [FromBody] string status)
        {
            try
            {
                var success = await _userRepository.UpdateUserStatusAsync(id, status);
                if (!success)
                {
                    return NotFound($"User with ID {id} not found");
                }
                return Ok(new { message = "User status updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error updating user status: {ex.Message}");
            }
        }

        /// <summary>
        /// Approve/disapprove user
        /// </summary>
        [HttpPut("{id}/approve")]
        [Authorize] // Require authentication
        public async Task<ActionResult> ApproveUser(int id, [FromBody] bool approved)
        {
            try
            {
                var success = await _userRepository.ApproveUserAsync(id, approved);
                if (!success)
                {
                    return NotFound($"User with ID {id} not found");
                }
                return Ok(new { message = $"User {(approved ? "approved" : "disapproved")} successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error updating user approval: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete user
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize] // Require authentication
        public async Task<ActionResult> DeleteUser(int id)
        {
            try
            {
                var success = await _userRepository.DeleteUserAsync(id);
                if (!success)
                {
                    return NotFound($"User with ID {id} not found");
                }
                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error deleting user: {ex.Message}");
            }
        }
    }
}