namespace WebRtcApi.Dtos.MentorPackages
{
    public class MentorPackageFilterDto
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? MinDuration { get; set; }
        public int? MaxDuration { get; set; }
        public int? CreatedBy { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; } = "desc";
    }
}
