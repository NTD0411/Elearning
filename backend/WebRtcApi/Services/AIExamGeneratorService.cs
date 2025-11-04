using OpenAI;
using OpenAI.Chat;
using System.Text.Json;
using System.Text.Json.Serialization;
using WebRtcApi.Models;
using System.ClientModel;

namespace WebRtcApi.Services
{
    // Custom JSON converter to handle correctAnswer as number or string
    public class FlexibleStringConverter : JsonConverter<string>
    {
        public override string? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.String)
            {
                return reader.GetString();
            }
            else if (reader.TokenType == JsonTokenType.Number)
            {
                // Convert number to letter (0->A, 1->B, 2->C, 3->D)
                var num = reader.GetInt32();
                return num switch
                {
                    0 => "A",
                    1 => "B",
                    2 => "C",
                    3 => "D",
                    _ => num.ToString()
                };
            }
            return reader.GetString();
        }

        public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value);
        }
    }

    public class AIExamGeneratorService
    {
        private readonly OpenAIClient _openAIClient;
        private readonly ILogger<AIExamGeneratorService> _logger;
        private readonly string _modelName;
        private readonly TextToSpeechService _ttsService;

        public AIExamGeneratorService(
            IConfiguration configuration, 
            ILogger<AIExamGeneratorService> logger,
            TextToSpeechService ttsService)
        {
            var apiKey = configuration["Groq:ApiKey"];
            var baseUrl = configuration["Groq:BaseUrl"];
            _modelName = configuration["Groq:Model"] ?? "llama-3.1-70b-versatile";
            
            if (string.IsNullOrEmpty(apiKey))
            {
                throw new ArgumentException("Groq API key is required");
            }
            
            // Groq API is compatible with OpenAI client
            _openAIClient = new OpenAIClient(new ApiKeyCredential(apiKey), new OpenAIClientOptions
            {
                Endpoint = new Uri(baseUrl ?? "https://api.groq.com/openai/v1")
            });
            _logger = logger;
            _ttsService = ttsService;
        }

        #region Reading Exam Generation

        public async Task<GeneratedReadingExam> GenerateReadingExamAsync(string topic, string difficulty, int numberOfQuestions)
        {
            try
            {
                _logger.LogInformation("Generating Reading exam - Topic: {Topic}, Difficulty: {Difficulty}, Questions: {Count}", 
                    topic, difficulty, numberOfQuestions);

                var systemPrompt = @"You are an expert IELTS Reading exam creator. Generate a complete IELTS Reading passage with Multiple Choice questions ONLY.

IMPORTANT: ALL questions must be Multiple Choice format with 4 options (A, B, C, D).

Respond in this exact JSON format:
{
  ""examSetTitle"": ""Title of the reading set"",
  ""examSetCode"": ""READING_XXXXX"",
  ""readingContext"": ""The full reading passage text (500-700 words)"",
  ""questions"": [
    {
      ""questionText"": ""Question text"",
      ""questionType"": ""MultipleChoice"",
      ""optionA"": ""Option A text"",
      ""optionB"": ""Option B text"",
      ""optionC"": ""Option C text"",
      ""optionD"": ""Option D text"",
      ""correctAnswer"": ""A or B or C or D (single letter only)""
    }
  ]
}";

                var userPrompt = $@"Generate an IELTS Reading exam with the following specifications:
- Topic: {topic}
- Difficulty Level: {difficulty} (Band 5-6: Easy, Band 6-7: Medium, Band 7-8: Hard)
- Number of Questions: {numberOfQuestions}
- ALL questions MUST be Multiple Choice with 4 options (A, B, C, D)
- Make the passage academically challenging and engaging
- Ensure questions test comprehension, inference, and vocabulary skills";

                var chatMessages = new List<ChatMessage>
                {
                    new SystemChatMessage(systemPrompt),
                    new UserChatMessage(userPrompt)
                };

                _logger.LogInformation("Sending request to Groq API for Reading exam generation...");
                var chatCompletion = await _openAIClient.GetChatClient(_modelName)
                    .CompleteChatAsync(chatMessages, new ChatCompletionOptions
                    {
                        Temperature = 0.7f,
                        MaxOutputTokenCount = 3000,
                        ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat()
                    });

                var response = chatCompletion.Value.Content[0].Text;
                _logger.LogInformation("Reading exam generated successfully");

                var result = JsonSerializer.Deserialize<GeneratedReadingExam>(response, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return result ?? throw new Exception("Failed to parse generated reading exam");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Reading exam");
                throw;
            }
        }

        #endregion

        #region Listening Exam Generation

        public async Task<GeneratedListeningExam> GenerateListeningExamAsync(string topic, string difficulty, int numberOfQuestions)
        {
            try
            {
                _logger.LogInformation("Generating Listening exam - Topic: {Topic}, Difficulty: {Difficulty}, Questions: {Count}", 
                    topic, difficulty, numberOfQuestions);

                var systemPrompt = @"You are an expert IELTS Listening exam creator. Generate a complete IELTS Listening test with ONE continuous audio.

CRITICAL: Create ONE single continuous conversation/lecture that students will listen to ONCE to answer ALL questions.
This mimics real IELTS format where:
- ONE audio recording plays through
- Students hear it once (or twice max)
- They answer multiple questions based on different parts of that single audio

IMPORTANT RULES:
1. Create a LONG, cohesive audio script (800-1500 words) that covers all question topics
2. ALL questions MUST be Multiple Choice type with exactly 4 options (A, B, C, D)
3. correctAnswer MUST be a STRING: ""A"", ""B"", ""C"", or ""D"" (NOT a number)
4. Every question MUST have all 4 options filled with meaningful choices
5. Questions should test different parts of the audio (early, middle, late sections)

Respond in this exact JSON format:
{
  ""examSetTitle"": ""Title of the listening set"",
  ""examSetCode"": ""LISTENING_XXXXX"",
  ""audioScript"": ""Full continuous transcript of ONE audio recording. Include: speaker names, natural pauses [pause], emphasis markings, detailed dialogue that allows answering ALL questions. Make it 800-1500 words."",
  ""audioDescription"": ""Brief description: e.g., 'A 7-minute conversation between two university students discussing their research project and planning their presentation'"",
  ""timeLimit"": 30,
  ""questions"": [
    {
      ""questionText"": ""Question about the audio (specify which part: beginning/middle/end)"",
      ""questionType"": ""MultipleChoice"",
      ""optionA"": ""First option"",
      ""optionB"": ""Second option"",
      ""optionC"": ""Third option"",
      ""optionD"": ""Fourth option"",
      ""correctAnswer"": ""A""
    }
  ]
}

CRITICAL: Do NOT generate Fill in Blank, Matching, or any other type. ONLY Multiple Choice with 4 options.";

                var userPrompt = $@"Generate an IELTS Listening exam with the following specifications:
- Topic: {topic}
- Difficulty Level: {difficulty}
- Number of Questions: {numberOfQuestions}
- Create ONE continuous audio script (conversation/lecture/discussion) that covers ALL questions
- The audio script should be 5-10 minutes when spoken (800-1500 words)
- Include various accents hints (British, American, Australian)
- Students will listen to this SINGLE audio file ONCE and answer all {numberOfQuestions} questions
- ALL questions must be Multiple Choice type with 4 options (A, B, C, D)
- Questions should test understanding of different parts of the audio (beginning, middle, end)";

                var chatMessages = new List<ChatMessage>
                {
                    new SystemChatMessage(systemPrompt),
                    new UserChatMessage(userPrompt)
                };

                _logger.LogInformation("Sending request to Groq API for Listening exam generation...");
                var chatCompletion = await _openAIClient.GetChatClient(_modelName)
                    .CompleteChatAsync(chatMessages, new ChatCompletionOptions
                    {
                        Temperature = 0.7f,
                        MaxOutputTokenCount = 3000,
                        ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat()
                    });

                var response = chatCompletion.Value.Content[0].Text;
                _logger.LogInformation("Listening exam generated successfully");

                var result = JsonSerializer.Deserialize<GeneratedListeningExam>(response, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (result == null)
                {
                    throw new Exception("Failed to parse generated listening exam");
                }

                // Generate audio from script using Edge TTS
                if (!string.IsNullOrEmpty(result.AudioScript))
                {
                    try
                    {
                        var audioFilename = $"{result.ExamSetCode}_{DateTime.Now:yyyyMMddHHmmss}.mp3";
                        _logger.LogInformation("Generating audio file: {Filename}", audioFilename);
                        
                        var audioUrl = await _ttsService.GenerateAudioAsync(result.AudioScript, audioFilename);
                        result.AudioUrl = audioUrl;
                        
                        _logger.LogInformation("Audio generated successfully: {AudioUrl}", audioUrl);
                    }
                    catch (Exception audioEx)
                    {
                        _logger.LogError(audioEx, "Failed to generate audio, but exam will be created without audio");
                        // Don't fail the entire exam generation if audio fails
                        result.AudioUrl = null;
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Listening exam");
                throw;
            }
        }

        #endregion

        #region Writing Exam Generation

        public async Task<GeneratedWritingExam> GenerateWritingExamAsync(string topic, string difficulty, string examType)
        {
            try
            {
                _logger.LogInformation("Generating Writing exam - Topic: {Topic}, Difficulty: {Difficulty}, Type: {Type}", 
                    topic, difficulty, examType);

                var systemPrompt = @"You are an expert IELTS Writing exam creator. Generate complete IELTS Writing Task 1 and Task 2.

IELTS Writing has two tasks:
- Task 1: Describe visual information (graphs, charts, diagrams, maps) - 150 words minimum, 20 minutes
- Task 2: Essay on a given topic (opinion, discussion, problem-solution, advantages-disadvantages) - 250 words minimum, 40 minutes

Respond in this exact JSON format:
{
  ""examSetTitle"": ""Writing Test Title"",
  ""examSetCode"": ""WRITING_XXXXX"",
  ""task1Title"": ""Academic Task 1: Describe the chart"",
  ""task1Description"": ""You should spend about 20 minutes on this task. The chart below shows... Write at least 150 words."",
  ""task1ImageDescription"": ""Detailed description of what chart/graph to create (this will help admin to create or find appropriate image)"",
  ""task1Requirements"": ""Summarize the information, make comparisons, report main features"",
  ""task1MinWords"": 150,
  ""task1MaxTime"": 20,
  ""task2Title"": ""Task 2: Essay"",
  ""task2Question"": ""The essay question"",
  ""task2Context"": ""Background information or context"",
  ""task2Requirements"": ""Give reasons, provide examples, support your opinion"",
  ""task2MinWords"": 250,
  ""task2MaxTime"": 40,
  ""totalTimeMinutes"": 60,
  ""instructions"": ""General instructions for the writing test""
}";

                var userPrompt = $@"Generate an IELTS Writing exam with the following specifications:
- Topic: {topic}
- Difficulty Level: {difficulty}
- Essay Type for Task 2: {examType} (Opinion Essay, Discussion Essay, Problem-Solution, Advantages-Disadvantages, or Two-part Question)
- Task 1 should describe visual data (graphs, charts, tables, diagrams, maps, or processes)
- Task 2 should be thought-provoking and relevant to current issues
- Both tasks should be academically appropriate";

                var chatMessages = new List<ChatMessage>
                {
                    new SystemChatMessage(systemPrompt),
                    new UserChatMessage(userPrompt)
                };

                _logger.LogInformation("Sending request to Groq API for Writing exam generation...");
                var chatCompletion = await _openAIClient.GetChatClient(_modelName)
                    .CompleteChatAsync(chatMessages, new ChatCompletionOptions
                    {
                        Temperature = 0.7f,
                        MaxOutputTokenCount = 2000,
                        ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat()
                    });

                var response = chatCompletion.Value.Content[0].Text;
                _logger.LogInformation("Writing exam generated successfully");

                var result = JsonSerializer.Deserialize<GeneratedWritingExam>(response, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return result ?? throw new Exception("Failed to parse generated writing exam");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Writing exam");
                throw;
            }
        }

        #endregion

        #region Speaking Exam Generation

        public async Task<GeneratedSpeakingExam> GenerateSpeakingExamAsync(string topic, string difficulty)
        {
            try
            {
                _logger.LogInformation("Generating Speaking exam - Topic: {Topic}, Difficulty: {Difficulty}", 
                    topic, difficulty);

                var systemPrompt = @"You are an expert IELTS Speaking exam creator. Generate a complete IELTS Speaking test with all 3 parts.

IELTS Speaking Structure:
- Part 1: Introduction & Interview (4-5 minutes) - Personal questions about familiar topics
- Part 2: Long Turn (3-4 minutes) - Speak about a specific topic using a cue card with prompts (1 minute preparation, 2 minutes speaking)
- Part 3: Discussion (4-5 minutes) - More abstract questions related to Part 2 topic

Respond in this exact JSON format:
{
  ""examSetTitle"": ""Speaking Test Title"",
  ""examSetCode"": ""SPEAKING_XXXXX"",
  ""part1Questions"": [
    {
      ""partNumber"": 1,
      ""partTitle"": ""Introduction and Interview"",
      ""questionText"": ""Question text"",
      ""timeLimit"": 1
    }
  ],
  ""part2CueCard"": {
    ""partNumber"": 2,
    ""partTitle"": ""Long Turn"",
    ""cueCardTopic"": ""Describe a....."",
    ""cueCardPrompts"": ""You should say:\n- Point 1\n- Point 2\n- Point 3\n- And explain..."",
    ""questionText"": ""Describe a....."",
    ""timeLimit"": 3
  },
  ""part3Questions"": [
    {
      ""partNumber"": 3,
      ""partTitle"": ""Discussion"",
      ""questionText"": ""Question text"",
      ""timeLimit"": 1
    }
  ]
}";

                var userPrompt = $@"Generate an IELTS Speaking exam with the following specifications:
- Main Topic: {topic}
- Difficulty Level: {difficulty}

Part 1: Generate 4-5 questions about familiar topics (home, work, studies, hobbies, family)
Part 2: Create ONE cue card with a topic and 3-4 bullet points for the candidate to cover
Part 3: Generate 4-5 more abstract/analytical questions related to the Part 2 topic

Make questions natural and conversational, progressing from simple to complex.";

                var chatMessages = new List<ChatMessage>
                {
                    new SystemChatMessage(systemPrompt),
                    new UserChatMessage(userPrompt)
                };

                _logger.LogInformation("Sending request to Groq API for Speaking exam generation...");
                var chatCompletion = await _openAIClient.GetChatClient(_modelName)
                    .CompleteChatAsync(chatMessages, new ChatCompletionOptions
                    {
                        Temperature = 0.7f,
                        MaxOutputTokenCount = 2000,
                        ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat()
                    });

                var response = chatCompletion.Value.Content[0].Text;
                _logger.LogInformation("Speaking exam generated successfully");

                var result = JsonSerializer.Deserialize<GeneratedSpeakingExam>(response, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return result ?? throw new Exception("Failed to parse generated speaking exam");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Speaking exam");
                throw;
            }
        }

        #endregion
    }

    #region Response Models

    public class GeneratedReadingExam
    {
        public string ExamSetTitle { get; set; } = "";
        public string ExamSetCode { get; set; } = "";
        public string ReadingContext { get; set; } = "";
        public List<GeneratedReadingQuestion> Questions { get; set; } = new();
    }

    public class GeneratedReadingQuestion
    {
        public string QuestionText { get; set; } = "";
        public string QuestionType { get; set; } = "";
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? OptionE { get; set; }
        public string? OptionF { get; set; }
        public string? OptionG { get; set; }
        public string? OptionH { get; set; }
        
        [JsonConverter(typeof(FlexibleStringConverter))]
        public string CorrectAnswer { get; set; } = "";
    }

    public class GeneratedListeningExam
    {
        public string ExamSetTitle { get; set; } = "";
        public string ExamSetCode { get; set; } = "";
        public string AudioScript { get; set; } = "";
        public string AudioDescription { get; set; } = "";
        public string? AudioUrl { get; set; }
        public int TimeLimit { get; set; }
        public List<GeneratedListeningQuestion> Questions { get; set; } = new();
    }

    public class GeneratedListeningQuestion
    {
        public string QuestionText { get; set; } = "";
        public string QuestionType { get; set; } = "";
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? OptionE { get; set; }
        public string? OptionF { get; set; }
        public string? OptionG { get; set; }
        public string? OptionH { get; set; }
        
        [JsonConverter(typeof(FlexibleStringConverter))]
        public string CorrectAnswer { get; set; } = "";
    }

    public class GeneratedWritingExam
    {
        public string ExamSetTitle { get; set; } = "";
        public string ExamSetCode { get; set; } = "";
        public string Task1Title { get; set; } = "";
        public string Task1Description { get; set; } = "";
        public string Task1ImageDescription { get; set; } = "";
        public string Task1Requirements { get; set; } = "";
        public int Task1MinWords { get; set; }
        public int Task1MaxTime { get; set; }
        public string Task2Title { get; set; } = "";
        public string Task2Question { get; set; } = "";
        public string Task2Context { get; set; } = "";
        public string Task2Requirements { get; set; } = "";
        public int Task2MinWords { get; set; }
        public int Task2MaxTime { get; set; }
        public int TotalTimeMinutes { get; set; }
        public string Instructions { get; set; } = "";
    }

    public class GeneratedSpeakingExam
    {
        public string ExamSetTitle { get; set; } = "";
        public string ExamSetCode { get; set; } = "";
        public List<GeneratedSpeakingQuestion> Part1Questions { get; set; } = new();
        public GeneratedSpeakingQuestion Part2CueCard { get; set; } = new();
        public List<GeneratedSpeakingQuestion> Part3Questions { get; set; } = new();
    }

    public class GeneratedSpeakingQuestion
    {
        public int PartNumber { get; set; }
        public string PartTitle { get; set; } = "";
        public string QuestionText { get; set; } = "";
        public string? CueCardTopic { get; set; }
        public string? CueCardPrompts { get; set; }
        public int TimeLimit { get; set; }
    }

    #endregion
}
