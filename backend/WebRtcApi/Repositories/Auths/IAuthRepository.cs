using WebRtcApi.Dtos;
using WebRtcApi.Models;

namespace WebRtcApi.Repositories.Auths
{
    public interface IAuthRepository
    {
        Task<User> RegisterAsync(UserDto request);
        Task<TokenResponseDto?> LoginAsync(UserDto request);
        Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto request);
    }
}
