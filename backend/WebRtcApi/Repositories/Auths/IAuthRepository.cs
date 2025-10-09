using WebRtcApi.Dtos.Auths;
using WebRtcApi.Dtos.Profile;
using WebRtcApi.Models;

namespace WebRtcApi.Repositories.Auths
{
    public interface IAuthRepository
    {
        Task<User> RegisterAsync(RegisterDto request);
        Task<TokenResponseDto?> LoginAsync(LoginDto request);
        Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto request);
        Task<User?> UpdateProfileAsync(int userId, UpdateProfileDto dto);
        Task<bool> ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(ResetPasswordDto dto);
        Task<bool> ConfirmRegisterAsync(int userId, string otpCode);

    }
}
