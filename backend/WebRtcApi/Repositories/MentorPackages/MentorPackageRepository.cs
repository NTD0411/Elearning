using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;
using WebRtcApi.Dtos.MentorPackages;
using WebRtcApi.Models;

namespace WebRtcApi.Repositories.MentorPackages
{
    public class MentorPackageRepository : IMentorPackageRepository
    {
        private readonly DatabaseContext _context;

        public MentorPackageRepository(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<PaginatedMentorPackageListDto> GetMentorPackagesAsync(MentorPackageFilterDto filter)
        {
            var query = _context.MentorPackages
                .Include(mp => mp.CreatedByNavigation)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                query = query.Where(mp => mp.Name.Contains(filter.SearchTerm) || 
                                        (mp.Description != null && mp.Description.Contains(filter.SearchTerm)));
            }

            if (filter.MinPrice.HasValue)
            {
                query = query.Where(mp => mp.Price >= filter.MinPrice.Value);
            }

            if (filter.MaxPrice.HasValue)
            {
                query = query.Where(mp => mp.Price <= filter.MaxPrice.Value);
            }

            if (filter.MinDuration.HasValue)
            {
                query = query.Where(mp => mp.DurationMonths >= filter.MinDuration.Value);
            }

            if (filter.MaxDuration.HasValue)
            {
                query = query.Where(mp => mp.DurationMonths <= filter.MaxDuration.Value);
            }

            if (filter.CreatedBy.HasValue)
            {
                query = query.Where(mp => mp.CreatedBy == filter.CreatedBy.Value);
            }

            // Get total count before pagination
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortBy?.ToLower() switch
            {
                "name" => filter.SortDirection?.ToLower() == "desc" 
                    ? query.OrderByDescending(mp => mp.Name)
                    : query.OrderBy(mp => mp.Name),
                "price" => filter.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(mp => mp.Price)
                    : query.OrderBy(mp => mp.Price),
                "duration" => filter.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(mp => mp.DurationMonths)
                    : query.OrderBy(mp => mp.DurationMonths),
                "createdat" => filter.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(mp => mp.CreatedAt)
                    : query.OrderBy(mp => mp.CreatedAt),
                _ => query.OrderByDescending(mp => mp.CreatedAt)
            };

            // Apply pagination
            var mentorPackages = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(mp => new MentorPackageDto
                {
                    PackageId = mp.PackageId,
                    Name = mp.Name,
                    Description = mp.Description,
                    Price = mp.Price,
                    DurationMonths = mp.DurationMonths,
                    CreatedBy = mp.CreatedBy,
                    CreatedByName = mp.CreatedByNavigation != null ? mp.CreatedByNavigation.FullName : null,
                    CreatedAt = mp.CreatedAt
                })
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize);

            return new PaginatedMentorPackageListDto
            {
                MentorPackages = mentorPackages,
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize,
                TotalPages = totalPages,
                HasPreviousPage = filter.Page > 1,
                HasNextPage = filter.Page < totalPages
            };
        }

        public async Task<MentorPackageDto?> GetMentorPackageByIdAsync(int packageId)
        {
            return await _context.MentorPackages
                .Include(mp => mp.CreatedByNavigation)
                .Where(mp => mp.PackageId == packageId)
                .Select(mp => new MentorPackageDto
                {
                    PackageId = mp.PackageId,
                    Name = mp.Name,
                    Description = mp.Description,
                    Price = mp.Price,
                    DurationMonths = mp.DurationMonths,
                    CreatedBy = mp.CreatedBy,
                    CreatedByName = mp.CreatedByNavigation != null ? mp.CreatedByNavigation.FullName : null,
                    CreatedAt = mp.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<MentorPackage?> GetMentorPackageEntityByIdAsync(int packageId)
        {
            return await _context.MentorPackages.FindAsync(packageId);
        }

        public async Task<List<MentorPackageDto>> GetMentorPackagesByCreatorAsync(int createdBy)
        {
            return await _context.MentorPackages
                .Include(mp => mp.CreatedByNavigation)
                .Where(mp => mp.CreatedBy == createdBy)
                .Select(mp => new MentorPackageDto
                {
                    PackageId = mp.PackageId,
                    Name = mp.Name,
                    Description = mp.Description,
                    Price = mp.Price,
                    DurationMonths = mp.DurationMonths,
                    CreatedBy = mp.CreatedBy,
                    CreatedByName = mp.CreatedByNavigation != null ? mp.CreatedByNavigation.FullName : null,
                    CreatedAt = mp.CreatedAt
                })
                .OrderByDescending(mp => mp.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<MentorPackageDto>> GetAllMentorPackagesAsync()
        {
            return await _context.MentorPackages
                .Include(mp => mp.CreatedByNavigation)
                .Select(mp => new MentorPackageDto
                {
                    PackageId = mp.PackageId,
                    Name = mp.Name,
                    Description = mp.Description,
                    Price = mp.Price,
                    DurationMonths = mp.DurationMonths,
                    CreatedBy = mp.CreatedBy,
                    CreatedByName = mp.CreatedByNavigation != null ? mp.CreatedByNavigation.FullName : null,
                    CreatedAt = mp.CreatedAt
                })
                .OrderByDescending(mp => mp.CreatedAt)
                .ToListAsync();
        }

        public async Task<MentorPackageDto> CreateMentorPackageAsync(CreateMentorPackageDto createDto)
        {
            var mentorPackage = new MentorPackage
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Price = createDto.Price,
                DurationMonths = createDto.DurationMonths,
                CreatedBy = createDto.CreatedBy,
                CreatedAt = DateTime.UtcNow
            };

            _context.MentorPackages.Add(mentorPackage);
            await _context.SaveChangesAsync();

            // Get the created package with creator info
            var createdPackage = await GetMentorPackageByIdAsync(mentorPackage.PackageId);
            return createdPackage!;
        }

        public async Task<MentorPackageDto?> UpdateMentorPackageAsync(int packageId, UpdateMentorPackageDto updateDto)
        {
            var mentorPackage = await GetMentorPackageEntityByIdAsync(packageId);
            if (mentorPackage == null) return null;

            mentorPackage.Name = updateDto.Name;
            mentorPackage.Description = updateDto.Description;
            mentorPackage.Price = updateDto.Price;
            mentorPackage.DurationMonths = updateDto.DurationMonths;

            await _context.SaveChangesAsync();

            return await GetMentorPackageByIdAsync(packageId);
        }

        public async Task<bool> DeleteMentorPackageAsync(int packageId)
        {
            var mentorPackage = await GetMentorPackageEntityByIdAsync(packageId);
            if (mentorPackage == null) return false;

            _context.MentorPackages.Remove(mentorPackage);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MentorPackageExistsAsync(int packageId)
        {
            return await _context.MentorPackages.AnyAsync(mp => mp.PackageId == packageId);
        }

        public async Task<bool> MentorPackageNameExistsAsync(string name, int? excludePackageId = null)
        {
            var query = _context.MentorPackages.Where(mp => mp.Name == name);
            
            if (excludePackageId.HasValue)
            {
                query = query.Where(mp => mp.PackageId != excludePackageId.Value);
            }

            return await query.AnyAsync();
        }
    }
}
