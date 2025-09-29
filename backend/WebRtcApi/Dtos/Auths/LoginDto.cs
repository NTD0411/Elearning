namespace WebRtcApi.Dtos.Auths
{
    public class LoginDto
    {
        public string FullName { get; set; } = null!;

        public string PasswordHash { get; set; } = null!;
    }
}
