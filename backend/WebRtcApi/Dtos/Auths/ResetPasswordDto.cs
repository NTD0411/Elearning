namespace WebRtcApi.Dtos.Auths
{
    public class ResetPasswordDto
    {
        public string Email { get; set; }
        public string Otp { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmNewPassword { get; set; }
    }
}
