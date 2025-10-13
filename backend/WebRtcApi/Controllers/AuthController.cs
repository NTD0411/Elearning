using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Org.BouncyCastle.Bcpg;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using WebRtcApi.Dtos.Auths;
using WebRtcApi.Dtos.Profile;
using WebRtcApi.Models;
using WebRtcApi.Repositories.Auths;

namespace WebRtcApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthRepository authRepository) : ControllerBase
    {
        public static User user =new();

        [HttpGet("health")]
        public IActionResult HealthCheck()
        {
            return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(RegisterDto request)
        {
            var user = await authRepository.RegisterAsync(request);
            if (user is null)
            {
                return BadRequest("UserName already exsist");
            }

            return Ok(user);
        }

        [HttpPost("confirm-register")]
        public async Task<ActionResult> ConfirmRegister(int userId, string otpCode)
        {
            var success = await authRepository.ConfirmRegisterAsync(userId, otpCode);
            if (!success)
                return BadRequest("Invalid or expired OTP.");

            return Ok("Account confirmed successfully!");
        }

        [HttpPost("login")]
        public async Task<ActionResult<TokenResponseDto>> Login(LoginDto request)
        {
            var result = await authRepository.LoginAsync(request);
            if (result is null)
            {
                return BadRequest("Invalid username or password");
            }

            return Ok(result); 
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<RefreshTokenRequestDto>> RefreshToken(RefreshTokenRequestDto request)
        {
            var result = await authRepository.RefreshTokensAsync(request);
            if (result is null || result.AccessToken is null || result.RefreshToken is null)
                return Unauthorized("Invalid refresh token. ");

            return Ok(result);
        }

        // [Authorize] // Temporarily disabled for testing
        [HttpPut("update-profile")]
        public async Task<ActionResult<User>> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            // Temporarily use a hardcoded user ID for testing
            // TODO: Get user ID from JWT claims when authentication is enabled
            int userId = 1; // This should be replaced with actual user ID from token
            
            // var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            // if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            // {
            //     return Unauthorized("Invalid user token.");
            // }

            var updatedUser = await authRepository.UpdateProfileAsync(userId, dto);
            if (updatedUser is null)
                return NotFound("User not found.");

            return Ok(updatedUser);
        }

        [HttpPost("forgot-password")]
        public async Task<ActionResult> ForgotPassword(string email)
        {
            var success = await authRepository.ForgotPasswordAsync(email);
            if (!success)
                return NotFound("Email not found.");

            return Ok("OTP sent to email.");
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult> ResetPassword(ResetPasswordDto dto)
        {
            var success = await authRepository.ResetPasswordAsync(dto);
            if (!success)
                return BadRequest("Invalid request. Check email, OTP or password match.");

            return Ok("Password reset successfully!");
        }

        [Authorize]
        [HttpGet]
        public IActionResult AuthenticatedOnlyEndpoint()
        {
            return Ok("You are authenticated! ");
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin-only")]
        public IActionResult AdminOnlyEndpoint()
        {
            return Ok("You are admin! ");
        }
    }
}
