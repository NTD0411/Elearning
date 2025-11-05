using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;
using WebRtcApi.Models;

namespace WebRtcApi.Repositories.Packages
{
    public class MentorPackageRepository : IMentorPackageRepository
    {
        private readonly DatabaseContext _context;

        public MentorPackageRepository(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<MentorPackage> GetByIdAsync(int id)
        {
            return await _context.MentorPackages
                .Include(p => p.CreatedByNavigation)
                .FirstOrDefaultAsync(p => p.PackageId == id);
        }

        public async Task<IEnumerable<MentorPackage>> GetAllAsync()
        {
            return await _context.MentorPackages
                .Include(p => p.CreatedByNavigation)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<MentorPackage> CreateAsync(MentorPackage package)
        {
            _context.MentorPackages.Add(package);
            await _context.SaveChangesAsync();
            return package;
        }

        public async Task<MentorPackage> UpdateAsync(MentorPackage package)
        {
            _context.Entry(package).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return package;
        }

        public async Task DeleteAsync(int id)
        {
            var package = await _context.MentorPackages.FindAsync(id);
            if (package != null)
            {
                _context.MentorPackages.Remove(package);
                await _context.SaveChangesAsync();
            }
        }
    }
}