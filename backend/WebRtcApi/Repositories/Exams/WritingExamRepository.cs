using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;
using WebRtcApi.Models;
using WebRtcApi.Dtos.Exams;

namespace WebRtcApi.Repositories.Exams
{
    public class WritingExamRepository : IWritingExamRepository
    {
        private readonly DatabaseContext _context;

        public WritingExamRepository(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<WritingExam>> GetAllAsync()
        {
            return await _context.WritingExams
                .Include(w => w.ExamSet)
                .ToListAsync();
        }

        public async Task<WritingExam?> GetByIdAsync(int id)
        {
            return await _context.WritingExams
                .Include(w => w.ExamSet)
                .FirstOrDefaultAsync(w => w.WritingExamId == id);
        }

        public async Task<IEnumerable<WritingExam>> GetByExamSetIdAsync(int examSetId)
        {
            return await _context.WritingExams
                .Include(w => w.ExamSet)
                .Where(w => w.ExamSetId == examSetId)
                .ToListAsync();
        }

        public async Task<WritingExam> CreateAsync(CreateWritingExamDto createDto)
        {
            var writingExam = new WritingExam
            {
                ExamSetId = createDto.ExamSetId,
                QuestionText = createDto.QuestionText,
                CreatedAt = DateTime.UtcNow
            };

            _context.WritingExams.Add(writingExam);
            await _context.SaveChangesAsync();
            
            return await GetByIdAsync(writingExam.WritingExamId) ?? writingExam;
        }

        public async Task<WritingExam?> UpdateAsync(int id, UpdateWritingExamDto updateDto)
        {
            var writingExam = await _context.WritingExams.FindAsync(id);
            if (writingExam == null)
                return null;

            if (updateDto.ExamSetId.HasValue)
                writingExam.ExamSetId = updateDto.ExamSetId;
            
            if (!string.IsNullOrEmpty(updateDto.QuestionText))
                writingExam.QuestionText = updateDto.QuestionText;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var writingExam = await _context.WritingExams.FindAsync(id);
            if (writingExam == null)
                return false;

            _context.WritingExams.Remove(writingExam);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.WritingExams.AnyAsync(w => w.WritingExamId == id);
        }
    }
}