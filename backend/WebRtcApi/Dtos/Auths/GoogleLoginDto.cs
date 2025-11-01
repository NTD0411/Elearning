namespace WebRtcApi.Dtos.Auths;

public class GoogleLoginDto
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? GoogleId { get; set; }
    public string? Image { get; set; }
}

