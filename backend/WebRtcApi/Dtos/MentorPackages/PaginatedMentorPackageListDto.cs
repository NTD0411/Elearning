namespace WebRtcApi.Dtos.MentorPackages
{
    public class PaginatedMentorPackageListDto
    {
        public List<MentorPackageDto> MentorPackages { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage { get; set; }
        public bool HasNextPage { get; set; }
    }
}
