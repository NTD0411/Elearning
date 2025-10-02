using WebRtcApi.Dtos.Tips;
using WebRtcApi.Models;

namespace WebRtcApi.Repositories.Tips
{
    public interface ITipRepository
    {
        Task<List<TipDto>> GetTipsAsync(TipFilterDto filter);
        Task<TipDto?> GetTipByIdAsync(int tipId);
        Task<Tip> CreateTipAsync(CreateTipDto createTipDto, int mentorId);
        Task<bool> UpdateTipAsync(int tipId, UpdateTipDto updateTipDto, int mentorId);
        Task<bool> DeleteTipAsync(int tipId, int mentorId);
        Task<List<TipDto>> GetTipsByMentorAsync(int mentorId);
    }
}

