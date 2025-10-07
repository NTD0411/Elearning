using WebRtcApi.Models;

namespace WebRtcApi.Dtos.Auths
{
    public class TokenResponseDto
    {
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
        public required UserDto User { get; set; }
    }

    public class UserDto
    {
        public int Id { get; set; }
        public required string Email { get; set; }
        public required string FullName { get; set; }
        public string? PortraitUrl { get; set; }
        public string? Experience { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }
}
