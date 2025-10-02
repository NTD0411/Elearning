using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;
using WebRtcApi.Dtos.Tips;
using WebRtcApi.Models;

namespace WebRtcApi.Repositories.Tips
{
    public class TipRepository : ITipRepository
    {
        private readonly DatabaseContext _context;

        public TipRepository(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<List<TipDto>> GetTipsAsync(TipFilterDto filter)
        {
            var query = _context.Tips
                .Include(t => t.Mentor)
                .AsQueryable();

            // Apply search filter
            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                query = query.Where(t => t.Title!.Contains(filter.SearchTerm));
            }

            // Apply mentor filter
            if (filter.MentorId.HasValue)
            {
                query = query.Where(t => t.MentorId == filter.MentorId.Value);
            }

            // Apply pagination
            var tips = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(t => new TipDto
                {
                    TipId = t.TipId,
                    Title = t.Title,
                    Content = t.Content,
                    CreatedAt = t.CreatedAt,
                    MentorId = t.MentorId,
                    MentorFullName = t.Mentor!.FullName
                })
                .ToListAsync();

            return tips;
        }

        public async Task<TipDto?> GetTipByIdAsync(int tipId)
        {
            var tip = await _context.Tips
                .Include(t => t.Mentor)
                .Where(t => t.TipId == tipId)
                .Select(t => new TipDto
                {
                    TipId = t.TipId,
                    Title = t.Title,
                    Content = t.Content,
                    CreatedAt = t.CreatedAt,
                    MentorId = t.MentorId,
                    MentorFullName = t.Mentor!.FullName
                })
                .FirstOrDefaultAsync();

            return tip;
        }

        public async Task<Tip> CreateTipAsync(CreateTipDto createTipDto, int mentorId)
        {
            var tip = new Tip
            {
                Title = createTipDto.Title,
                Content = createTipDto.Content,
                MentorId = mentorId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Tips.Add(tip);
            await _context.SaveChangesAsync();

            return tip;
        }

        public async Task<bool> UpdateTipAsync(int tipId, UpdateTipDto updateTipDto, int mentorId)
        {
            var tip = await _context.Tips
                .FirstOrDefaultAsync(t => t.TipId == tipId && t.MentorId == mentorId);

            if (tip == null)
                return false;

            tip.Title = updateTipDto.Title;
            tip.Content = updateTipDto.Content;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteTipAsync(int tipId, int mentorId)
        {
            var tip = await _context.Tips
                .FirstOrDefaultAsync(t => t.TipId == tipId && t.MentorId == mentorId);

            if (tip == null)
                return false;

            _context.Tips.Remove(tip);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<TipDto>> GetTipsByMentorAsync(int mentorId)
        {
            var tips = await _context.Tips
                .Include(t => t.Mentor)
                .Where(t => t.MentorId == mentorId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TipDto
                {
                    TipId = t.TipId,
                    Title = t.Title,
                    Content = t.Content,
                    CreatedAt = t.CreatedAt,
                    MentorId = t.MentorId,
                    MentorFullName = t.Mentor!.FullName
                })
                .ToListAsync();

            return tips;
        }
    }
}

