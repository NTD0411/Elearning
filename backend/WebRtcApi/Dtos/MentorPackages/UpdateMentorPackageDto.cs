using System.ComponentModel.DataAnnotations;

namespace WebRtcApi.Dtos.MentorPackages
{
    public class UpdateMentorPackageDto
    {
        [Required(ErrorMessage = "Package name is required")]
        [StringLength(100, ErrorMessage = "Package name cannot exceed 100 characters")]
        public required string Name { get; set; }

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Price is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Duration is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Duration must be at least 1 month")]
        public int DurationMonths { get; set; }
    }
}
