using WebRtcApi.Models;
using WebRtcApi.Dtos.Exams;

namespace WebRtcApi.Repositories.Exams
{
    public interface IWritingExamRepository
    {
        Task<IEnumerable<WritingExam>> GetAllAsync();
        Task<WritingExam?> GetByIdAsync(int id);
        Task<WritingExam?> GetByCourseIdAsync(int courseId);
        Task<IEnumerable<WritingExam>> GetByExamSetIdAsync(int examSetId);
        Task<WritingExam> CreateAsync(CreateWritingExamDto createDto);
        Task<WritingExam?> UpdateAsync(int id, UpdateWritingExamDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}