namespace WebRtcApi.Dtos.Auths
{
    public class UserOtp
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string OtpCode { get; set; } = string.Empty;
        public DateTime ExpiryTime { get; set; }
    }
}
