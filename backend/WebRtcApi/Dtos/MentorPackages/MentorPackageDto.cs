namespace WebRtcApi.Dtos.MentorPackages
{
    public class MentorPackageDto
    {
        public int PackageId { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int DurationMonths { get; set; }
        public int? CreatedBy { get; set; }
        public string? CreatedByName { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
