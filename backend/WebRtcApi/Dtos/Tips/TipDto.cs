namespace WebRtcApi.Dtos.Tips;

public class CreateTipDto
{
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
}

public class UpdateTipDto
{
    public string? Title { get; set; }
    public string? Content { get; set; }
}

public class TipResponseDto
{
    public int TipId { get; set; }
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public MentorDto? Mentor { get; set; }
}

public class MentorDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Avatar { get; set; }
}