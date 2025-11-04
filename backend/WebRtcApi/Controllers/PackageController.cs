using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebRtcApi.Dtos.Packages;
using WebRtcApi.Repositories.Packages;

namespace WebRtcApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackageController : ControllerBase
    {
        private readonly IPackageRepository _repository;

        public PackageController(IPackageRepository repository)
        {
            _repository = repository;
        }

        // GET: api/package
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PackageResponseDto>>> GetPackages()
        {
            var items = await _repository.GetAllAsync();
            return Ok(items);
        }

        // GET: api/package/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PackageResponseDto>> GetPackage(int id)
        {
            var p = await _repository.GetByIdAsync(id);
            if (p == null)
            {
                return NotFound();
            }
            return Ok(p);
        }

        // POST: api/package
        [HttpPost]
        public async Task<ActionResult<PackageResponseDto>> CreatePackage(CreatePackageDto dto)
        {
            int createdByUserId = 0;
            try
            {
                var claimVal = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(claimVal))
                {
                    createdByUserId = int.Parse(claimVal);
                }
            }
            catch { /* ignore if unauthenticated */ }

            var response = await _repository.CreateAsync(dto, createdByUserId);
            return CreatedAtAction(nameof(GetPackage), new { id = response.PackageId }, response);
        }

        // PUT: api/package/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<PackageResponseDto>> UpdatePackage(int id, UpdatePackageDto dto)
        {
            var ok = await _repository.UpdateAsync(id, dto);
            if (!ok) return NotFound();
            var updated = await _repository.GetByIdAsync(id);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        // DELETE: api/package/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePackage(int id)
        {
            var ok = await _repository.DeleteAsync(id);
            if (!ok) return NotFound();
            return Ok(new { success = true });
        }
    }
}


