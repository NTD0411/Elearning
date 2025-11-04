using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenAI.Chat;
using WebRtcApi.Data;
using WebRtcApi.Dtos.LearningGoals;
using WebRtcApi.Models;

namespace WebRtcApi.Services
{
    public interface ILearningRoadmapService
    {
        Task<LearningGoalResponseDto> CreateLearningGoalAsync(int userId, CreateLearningGoalDto dto);
        Task<LearningGoalResponseDto?> GetUserGoalAsync(int userId);
        Task<List<LearningGoalResponseDto>> GetAllUserGoalsAsync(int userId);
        Task UpdateProgressAsync(int userId, int submissionId);
        Task<bool> CompleteStepAsync(int userId, int stepId);
    }

    public class LearningRoadmapService : ILearningRoadmapService
    {
        private readonly DatabaseContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<LearningRoadmapService> _logger;
        private readonly ChatClient _chatClient;

        public LearningRoadmapService(
            DatabaseContext context,
            IConfiguration configuration,
            ILogger<LearningRoadmapService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;

            // Use Groq API
            var apiKey = configuration["Groq:ApiKey"] ?? throw new InvalidOperationException("Groq API Key is not configured");
            var endpoint = new Uri("https://api.groq.com/openai/v1");
            var model = "llama-3.3-70b-versatile";

            _chatClient = new ChatClient(model: model, credential: new System.ClientModel.ApiKeyCredential(apiKey), options: new OpenAI.OpenAIClientOptions
            {
                Endpoint = endpoint
            });
        }

        public async Task<LearningGoalResponseDto> CreateLearningGoalAsync(int userId, CreateLearningGoalDto dto)
        {
            // Get available courses from database
            var availableCourses = await _context.ExamCourse
                .Include(c => c.ExamCourseExamSets)
                .Where(c => dto.FocusSkill == "All" || c.ExamType.ToLower() == dto.FocusSkill.ToLower())
                .Select(c => new
                {
                    c.ExamCourseId,
                    c.CourseTitle,
                    c.CourseCode,
                    c.ExamType,
                    TotalExamSets = c.ExamCourseExamSets.Count
                })
                .ToListAsync();

            // Generate AI roadmap
            var roadmapData = await GenerateRoadmapWithAI(dto, availableCourses.ToList<object>());

            // Calculate total exams needed
            int totalExams = roadmapData.Steps.Sum(s => s.RecommendedExamSets);

            // Create learning goal
            var learningGoal = new LearningGoal
            {
                UserId = userId,
                GoalTitle = dto.GoalTitle,
                Description = dto.Description,
                TargetBand = dto.TargetBand,
                FocusSkill = dto.FocusSkill,
                TargetDate = dto.TargetDate,
                CurrentBand = dto.CurrentBand,
                TotalExamsRequired = totalExams,
                Status = "active",
                AiGeneratedPlan = roadmapData.OverallPlan
            };

            _context.LearningGoals.Add(learningGoal);
            await _context.SaveChangesAsync();

            // Create roadmap steps with recommended courses
            var steps = new List<RoadmapStep>();
            foreach (var stepData in roadmapData.Steps)
            {
                var step = new RoadmapStep
                {
                    LearningGoalId = learningGoal.LearningGoalId,
                    StepOrder = stepData.Order,
                    Title = stepData.Title,
                    Description = stepData.Description,
                    SkillType = stepData.SkillType,
                    Difficulty = stepData.Difficulty,
                    RecommendedExamSets = stepData.RecommendedExamSets,
                    Tips = stepData.Tips
                };

                _context.RoadmapSteps.Add(step);
                await _context.SaveChangesAsync();

                // Link recommended courses to this step
                foreach (var courseRec in stepData.RecommendedCourses)
                {
                    // Check if ExamCourse exists before adding
                    var courseExists = await _context.ExamCourse
                        .AnyAsync(ec => ec.ExamCourseId == courseRec.CourseId);
                    
                    if (courseExists)
                    {
                        var roadmapCourse = new RoadmapCourse
                        {
                            RoadmapStepId = step.RoadmapStepId,
                            ExamCourseId = courseRec.CourseId,
                            RecommendationOrder = courseRec.Priority,
                            ReasonForRecommendation = courseRec.Reason
                        };
                        _context.RoadmapCourses.Add(roadmapCourse);
                    }
                    else
                    {
                        _logger.LogWarning($"ExamCourse {courseRec.CourseId} not found, skipping recommendation");
                    }
                }

                steps.Add(step);
            }

            await _context.SaveChangesAsync();

            return await GetGoalByIdAsync(learningGoal.LearningGoalId);
        }

