namespace WebRtcApi.Dtos.Users
{
    public class MentorManagementDto
    {
        public int UserId { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Status { get; set; } // "Active", "Banned", "Suspended", "Inactive"
        public bool? Approved { get; set; }
        public string? Experience { get; set; }
        public string? PortraitUrl { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int TotalStudents { get; set; } // Số lượng học sinh
        public decimal AverageRating { get; set; } // Đánh giá trung bình
    }
}