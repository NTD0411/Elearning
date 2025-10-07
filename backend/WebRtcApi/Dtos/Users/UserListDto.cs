namespace WebRtcApi.Dtos.Users
{
    public class UserListDto
    {
        public int UserId { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Role { get; set; }
        public string? Status { get; set; }
        public string? PortraitUrl { get; set; }
        public string? Experience { get; set; }
        public bool? Approved { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}