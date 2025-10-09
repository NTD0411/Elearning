using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using WebRtcApi.Data;
using WebRtcApi.Dtos.Auths;
using WebRtcApi.Dtos.Profile;
using WebRtcApi.Models;
using WebRtcApi.Services.Mail;
using Microsoft.Extensions.Caching.Memory;

namespace WebRtcApi.Repositories.Auths
{
    public class AuthRepository(DatabaseContext context, IConfiguration configuration, IMailService mailService, IMemoryCache cache) : IAuthRepository
    {
        private readonly IMailService MailService = mailService;
        private readonly IMemoryCache Cache = cache;
        public async Task<TokenResponseDto> LoginAsync(LoginDto request)
        {
            // Tìm user bằng FullName hoặc Email
            var user = await context.Users.FirstOrDefaultAsync(u => 
                u.FullName == request.FullName || u.Email == request.FullName);

            if (user is null)
            {
                return null;
            }
            if (new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.PasswordHash)
                == PasswordVerificationResult.Failed)
            {
                return null;
            }

            return await CreateTokenResponse(user);
        }

        private async Task<TokenResponseDto> CreateTokenResponse(User user)
        {
            return new TokenResponseDto
            {
                AccessToken = CreateToken(user),
                RefreshToken = await GenerateAndSaveRefreshTokenAsync(user),
                User = new UserDto
                {
                    Id = user.UserId,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role,
                    PortraitUrl = user.PortraitUrl,
                    Experience = user.Experience,
                    Gender = user.Gender,
                    Address = user.Address,
                    DateOfBirth = user.DateOfBirth != default(DateOnly) ? user.DateOfBirth.ToDateTime(TimeOnly.MinValue) : null
                }
            };
        }

        public async Task<User> RegisterAsync(RegisterDto request)
        {
            if (request.Password != request.ConfirmPassword)
            {
                throw new Exception("Password and ConfirmPassword do not match.");
            }

            // Check username trùng
            if (await context.Users.AnyAsync(u => u.FullName == request.FullName))
            {
                throw new Exception("FullName is already taken.");
            }

            // Check email trùng
            if (await context.Users.AnyAsync(u => u.Email == request.Email))
            {
                throw new Exception("Email is already registered.");
            }


            var user = new User();


            var hashedPassword = new PasswordHasher<User>()
                .HashPassword(user, request.Password);

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.PasswordHash = hashedPassword;
            user.Role = "student";

            context.Users.Add(user);
            await context.SaveChangesAsync();

            // Sinh OTP và lưu vào cache với TTL 10 phút
            var otpCode = new Random().Next(100000, 999999).ToString();
            Cache.Set($"register_otp:{user.UserId}", otpCode, TimeSpan.FromMinutes(10));

            // Gửi mail
            await MailService.SendEmailAsync(user.Email, "Confirm your registration", $"Your OTP code is: {otpCode}");


            return user;
        }

        public async Task<bool> ConfirmRegisterAsync(int userId, string otpCode)
        {
            if (!Cache.TryGetValue<string>($"register_otp:{userId}", out var cachedOtp) || cachedOtp != otpCode)
            {
                return false;
            }

            // OTP đúng => có thể set user.Approved = true
            var user = await context.Users.FindAsync(userId);
            if (user != null)
            {
                user.Approved = true;
                await context.SaveChangesAsync();
            }

            Cache.Remove($"register_otp:{userId}");
            return true;
        }


        public async Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto request)
        {
            var user = await ValidateRefreshTokenAsync(request.UserId, request.RefreshToken);
            if(user is null)
            {
                return null;
            }

            if (string.IsNullOrWhiteSpace(user.Role))
            {
                user.Role = "student";
                await context.SaveChangesAsync();
            }

            return await CreateTokenResponse(user);
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration.GetValue<string>("Appsetting:Token")!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: configuration.GetValue<string>("Appsetting:Issuer"),
                audience: configuration.GetValue<string>("Appsetting:Audience"),
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();

            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }


        private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
        {
            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await context.SaveChangesAsync();
            return refreshToken;
        }

        private async Task<User> ValidateRefreshTokenAsync(int UserId, string RefreshToken)
        {
            var user = await context.Users.FindAsync(UserId);
            if (user is null || user.RefreshToken != RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return null;
            }

            return user;
        }

        public async Task<User?> UpdateProfileAsync(int userId, UpdateProfileDto dto)
        {
            var user = await context.Users.FindAsync(userId);
            if (user == null) return null;

            user.FullName = dto.FullName;
            user.Address = dto.Address;
            if (dto.DateOfBirth.HasValue)
                user.DateOfBirth = dto.DateOfBirth.Value;
            user.Gender = dto.Gender;
            user.Experience = dto.Experience;
            user.PortraitUrl = dto.PortraitUrl;
            user.UpdatedAt = dto.UpdatedAt ?? DateTime.UtcNow;

            await context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return false;

            var otp = new Random().Next(100000, 999999).ToString();
            Cache.Set($"reset_otp:{email}", otp, TimeSpan.FromMinutes(10));

            await MailService.SendEmailAsync(email, "Password Reset OTP", $"Your OTP: {otp}");
            return true;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return false;

            if (!Cache.TryGetValue<string>($"reset_otp:{dto.Email}", out var cachedOtp) || cachedOtp != dto.Otp)
                return false;

            if (dto.NewPassword != dto.ConfirmNewPassword)
                return false;

            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, dto.NewPassword);

            await context.SaveChangesAsync();
            Cache.Remove($"reset_otp:{dto.Email}");
            return true;
        }


    }
}
