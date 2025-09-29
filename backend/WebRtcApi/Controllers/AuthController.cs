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

        [Authorize]
        [HttpPut("update-profile")]
        public async Task<ActionResult<User>> UpdateProfile(int userId, UpdateProfileDto dto)
        {
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
