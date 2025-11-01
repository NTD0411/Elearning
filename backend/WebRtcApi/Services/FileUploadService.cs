using Microsoft.AspNetCore.Http;

namespace WebRtcApi.Services;

public interface IFileUploadService
{
    Task<string> UploadFileAsync(IFormFile file, string folder);
}

public class FileUploadService : IFileUploadService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<FileUploadService> _logger;

    public FileUploadService(IWebHostEnvironment environment, ILogger<FileUploadService> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public async Task<string> UploadFileAsync(IFormFile file, string folder)
    {
        try
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("No file uploaded");

            // Create folder if it doesn't exist
            var uploadsFolder = Path.Combine(_environment.WebRootPath, folder);
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename
            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Save file
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // Return relative URL
            return $"/{folder}/{uniqueFileName}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file");
            throw;
        }
    }
}