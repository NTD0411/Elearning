using Microsoft.AspNetCore.Http;

namespace WebRtcApi.Dtos.Users
{
    public class MentorRequestDto
    {
        public required IFormFile Certificate { get; set; }
        public required string Experience { get; set; }
    }
}
