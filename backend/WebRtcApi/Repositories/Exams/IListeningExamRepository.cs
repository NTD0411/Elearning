using WebRtcApi.Models;
using WebRtcApi.Dtos.Exams;

namespace WebRtcApi.Repositories.Exams
{
    public interface IListeningExamRepository
    {
        Task<IEnumerable<ListeningExam>> GetAllAsync();
        Task<ListeningExam?> GetByIdAsync(int id);
        Task<IEnumerable<ListeningExam>> GetByExamSetIdAsync(int examSetId);
        Task<ListeningExam> CreateAsync(CreateListeningExamDto createDto);
        Task<ListeningExam?> UpdateAsync(int id, UpdateListeningExamDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}