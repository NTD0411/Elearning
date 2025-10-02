namespace WebRtcApi.Dtos.Tips
{
    public class TipDto
    {
        public int TipId { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int? MentorId { get; set; }
        public string? MentorFullName { get; set; }
    }

    public class CreateTipDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }

    public class UpdateTipDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }

    public class TipFilterDto
    {
        public string? SearchTerm { get; set; }
        public int? MentorId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}

