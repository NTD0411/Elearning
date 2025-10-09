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

        public async Task<WritingExam?> GetByCourseIdAsync(int courseId)
        {
            return await _context.WritingExams
                .Include(w => w.ExamSet)
                .ThenInclude(ws => ws!.ExamCourse)
                .Where(w => w.ExamSet != null && 
                           _context.ExamCourseExamSets
                               .Any(eces => eces.ExamCourseId == courseId && 
                                          eces.ExamSetId == w.ExamSetId &&
                                          eces.ExamSetType.ToLower() == "writing"))
                .FirstOrDefaultAsync();
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
                
                // Task 1
                Task1Title = createDto.Task1Title,
                Task1Description = createDto.Task1Description,
                Task1ImageUrl = createDto.Task1ImageUrl,
                Task1Requirements = createDto.Task1Requirements,
                Task1MinWords = createDto.Task1MinWords,
                Task1MaxTime = createDto.Task1MaxTime,
                
                // Task 2
                Task2Title = createDto.Task2Title,
                Task2Question = createDto.Task2Question,
                Task2Context = createDto.Task2Context,
                Task2Requirements = createDto.Task2Requirements,
                Task2MinWords = createDto.Task2MinWords,
                Task2MaxTime = createDto.Task2MaxTime,
                
                // General
                TotalTimeMinutes = createDto.TotalTimeMinutes,
                Instructions = createDto.Instructions,
                
                // Set QuestionText for database compatibility (NOT NULL constraint)
#pragma warning disable CS0618 // Type or member is obsolete
                QuestionText = $"Task 1: {createDto.Task1Title} | Task 2: {createDto.Task2Title}",
#pragma warning restore CS0618 // Type or member is obsolete
                
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

            // Update Task 1 properties
            if (!string.IsNullOrEmpty(updateDto.Task1Title))
                writingExam.Task1Title = updateDto.Task1Title;
            if (!string.IsNullOrEmpty(updateDto.Task1Description))
                writingExam.Task1Description = updateDto.Task1Description;
            if (!string.IsNullOrEmpty(updateDto.Task1ImageUrl))
                writingExam.Task1ImageUrl = updateDto.Task1ImageUrl;
            if (!string.IsNullOrEmpty(updateDto.Task1Requirements))
                writingExam.Task1Requirements = updateDto.Task1Requirements;
            if (updateDto.Task1MinWords.HasValue)
                writingExam.Task1MinWords = updateDto.Task1MinWords.Value;
            if (updateDto.Task1MaxTime.HasValue)
                writingExam.Task1MaxTime = updateDto.Task1MaxTime.Value;

            // Update Task 2 properties
            if (!string.IsNullOrEmpty(updateDto.Task2Title))
                writingExam.Task2Title = updateDto.Task2Title;
            if (!string.IsNullOrEmpty(updateDto.Task2Question))
                writingExam.Task2Question = updateDto.Task2Question;
            if (!string.IsNullOrEmpty(updateDto.Task2Context))
                writingExam.Task2Context = updateDto.Task2Context;
            if (!string.IsNullOrEmpty(updateDto.Task2Requirements))
                writingExam.Task2Requirements = updateDto.Task2Requirements;
            if (updateDto.Task2MinWords.HasValue)
                writingExam.Task2MinWords = updateDto.Task2MinWords.Value;
            if (updateDto.Task2MaxTime.HasValue)
                writingExam.Task2MaxTime = updateDto.Task2MaxTime.Value;

            // Update general properties
            if (updateDto.TotalTimeMinutes.HasValue)
                writingExam.TotalTimeMinutes = updateDto.TotalTimeMinutes.Value;
            if (!string.IsNullOrEmpty(updateDto.Instructions))
                writingExam.Instructions = updateDto.Instructions;

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