using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebRtcApi.Data;
using WebRtcApi.Dtos.Tips;
using WebRtcApi.Models;

namespace WebRtcApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipsController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public TipsController(DatabaseContext context)
        {
            _context = context;
        }

        // GET: api/tips
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipResponseDto>>> GetTips()
        {
            var tips = await _context.Tips
                .Include(t => t.Mentor)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TipResponseDto
                {
                    TipId = t.TipId,
                    Title = t.Title!,
                    Content = t.Content!,
                    CreatedAt = t.CreatedAt ?? DateTime.UtcNow,
                    Mentor = t.Mentor != null ? new MentorDto
                    {
                        Id = t.Mentor.UserId,
                        Name = t.Mentor.FullName,
                        Avatar = t.Mentor.PortraitUrl
                    } : null
                })
                .ToListAsync();

            return Ok(tips);
        }

        // GET: api/tips/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<TipResponseDto>> GetTip(int id)
        {
            var tip = await _context.Tips
                .Include(t => t.Mentor)
                .FirstOrDefaultAsync(t => t.TipId == id);

            if (tip == null)
            {
                return NotFound();
            }

            var response = new TipResponseDto
            {
                TipId = tip.TipId,
                Title = tip.Title!,
                Content = tip.Content!,
                CreatedAt = tip.CreatedAt ?? DateTime.UtcNow,
                Mentor = tip.Mentor != null ? new MentorDto
                {
                    Id = tip.Mentor.UserId,
                    Name = tip.Mentor.FullName,
                    Avatar = tip.Mentor.PortraitUrl
                } : null
            };

            return Ok(response);
        }

        // POST: api/tips
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<TipResponseDto>> CreateTip(CreateTipDto createTipDto)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "mentor")
            {
                return Forbid();
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var tip = new Tip
            {
                Title = createTipDto.Title,
                Content = createTipDto.Content,
                MentorId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Tips.Add(tip);
            await _context.SaveChangesAsync();

            // Reload the tip with mentor information
            var createdTip = await _context.Tips
                .Include(t => t.Mentor)
                .FirstOrDefaultAsync(t => t.TipId == tip.TipId);

            var response = new TipResponseDto
            {
                TipId = createdTip!.TipId,
                Title = createdTip.Title!,
                Content = createdTip.Content!,
                CreatedAt = createdTip.CreatedAt ?? DateTime.UtcNow,
                Mentor = createdTip.Mentor != null ? new MentorDto
                {
                    Id = createdTip.Mentor.UserId,
                    Name = createdTip.Mentor.FullName,
                    Avatar = createdTip.Mentor.PortraitUrl
                } : null
            };

            return CreatedAtAction(nameof(GetTip), new { id = tip.TipId }, response);
        }

        // PUT: api/tips/{id}
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTip(int id, UpdateTipDto updateTipDto)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "mentor")
            {
                return Forbid();
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var tip = await _context.Tips.FindAsync(id);
            if (tip == null)
            {
                return NotFound();
            }

            // Check if the current user is the owner of the tip
            if (tip.MentorId != userId)
            {
                return Forbid();
            }

            if (updateTipDto.Title != null)
                tip.Title = updateTipDto.Title;
            if (updateTipDto.Content != null)
                tip.Content = updateTipDto.Content;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/tips/{id}
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTip(int id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "mentor")
            {
                return Forbid();
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var tip = await _context.Tips.FindAsync(id);
            if (tip == null)
            {
                return NotFound();
            }

            // Check if the current user is the owner of the tip
            if (tip.MentorId != userId)
            {
                return Forbid();
            }

            _context.Tips.Remove(tip);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}