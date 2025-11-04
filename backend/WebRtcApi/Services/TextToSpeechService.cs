using System.Diagnostics;

namespace WebRtcApi.Services
{
    public class TextToSpeechService
    {
        private readonly ILogger<TextToSpeechService> _logger;
        private readonly IWebHostEnvironment _environment;
        private readonly string _pythonScriptPath;
        private readonly string _audioOutputFolder;

        public TextToSpeechService(
            ILogger<TextToSpeechService> logger,
            IWebHostEnvironment environment)
        {
            _logger = logger;
            _environment = environment;
            _pythonScriptPath = Path.Combine(_environment.ContentRootPath, "Scripts", "edge_tts_generator.py");
            _audioOutputFolder = Path.Combine(_environment.WebRootPath, "audio", "listening");
            
            // Ensure audio folder exists
            Directory.CreateDirectory(_audioOutputFolder);
        }

        public async Task<string> GenerateAudioAsync(string text, string filename, string voice = "en-US-JennyNeural")
        {
            try
            {
                var outputPath = Path.Combine(_audioOutputFolder, filename);
                
                _logger.LogInformation("Generating audio: {Filename}", filename);

                var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "python",
                        Arguments = $"\"{_pythonScriptPath}\" \"{text}\" \"{outputPath}\" \"{voice}\"",
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    }
                };

                process.Start();
                string output = await process.StandardOutput.ReadToEndAsync();
                string error = await process.StandardError.ReadToEndAsync();
                await process.WaitForExitAsync();

                if (process.ExitCode != 0)
                {
                    _logger.LogError("TTS Error: {Error}", error);
                    throw new Exception($"Failed to generate audio: {error}");
                }

                _logger.LogInformation("Audio generated successfully: {Output}", output);

                // Return relative URL
                return $"/audio/listening/{filename}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating audio for {Filename}", filename);
                throw;
            }
        }
    }
}
