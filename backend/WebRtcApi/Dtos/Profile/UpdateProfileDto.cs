namespace WebRtcApi.Dtos.Profile
{
    public class UpdateProfileDto
    {
        public string FullName { get; set; } = null!;
        public string? PortraitUrl { get; set; }
        public string? Experience { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public DateOnly DateOfBirth { get; set; }
    }
}
