namespace WebRtcApi.Dtos.Users
{
    public class UserFilterDto
    {
        public string? Role { get; set; } // "student", "mentor", "admin"
        public string? Status { get; set; }
        public bool? Approved { get; set; }
        public string? Gender { get; set; }
        public string? SearchTerm { get; set; } // Search by name or email
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "CreatedAt"; // "FullName", "Email", "CreatedAt"
        public string? SortDirection { get; set; } = "desc"; // "asc", "desc"
    }
}