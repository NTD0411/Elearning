using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;
using WebRtcApi.Models;
using WebRtcApi.Dtos.Exams;

namespace WebRtcApi.Repositories.Exams
{
    public class ListeningExamRepository : IListeningExamRepository
    {
        private readonly DatabaseContext _context;

        public ListeningExamRepository(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ListeningExam>> GetAllAsync()
        {
            return await _context.ListeningExams
                .Include(l => l.ExamSet)
                .ToListAsync();
        }

        public async Task<ListeningExam?> GetByIdAsync(int id)
        {
            return await _context.ListeningExams
                .Include(l => l.ExamSet)
                .FirstOrDefaultAsync(l => l.ListeningExamId == id);
        }

        public async Task<IEnumerable<ListeningExam>> GetByExamSetIdAsync(int examSetId)
        {
            return await _context.ListeningExams
                .Include(l => l.ExamSet)
                .Where(l => l.ExamSetId == examSetId)
                .ToListAsync();
        }

        public async Task<ListeningExam> CreateAsync(CreateListeningExamDto createDto)
        {
            var listeningExam = new ListeningExam
            {
                ExamSetId = createDto.ExamSetId,
                AudioUrl = createDto.AudioUrl,
                QuestionText = createDto.QuestionText,
                OptionA = createDto.OptionA,
                OptionB = createDto.OptionB,
                OptionC = createDto.OptionC,
                OptionD = createDto.OptionD,
                AnswerFill = createDto.AnswerFill,
                CorrectAnswer = createDto.CorrectAnswer,
                CreatedAt = DateTime.UtcNow
            };

            _context.ListeningExams.Add(listeningExam);
            await _context.SaveChangesAsync();
            
            return await GetByIdAsync(listeningExam.ListeningExamId) ?? listeningExam;
        }

        public async Task<ListeningExam?> UpdateAsync(int id, UpdateListeningExamDto updateDto)
        {
            var listeningExam = await _context.ListeningExams.FindAsync(id);
            if (listeningExam == null)
                return null;

            if (updateDto.ExamSetId.HasValue)
                listeningExam.ExamSetId = updateDto.ExamSetId;
            
            if (!string.IsNullOrEmpty(updateDto.AudioUrl))
                listeningExam.AudioUrl = updateDto.AudioUrl;
            
            if (updateDto.QuestionText != null)
                listeningExam.QuestionText = updateDto.QuestionText;
            
            if (updateDto.OptionA != null)
                listeningExam.OptionA = updateDto.OptionA;
            
            if (updateDto.OptionB != null)
                listeningExam.OptionB = updateDto.OptionB;
            
            if (updateDto.OptionC != null)
                listeningExam.OptionC = updateDto.OptionC;
            
            if (updateDto.OptionD != null)
                listeningExam.OptionD = updateDto.OptionD;
            
            if (updateDto.AnswerFill != null)
                listeningExam.AnswerFill = updateDto.AnswerFill;
            
            if (!string.IsNullOrEmpty(updateDto.CorrectAnswer))
                listeningExam.CorrectAnswer = updateDto.CorrectAnswer;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var listeningExam = await _context.ListeningExams.FindAsync(id);
            if (listeningExam == null)
                return false;

            _context.ListeningExams.Remove(listeningExam);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.ListeningExams.AnyAsync(l => l.ListeningExamId == id);
        }
    }
}