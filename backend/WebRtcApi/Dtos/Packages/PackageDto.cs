namespace WebRtcApi.Dtos.Packages;

public class CreatePackageDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int DurationMonths { get; set; }
}

public class UpdatePackageDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public int? DurationMonths { get; set; }
}

public class PackageResponseDto
{
    public int PackageId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int DurationMonths { get; set; }
    public DateTime CreatedAt { get; set; }
    public CreatedByUserDto? CreatedBy { get; set; }
}

public class CreatedByUserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Avatar { get; set; }
}


