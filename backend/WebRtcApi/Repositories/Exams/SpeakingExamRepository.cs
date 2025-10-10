using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;
using WebRtcApi.Models;
using WebRtcApi.Dtos.Exams;

namespace WebRtcApi.Repositories.Exams
{
    public class SpeakingExamRepository : ISpeakingExamRepository
    {
        private readonly DatabaseContext _context;

        public SpeakingExamRepository(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SpeakingExam>> GetAllAsync()
        {
            return await _context.SpeakingExams
                .Include(s => s.ExamSet)
                .ToListAsync();
        }

        public async Task<SpeakingExam?> GetByIdAsync(int id)
        {
            return await _context.SpeakingExams
                .Include(s => s.ExamSet)
                .FirstOrDefaultAsync(s => s.SpeakingExamId == id);
        }

        public async Task<IEnumerable<SpeakingExam>> GetByExamSetIdAsync(int examSetId)
        {
            return await _context.SpeakingExams
                .Include(s => s.ExamSet)
                .Where(s => s.ExamSetId == examSetId)
                .ToListAsync();
        }

        public async Task<SpeakingExam> CreateAsync(CreateSpeakingExamDto createDto)
        {
            var speakingExam = new SpeakingExam
            {
                ExamSetId = createDto.ExamSetId,
                QuestionText = createDto.QuestionText,
                PartNumber = createDto.PartNumber,
                PartTitle = createDto.PartTitle,
                CueCardTopic = createDto.CueCardTopic,
                CueCardPrompts = createDto.CueCardPrompts,
                TimeLimit = createDto.TimeLimit,
                CreatedAt = DateTime.UtcNow
            };

            _context.SpeakingExams.Add(speakingExam);
            await _context.SaveChangesAsync();
            
            return await GetByIdAsync(speakingExam.SpeakingExamId) ?? speakingExam;
        }

        public async Task<SpeakingExam?> UpdateAsync(int id, UpdateSpeakingExamDto updateDto)
        {
            var speakingExam = await _context.SpeakingExams.FindAsync(id);
            if (speakingExam == null)
                return null;

            if (updateDto.ExamSetId.HasValue)
                speakingExam.ExamSetId = updateDto.ExamSetId;
            
            if (!string.IsNullOrEmpty(updateDto.QuestionText))
                speakingExam.QuestionText = updateDto.QuestionText;

            if (updateDto.PartNumber.HasValue)
                speakingExam.PartNumber = updateDto.PartNumber.Value;

            if (!string.IsNullOrEmpty(updateDto.PartTitle))
                speakingExam.PartTitle = updateDto.PartTitle;

            if (updateDto.CueCardTopic != null)
                speakingExam.CueCardTopic = updateDto.CueCardTopic;

            if (updateDto.CueCardPrompts != null)
                speakingExam.CueCardPrompts = updateDto.CueCardPrompts;

            if (updateDto.TimeLimit.HasValue)
                speakingExam.TimeLimit = updateDto.TimeLimit;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var speakingExam = await _context.SpeakingExams.FindAsync(id);
            if (speakingExam == null)
                return false;

            _context.SpeakingExams.Remove(speakingExam);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.SpeakingExams.AnyAsync(s => s.SpeakingExamId == id);
        }
    }
}