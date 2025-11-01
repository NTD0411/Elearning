using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;

namespace WebRtcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<UploadController> _logger;

        public UploadController(IWebHostEnvironment environment, ILogger<UploadController> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        /// <summary>
        /// Upload profile picture
        /// </summary>
        [HttpPost("profile-picture")]
        // [Authorize] // Temporarily disabled for testing
        public async Task<ActionResult<UploadResponseDto>> UploadProfilePicture(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest("Invalid file type. Only JPG, JPEG, PNG, GIF, and WebP files are allowed.");
                }

                // Validate file size (max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest("File size too large. Maximum size is 5MB.");
                }

                // Generate unique filename
                var fileName = GenerateUniqueFileName(file.FileName);
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "profiles");
                
                // Create directory if it doesn't exist
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var filePath = Path.Combine(uploadsFolder, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return the URL path
                var fileUrl = $"/uploads/profiles/{fileName}";
                
                _logger.LogInformation($"Profile picture uploaded successfully: {fileName}");
                
                return Ok(new UploadResponseDto
                {
                    Success = true,
                    FileUrl = fileUrl,
                    FileName = fileName,
                    FileSize = file.Length,
                    Message = "Profile picture uploaded successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading profile picture");
                return StatusCode(500, new UploadResponseDto
                {
                    Success = false,
                    Message = "Internal server error while uploading file"
                });
            }
        }

        /// <summary>
        /// Delete profile picture
        /// </summary>
        [HttpDelete("profile-picture")]
        // [Authorize] // Temporarily disabled for testing
        public async Task<ActionResult> DeleteProfilePicture([FromBody] DeleteFileDto deleteRequest)
        {
            try
            {
                if (string.IsNullOrEmpty(deleteRequest.FileUrl))
                {
                    return BadRequest("File URL is required");
                }

                // Extract filename from URL
                var fileName = Path.GetFileName(deleteRequest.FileUrl);
                var filePath = Path.Combine(_environment.WebRootPath, "uploads", "profiles", fileName);

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    _logger.LogInformation($"Profile picture deleted successfully: {fileName}");
                    return Ok(new { message = "File deleted successfully" });
                }
                else
                {
                    return NotFound("File not found");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting profile picture");
                return StatusCode(500, "Internal server error while deleting file");
            }
        }

        /// <summary>
        /// Upload audio file for listening questions
        /// </summary>
        [HttpPost("audio")]
        public async Task<ActionResult<UploadResponseDto>> UploadAudio(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }

                // Validate file type
                var allowedExtensions = new[] { ".mp3", ".wav", ".ogg", ".m4a" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest("Invalid file type. Only MP3, WAV, OGG, and M4A files are allowed.");
                }

                // Validate file size (max 20MB)
                if (file.Length > 20 * 1024 * 1024)
                {
                    return BadRequest("File size too large. Maximum size is 20MB.");
                }

                // Generate unique filename
                var fileName = GenerateUniqueFileName(file.FileName, "audio");
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "audio");
                
                // Create directory if it doesn't exist
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var filePath = Path.Combine(uploadsFolder, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return the URL path
                var fileUrl = $"/uploads/audio/{fileName}";
                
                _logger.LogInformation($"Audio file uploaded successfully: {fileName}");
                
                return Ok(new UploadResponseDto
                {
                    Success = true,
                    FileUrl = fileUrl,
                    FileName = fileName,
                    FileSize = file.Length,
                    Message = "Audio file uploaded successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading audio file");
                return StatusCode(500, new UploadResponseDto
                {
                    Success = false,
                    Message = "Internal server error while uploading file"
                });
            }
        }

        /// <summary>
        /// Upload image for reading exam sets
        /// </summary>
        [HttpPost("reading-image")]
        public async Task<ActionResult<UploadResponseDto>> UploadReadingImage(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest("Invalid file type. Only JPG, JPEG, PNG, GIF, and WebP files are allowed.");
                }

                // Validate file size (max 10MB)
                if (file.Length > 10 * 1024 * 1024)
                {
                    return BadRequest("File size too large. Maximum size is 10MB.");
                }

                // Generate unique filename
                var fileName = GenerateUniqueFileName(file.FileName, "reading");
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "reading");
                
                // Create directory if it doesn't exist
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var filePath = Path.Combine(uploadsFolder, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return the URL path
                var fileUrl = $"/uploads/reading/{fileName}";
                
                _logger.LogInformation($"Reading image uploaded successfully: {fileName}");
                
                return Ok(new UploadResponseDto
                {
                    Success = true,
                    FileUrl = fileUrl,
                    FileName = fileName,
                    FileSize = file.Length,
                    Message = "Reading image uploaded successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading reading image");
                return StatusCode(500, new UploadResponseDto
                {
                    Success = false,
                    Message = "Internal server error while uploading file"
                });
            }
        }

        private string GenerateUniqueFileName(string originalFileName, string prefix = "profile")
        {
            var extension = Path.GetExtension(originalFileName);
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var randomBytes = new byte[8];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }
            var randomString = Convert.ToHexString(randomBytes).ToLowerInvariant();
            return $"{prefix}_{timestamp}_{randomString}{extension}";
        }
    }

    public class UploadResponseDto
    {
        public bool Success { get; set; }
        public string? FileUrl { get; set; }
        public string? FileName { get; set; }
        public long FileSize { get; set; }
        public string? Message { get; set; }
    }

    public class DeleteFileDto
    {
        public string FileUrl { get; set; } = string.Empty;
    }
}