        private async Task<RoadmapGenerationResult> GenerateRoadmapWithAI(
            CreateLearningGoalDto goal,
            List<object> availableCourses)
        {
            var coursesJson = JsonSerializer.Serialize(availableCourses);

            var prompt = $@"You are an IELTS learning expert. Generate a personalized learning roadmap.

STUDENT GOAL:
- Target IELTS Band: {goal.TargetBand}
- Current Band: {goal.CurrentBand}
- Focus Skill: {goal.FocusSkill}
- Target Date: {goal.TargetDate:yyyy-MM-dd}
- Description: {goal.Description}

AVAILABLE COURSES IN SYSTEM:
{coursesJson}

TASK:
1. Create 4-6 progressive learning steps
2. For each step, recommend 2-4 courses from the available list
3. Explain why each course is recommended
4. Provide study tips for each step

Return JSON format:
{{
  ""overallPlan"": ""brief strategy summary"",
  ""steps"": [
    {{
      ""order"": 1,
      ""title"": ""Step title"",
      ""description"": ""What to focus on"",
      ""skillType"": ""Reading/Writing/Listening/Speaking"",
      ""difficulty"": ""beginner/intermediate/advanced"",
      ""recommendedExamSets"": 5,
      ""tips"": ""Study tips"",
      ""recommendedCourses"": [
        {{
          ""courseId"": 1,
          ""priority"": 1,
          ""reason"": ""Why this course fits""
        }}
      ]
    }}
  ]
}}

Focus on: {goal.FocusSkill}
Return ONLY valid JSON, no markdown.";

            try
            {
                var messages = new List<ChatMessage>
                {
                    new SystemChatMessage("You are an expert IELTS learning advisor. Return only valid JSON."),
                    new UserChatMessage(prompt)
                };

                var completion = await _chatClient.CompleteChatAsync(messages);
                var responseText = completion.Value.Content[0].Text;

                _logger.LogInformation("AI Roadmap Response: {Response}", responseText);

                // Clean response
                responseText = ExtractJsonFromResponse(responseText);

                var result = JsonSerializer.Deserialize<RoadmapGenerationResult>(responseText, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return result ?? throw new Exception("Failed to parse AI response");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating roadmap with AI");
                
                // Fallback: generate basic roadmap
                return GenerateFallbackRoadmap(goal, availableCourses);
            }
        }

        private string ExtractJsonFromResponse(string response)
        {
            // Remove markdown code blocks
            response = response.Trim();
            if (response.StartsWith("```"))
            {
                var lines = response.Split('\n');
                response = string.Join('\n', lines.Skip(1).SkipLast(1));
            }

            // Find first { and last }
            int firstBrace = response.IndexOf('{');
            int lastBrace = response.LastIndexOf('}');

            if (firstBrace >= 0 && lastBrace > firstBrace)
            {
                response = response.Substring(firstBrace, lastBrace - firstBrace + 1);
            }

            return response;
        }

        private RoadmapGenerationResult GenerateFallbackRoadmap(
            CreateLearningGoalDto goal,
            List<object> availableCourses)
        {
            // Simple fallback roadmap  
            var steps = new List<RoadmapStepData>();
            
            for (int i = 0; i < 4 && i < availableCourses.Count; i++)
            {
                var courseRecs = new List<CourseRecommendation>();
                
                // Try to get up to 2 courses starting from index i
                for (int j = i; j < availableCourses.Count && courseRecs.Count < 2; j++)
                {
                    try
                    {
                        dynamic course = availableCourses[j];
                        courseRecs.Add(new CourseRecommendation
                        {
                            CourseId = (int)course.ExamCourseId,
                            Priority = courseRecs.Count + 1,
                            Reason = "Matches your learning level"
                        });
                    }
                    catch
                    {
                        continue;
                    }
                }
                
                steps.Add(new RoadmapStepData
                {
                    Order = i + 1,
                    Title = $"Step {i + 1}: Practice {goal.FocusSkill}",
                    Description = $"Focus on building {goal.FocusSkill} skills at {(i < 2 ? "beginner" : "intermediate")} level",
                    SkillType = goal.FocusSkill,
                    Difficulty = i < 2 ? "beginner" : "intermediate",
                    RecommendedExamSets = 5,
                    Tips = "Practice consistently and review mistakes",
                    RecommendedCourses = courseRecs
                });
            }

            return new RoadmapGenerationResult
            {
                OverallPlan = $"Progressive learning path to reach Band {goal.TargetBand}",
                Steps = steps
            };
        }

        public async Task<LearningGoalResponseDto?> GetUserGoalAsync(int userId)
        {
            var goal = await _context.LearningGoals
                .Where(g => g.UserId == userId && g.Status == "active")
                .OrderByDescending(g => g.CreatedAt)
                .FirstOrDefaultAsync();

            if (goal == null) return null;

            return await GetGoalByIdAsync(goal.LearningGoalId);
        }

        public async Task<List<LearningGoalResponseDto>> GetAllUserGoalsAsync(int userId)
        {
            var goals = await _context.LearningGoals
                .Where(g => g.UserId == userId)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();

            var result = new List<LearningGoalResponseDto>();
            foreach (var goal in goals)
            {
                result.Add(await GetGoalByIdAsync(goal.LearningGoalId));
            }

            return result;
        }

        private async Task<LearningGoalResponseDto> GetGoalByIdAsync(int goalId)
        {
            var goal = await _context.LearningGoals
                .Include(g => g.RoadmapSteps)
                    .ThenInclude(s => s.RecommendedCourses)
                        .ThenInclude(rc => rc.ExamCourse)
                            .ThenInclude(ec => ec.ExamCourseExamSets)
                .FirstOrDefaultAsync(g => g.LearningGoalId == goalId);

            if (goal == null) throw new Exception("Goal not found");

            return new LearningGoalResponseDto
            {
                LearningGoalId = goal.LearningGoalId,
                UserId = goal.UserId,
                GoalTitle = goal.GoalTitle,
                Description = goal.Description,
                TargetBand = goal.TargetBand,
                FocusSkill = goal.FocusSkill,
                TargetDate = goal.TargetDate,
                CurrentBand = goal.CurrentBand,
                ProgressPercentage = goal.ProgressPercentage,
                CompletedExams = goal.CompletedExams,
                TotalExamsRequired = goal.TotalExamsRequired,
                Status = goal.Status,
                CreatedAt = goal.CreatedAt,
                CompletedAt = goal.CompletedAt,
                AiGeneratedPlan = goal.AiGeneratedPlan,
                RoadmapSteps = goal.RoadmapSteps.OrderBy(s => s.StepOrder).Select(s => new RoadmapStepDto
                {
                    RoadmapStepId = s.RoadmapStepId,
                    StepOrder = s.StepOrder,
                    Title = s.Title,
                    Description = s.Description,
                    SkillType = s.SkillType,
                    Difficulty = s.Difficulty,
                    RecommendedExamSets = s.RecommendedExamSets,
                    ResourceLinks = s.ResourceLinks,
                    Tips = s.Tips,
                    IsCompleted = s.IsCompleted,
                    CompletedAt = s.CompletedAt,
                    ExamsCompleted = s.ExamsCompleted,
                    RecommendedCourses = s.RecommendedCourses.OrderBy(rc => rc.RecommendationOrder).Select(rc => new RecommendedCourseDto
                    {
                        RoadmapCourseId = rc.RoadmapCourseId,
                        ExamCourseId = rc.ExamCourseId,
                        CourseTitle = rc.ExamCourse.CourseTitle,
                        CourseCode = rc.ExamCourse.CourseCode,
                        ExamType = rc.ExamCourse.ExamType,
                        TotalExamSets = rc.ExamCourse.ExamCourseExamSets.Count,
                        RecommendationOrder = rc.RecommendationOrder,
                        ReasonForRecommendation = rc.ReasonForRecommendation,
                        IsCompleted = rc.IsCompleted
                    }).ToList()
                }).ToList()
            };
        }

        public async Task UpdateProgressAsync(int userId, int submissionId)
        {
            // Get submission with score
            var submission = await _context.Submissions
                .FirstOrDefaultAsync(s => s.SubmissionId == submissionId && s.UserId == userId);

            if (submission == null || !submission.AiScore.HasValue) return;

            // Get active goal
            var goal = await _context.LearningGoals
                .Include(g => g.RoadmapSteps)
                .Where(g => g.UserId == userId && g.Status == "active")
                .OrderByDescending(g => g.CreatedAt)
                .FirstOrDefaultAsync();

            if (goal == null) return;

            // Update completed exams count
            goal.CompletedExams++;
            goal.CurrentBand = submission.AiScore.Value;

            // Calculate progress percentage
            goal.ProgressPercentage = Math.Min(100, (decimal)goal.CompletedExams / goal.TotalExamsRequired * 100);

            // Check if goal is completed
            if (goal.CurrentBand >= decimal.Parse(goal.TargetBand))
            {
                goal.Status = "completed";
                goal.CompletedAt = DateTime.UtcNow;
            }

            // Update related step progress
            var examCourseId = submission.ExamCourseId;
            var relatedSteps = goal.RoadmapSteps
                .Where(s => !s.IsCompleted)
                .ToList();

            foreach (var step in relatedSteps)
            {
                var hasRelatedCourse = await _context.RoadmapCourses
                    .AnyAsync(rc => rc.RoadmapStepId == step.RoadmapStepId && rc.ExamCourseId == examCourseId);

                if (hasRelatedCourse)
                {
                    step.ExamsCompleted++;
                    
                    // Mark step as completed if reached recommendation
                    if (step.ExamsCompleted >= step.RecommendedExamSets)
                    {
                        step.IsCompleted = true;
                        step.CompletedAt = DateTime.UtcNow;
                    }
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task<bool> CompleteStepAsync(int userId, int stepId)
        {
            var step = await _context.RoadmapSteps
                .Include(s => s.LearningGoal)
                .FirstOrDefaultAsync(s => s.RoadmapStepId == stepId && s.LearningGoal.UserId == userId);

            if (step == null) return false;

            step.IsCompleted = true;
            step.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }

    // Helper classes for AI response parsing
    public class RoadmapGenerationResult
    {
        public string OverallPlan { get; set; } = string.Empty;
        public List<RoadmapStepData> Steps { get; set; } = new();
    }

    public class RoadmapStepData
    {
        public int Order { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string SkillType { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public int RecommendedExamSets { get; set; }
        public string Tips { get; set; } = string.Empty;
        public List<CourseRecommendation> RecommendedCourses { get; set; } = new();
    }

    public class CourseRecommendation
    {
        public int CourseId { get; set; }
        public int Priority { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
