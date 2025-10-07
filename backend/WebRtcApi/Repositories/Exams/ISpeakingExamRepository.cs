using WebRtcApi.Models;
using WebRtcApi.Dtos.Exams;

namespace WebRtcApi.Repositories.Exams
{
    public interface ISpeakingExamRepository
    {
        Task<IEnumerable<SpeakingExam>> GetAllAsync();
        Task<SpeakingExam?> GetByIdAsync(int id);
        Task<IEnumerable<SpeakingExam>> GetByExamSetIdAsync(int examSetId);
        Task<SpeakingExam> CreateAsync(CreateSpeakingExamDto createDto);
        Task<SpeakingExam?> UpdateAsync(int id, UpdateSpeakingExamDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}