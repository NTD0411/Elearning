using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace WebRtcApi.Services.Mail
{
    public class MailService : IMailService
    {
        private readonly IConfiguration _config;

        public MailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(
                _config["MailSettings:SenderName"],
                _config["MailSettings:SenderEmail"]
            ));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;
            email.Body = new TextPart("plain") { Text = body };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(
                _config["MailSettings:SmtpServer"],
                int.Parse(_config["MailSettings:SmtpPort"]),
                SecureSocketOptions.StartTls
            );
            await smtp.AuthenticateAsync(
                _config["MailSettings:Username"],
                _config["MailSettings:Password"]
            );
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }
}
