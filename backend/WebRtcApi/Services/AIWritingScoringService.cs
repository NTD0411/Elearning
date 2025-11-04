using OpenAI;
using OpenAI.Chat;
using System.ClientModel;
using System.Text.Json;

namespace WebRtcApi.Services
{
    public class AIWritingScoringService
    {
        private readonly OpenAIClient _openAIClient;
        private readonly ILogger<AIWritingScoringService> _logger;
        private readonly string _modelName;

        public AIWritingScoringService(IConfiguration configuration, ILogger<AIWritingScoringService> logger)
        {
            // Use Groq API instead of OpenAI
            var apiKey = configuration["Groq:ApiKey"];
            var baseUrl = configuration["Groq:BaseUrl"];
            _modelName = configuration["Groq:Model"] ?? "llama-3.3-70b-versatile";
            
            if (string.IsNullOrEmpty(apiKey))
            {
                throw new ArgumentException("Groq API key is required");
            }
            
            _openAIClient = string.IsNullOrEmpty(baseUrl) 
                ? new OpenAIClient(new ApiKeyCredential(apiKey))
                : new OpenAIClient(new ApiKeyCredential(apiKey), new OpenAIClientOptions { Endpoint = new Uri(baseUrl) });
            
            _logger = logger;
        }

        public async Task<WritingScoreResult> ScoreWritingAsync(string prompt, string studentResponse, string writingType)
        {
            try
            {
                _logger.LogInformation("Starting AI scoring for writing type: {WritingType}", writingType);
                _logger.LogInformation("Prompt length: {PromptLength}, Response length: {ResponseLength}", 
                    prompt?.Length ?? 0, studentResponse?.Length ?? 0);

                var systemPrompt = GetSystemPrompt(writingType);
                var userPrompt = GetUserPrompt(prompt, studentResponse);

                var chatMessages = new List<ChatMessage>
                {
                    new SystemChatMessage(systemPrompt),
                    new UserChatMessage(userPrompt)
                };

                _logger.LogInformation("Sending request to Groq API...");
                var chatCompletion = await _openAIClient.GetChatClient(_modelName)
                    .CompleteChatAsync(chatMessages, new ChatCompletionOptions
                    {
                        Temperature = 0.3f, // Lower temperature for consistent scoring
                        MaxOutputTokenCount = 1000
                    });

                var response = chatCompletion.Value.Content[0].Text;
                _logger.LogInformation("AI Response received: {Response}", response);

                var result = ParseScoringResponse(response);
                _logger.LogInformation("AI scoring completed. Overall band: {Band}", result.OverallBand);
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while scoring writing. Prompt: {Prompt}, Response: {Response}", 
                    prompt, studentResponse);
                
                // Return fallback scoring if OpenAI API fails
                return new WritingScoreResult
                {
                    OverallBand = 5.0m,
                    TaskAchievementScore = 5,
                    TaskAchievementFeedback = "AI scoring unavailable. Manual review required.",
                    CoherenceCohesionScore = 5,
                    CoherenceCohesionFeedback = "AI scoring unavailable. Manual review required.",
                    LexicalResourceScore = 5,
                    LexicalResourceFeedback = "AI scoring unavailable. Manual review required.",
                    GrammaticalRangeScore = 5,
                    GrammaticalRangeFeedback = "AI scoring unavailable. Manual review required.",
                    GeneralFeedback = "AI scoring service is currently unavailable. Your submission has been saved and will be reviewed manually by our instructors."
                };
            }
        }

        private string GetSystemPrompt(string writingType)
        {
            return $@"You are an expert IELTS examiner. Your task is to score {writingType} writing tasks according to official IELTS criteria.

Score the writing response on 4 criteria (each 0-9 scale):
1. Task Achievement (Task 1) / Task Response (Task 2): How well the task requirements are fulfilled
2. Coherence and Cohesion: How well ideas are organized and connected
3. Lexical Resource: Vocabulary range, accuracy, and appropriateness
4. Grammatical Range and Accuracy: Grammar variety and correctness

For each criterion, provide:
- Score (0-9)
- Brief justification (2-3 sentences)

Calculate overall band score as average of 4 criteria, rounded to nearest 0.5.

Respond in this exact JSON format:
{{
  ""overallBand"": 6.5,
  ""taskAchievement"": {{
    ""score"": 6,
    ""feedback"": ""Your feedback here""
  }},
  ""coherenceCohesion"": {{
    ""score"": 7,
    ""feedback"": ""Your feedback here""
  }},
  ""lexicalResource"": {{
    ""score"": 6,
    ""feedback"": ""Your feedback here""
  }},
  ""grammaticalRange"": {{
    ""score"": 7,
    ""feedback"": ""Your feedback here""
  }},
  ""generalFeedback"": ""Overall comments and improvement suggestions""
}}";
        }

