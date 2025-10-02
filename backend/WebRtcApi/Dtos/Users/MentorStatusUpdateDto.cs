namespace WebRtcApi.Dtos.Users
{
    public class MentorStatusUpdateDto
    {
        public required string Status { get; set; } // "Active", "Banned", "Suspended", "Inactive"
        public string? Reason { get; set; } // Lý do thay đổi status (lưu vào Experience field hoặc log)
    }
}