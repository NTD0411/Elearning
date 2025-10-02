namespace WebRtcApi.Dtos.Users
{
    public class PaginatedUserListDto
    {
        public List<UserListDto> Users { get; set; } = new List<UserListDto>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage { get; set; }
        public bool HasNextPage { get; set; }
    }
}