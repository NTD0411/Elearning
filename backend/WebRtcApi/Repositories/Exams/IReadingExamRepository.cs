using WebRtcApi.Models;
using WebRtcApi.Dtos.Exams;

namespace WebRtcApi.Repositories.Exams
{
    public interface IReadingExamRepository
    {
        Task<IEnumerable<ReadingExam>> GetAllAsync();
        Task<ReadingExam?> GetByIdAsync(int id);
        Task<IEnumerable<ReadingExam>> GetByExamSetIdAsync(int examSetId);
        Task<ReadingExam> CreateAsync(CreateReadingExamDto createDto);
        Task<ReadingExam?> UpdateAsync(int id, UpdateReadingExamDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}