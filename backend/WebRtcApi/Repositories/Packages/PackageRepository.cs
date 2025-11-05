using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;
using WebRtcApi.Dtos.Packages;
using WebRtcApi.Models;

namespace WebRtcApi.Repositories.Packages
{
    public class PackageRepository : IPackageRepository
    {
        private readonly DatabaseContext _context;

        public PackageRepository(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PackageResponseDto>> GetAllAsync()
        {
            return await _context.MentorPackages
                .Include(p => p.CreatedByNavigation)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PackageResponseDto
                {
                    PackageId = p.PackageId,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    DurationMonths = p.DurationMonths,
                    CreatedAt = p.CreatedAt ?? DateTime.UtcNow,
                    CreatedBy = p.CreatedByNavigation != null ? new CreatedByUserDto
                    {
                        Id = p.CreatedByNavigation.UserId,
                        Name = p.CreatedByNavigation.FullName,
                        Avatar = p.CreatedByNavigation.PortraitUrl
                    } : null
                })
                .ToListAsync();
        }

        public async Task<PackageResponseDto?> GetByIdAsync(int id)
        {
            var p = await _context.MentorPackages
                .Include(x => x.CreatedByNavigation)
                .FirstOrDefaultAsync(x => x.PackageId == id);

            if (p == null) return null;

            return new PackageResponseDto
            {
                PackageId = p.PackageId,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                DurationMonths = p.DurationMonths,
                CreatedAt = p.CreatedAt ?? DateTime.UtcNow,
                CreatedBy = p.CreatedByNavigation != null ? new CreatedByUserDto
                {
                    Id = p.CreatedByNavigation.UserId,
                    Name = p.CreatedByNavigation.FullName,
                    Avatar = p.CreatedByNavigation.PortraitUrl
                } : null
            };
        }

        public async Task<PackageResponseDto> CreateAsync(CreatePackageDto dto, int createdByUserId)
        {
            var entity = new MentorPackage
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                DurationMonths = dto.DurationMonths,
                CreatedBy = createdByUserId > 0 ? createdByUserId : null,
                CreatedAt = DateTime.UtcNow
            };

            _context.MentorPackages.Add(entity);
            await _context.SaveChangesAsync();

            var created = await _context.MentorPackages
                .Include(p => p.CreatedByNavigation)
                .FirstAsync(p => p.PackageId == entity.PackageId);

            return new PackageResponseDto
            {
                PackageId = created.PackageId,
                Name = created.Name,
                Description = created.Description,
                Price = created.Price,
                DurationMonths = created.DurationMonths,
                CreatedAt = created.CreatedAt ?? DateTime.UtcNow,
                CreatedBy = created.CreatedByNavigation != null ? new CreatedByUserDto
                {
                    Id = created.CreatedByNavigation.UserId,
                    Name = created.CreatedByNavigation.FullName,
                    Avatar = created.CreatedByNavigation.PortraitUrl
                } : null
            };
        }

        public async Task<bool> UpdateAsync(int id, UpdatePackageDto dto)
        {
            var entity = await _context.MentorPackages.FindAsync(id);
            if (entity == null) return false;

            if (dto.Name != null) entity.Name = dto.Name;
            if (dto.Description != null) entity.Description = dto.Description;
            if (dto.Price.HasValue) entity.Price = dto.Price.Value;
            if (dto.DurationMonths.HasValue) entity.DurationMonths = dto.DurationMonths.Value;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.MentorPackages.FindAsync(id);
            if (entity == null) return false;
            _context.MentorPackages.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}


