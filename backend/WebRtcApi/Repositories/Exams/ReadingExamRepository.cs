using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;
using WebRtcApi.Models;
using WebRtcApi.Dtos.Exams;

namespace WebRtcApi.Repositories.Exams
{
    public class ReadingExamRepository : IReadingExamRepository
    {
        private readonly DatabaseContext _context;

        public ReadingExamRepository(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReadingExam>> GetAllAsync()
        {
            return await _context.ReadingExams
                .Include(r => r.ExamSet)
                .ToListAsync();
        }

        public async Task<ReadingExam?> GetByIdAsync(int id)
        {
            return await _context.ReadingExams
                .Include(r => r.ExamSet)
                .FirstOrDefaultAsync(r => r.ReadingExamId == id);
        }

        public async Task<IEnumerable<ReadingExam>> GetByExamSetIdAsync(int examSetId)
        {
            return await _context.ReadingExams
                .Include(r => r.ExamSet)
                .Where(r => r.ExamSetId == examSetId)
                .ToListAsync();
        }

        public async Task<ReadingExam> CreateAsync(CreateReadingExamDto createDto)
        {
            var readingExam = new ReadingExam
            {
                ExamSetId = createDto.ExamSetId,
                QuestionText = createDto.QuestionText,
                OptionA = createDto.OptionA,
                OptionB = createDto.OptionB,
                OptionC = createDto.OptionC,
                OptionD = createDto.OptionD,
                AnswerFill = createDto.AnswerFill,
                CorrectAnswer = createDto.CorrectAnswer,
                CreatedAt = DateTime.UtcNow
            };

            _context.ReadingExams.Add(readingExam);
            await _context.SaveChangesAsync();
            
            return await GetByIdAsync(readingExam.ReadingExamId) ?? readingExam;
        }

        public async Task<ReadingExam?> UpdateAsync(int id, UpdateReadingExamDto updateDto)
        {
            var readingExam = await _context.ReadingExams.FindAsync(id);
            if (readingExam == null)
                return null;

            if (updateDto.ExamSetId.HasValue)
                readingExam.ExamSetId = updateDto.ExamSetId;
            
            if (!string.IsNullOrEmpty(updateDto.QuestionText))
                readingExam.QuestionText = updateDto.QuestionText;
            
            if (updateDto.OptionA != null)
                readingExam.OptionA = updateDto.OptionA;
            
            if (updateDto.OptionB != null)
                readingExam.OptionB = updateDto.OptionB;
            
            if (updateDto.OptionC != null)
                readingExam.OptionC = updateDto.OptionC;
            
            if (updateDto.OptionD != null)
                readingExam.OptionD = updateDto.OptionD;
            
            if (updateDto.AnswerFill != null)
                readingExam.AnswerFill = updateDto.AnswerFill;
            
            if (!string.IsNullOrEmpty(updateDto.CorrectAnswer))
                readingExam.CorrectAnswer = updateDto.CorrectAnswer;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var readingExam = await _context.ReadingExams.FindAsync(id);
            if (readingExam == null)
                return false;

            _context.ReadingExams.Remove(readingExam);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.ReadingExams.AnyAsync(r => r.ReadingExamId == id);
        }
    }
}