        private string GetUserPrompt(string prompt, string studentResponse)
        {
            return $@"Task Prompt:
{prompt}

Student Response:
{studentResponse}

Please score this IELTS writing response according to the 4 criteria.";
        }

        private WritingScoreResult ParseScoringResponse(string response)
        {
            try
            {
                // Clean the response - remove any markdown formatting and leading text
                var cleanResponse = response.Trim();
                
                // Remove leading text before JSON (like "Here is the score for...")
                var jsonStartIndex = cleanResponse.IndexOf('{');
                if (jsonStartIndex > 0)
                {
                    cleanResponse = cleanResponse.Substring(jsonStartIndex);
                }
                
                // Remove markdown code block markers
                if (cleanResponse.Contains("```json"))
                {
                    var startIndex = cleanResponse.IndexOf("```json") + 7;
                    var endIndex = cleanResponse.LastIndexOf("```");
                    if (endIndex > startIndex)
                    {
                        cleanResponse = cleanResponse.Substring(startIndex, endIndex - startIndex).Trim();
                    }
                }
                else if (cleanResponse.Contains("```"))
                {
                    // Remove just ``` markers
                    cleanResponse = cleanResponse.Replace("```", "").Trim();
                }
                
                // If still has leading text, extract JSON between { and }
                if (!cleanResponse.StartsWith("{"))
                {
                    jsonStartIndex = cleanResponse.IndexOf('{');
                    var jsonEndIndex = cleanResponse.LastIndexOf('}');
                    if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex)
                    {
                        cleanResponse = cleanResponse.Substring(jsonStartIndex, jsonEndIndex - jsonStartIndex + 1);
                    }
                }

                _logger.LogInformation("Cleaned JSON response: {CleanResponse}", cleanResponse);

                var scoreData = JsonSerializer.Deserialize<JsonElement>(cleanResponse);

                return new WritingScoreResult
                {
                    OverallBand = scoreData.GetProperty("overallBand").GetDecimal(),
                    TaskAchievementScore = (int)Math.Round(scoreData.GetProperty("taskAchievement").GetProperty("score").GetDecimal()),
                    TaskAchievementFeedback = scoreData.GetProperty("taskAchievement").GetProperty("feedback").GetString() ?? "",
                    CoherenceCohesionScore = (int)Math.Round(scoreData.GetProperty("coherenceCohesion").GetProperty("score").GetDecimal()),
                    CoherenceCohesionFeedback = scoreData.GetProperty("coherenceCohesion").GetProperty("feedback").GetString() ?? "",
                    LexicalResourceScore = (int)Math.Round(scoreData.GetProperty("lexicalResource").GetProperty("score").GetDecimal()),
                    LexicalResourceFeedback = scoreData.GetProperty("lexicalResource").GetProperty("feedback").GetString() ?? "",
                    GrammaticalRangeScore = (int)Math.Round(scoreData.GetProperty("grammaticalRange").GetProperty("score").GetDecimal()),
                    GrammaticalRangeFeedback = scoreData.GetProperty("grammaticalRange").GetProperty("feedback").GetString() ?? "",
                    GeneralFeedback = scoreData.GetProperty("generalFeedback").GetString() ?? ""
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse AI scoring response: {Response}", response);
                
                // Return a fallback score if parsing fails
                return new WritingScoreResult
                {
                    OverallBand = 5.0m,
                    TaskAchievementScore = 5,
                    TaskAchievementFeedback = "Unable to process AI feedback. Please review manually.",
                    CoherenceCohesionScore = 5,
                    CoherenceCohesionFeedback = "Unable to process AI feedback. Please review manually.",
                    LexicalResourceScore = 5,
                    LexicalResourceFeedback = "Unable to process AI feedback. Please review manually.",
                    GrammaticalRangeScore = 5,
                    GrammaticalRangeFeedback = "Unable to process AI feedback. Please review manually.",
                    GeneralFeedback = "AI scoring encountered an error. Manual review recommended."
                };
            }
        }
    }

    public class WritingScoreResult
    {
        public decimal OverallBand { get; set; }
        public int TaskAchievementScore { get; set; }
        public string TaskAchievementFeedback { get; set; } = string.Empty;
        public int CoherenceCohesionScore { get; set; }
        public string CoherenceCohesionFeedback { get; set; } = string.Empty;
        public int LexicalResourceScore { get; set; }
        public string LexicalResourceFeedback { get; set; } = string.Empty;
        public int GrammaticalRangeScore { get; set; }
        public string GrammaticalRangeFeedback { get; set; } = string.Empty;
        public string GeneralFeedback { get; set; } = string.Empty;
    }
}