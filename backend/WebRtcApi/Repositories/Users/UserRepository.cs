using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;
using WebRtcApi.Dtos.Users;
using WebRtcApi.Models;

namespace WebRtcApi.Repositories.Users
{
    public class UserRepository : IUserRepository
    {
        private readonly DatabaseContext _context;

        public UserRepository(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<PaginatedUserListDto> GetUsersAsync(UserFilterDto filter)
        {
            var query = _context.Users.AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(filter.Role))
            {
                query = query.Where(u => u.Role == filter.Role);
            }

            if (!string.IsNullOrEmpty(filter.Status))
            {
                query = query.Where(u => u.Status == filter.Status);
            }

            if (filter.Approved.HasValue)
            {
                query = query.Where(u => u.Approved == filter.Approved);
            }

            if (!string.IsNullOrEmpty(filter.Gender))
            {
                query = query.Where(u => u.Gender == filter.Gender);
            }

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                query = query.Where(u => u.FullName.Contains(filter.SearchTerm) || 
                                        u.Email.Contains(filter.SearchTerm));
            }

            // Get total count before pagination
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortBy?.ToLower() switch
            {
                "fullname" => filter.SortDirection?.ToLower() == "desc" 
                    ? query.OrderByDescending(u => u.FullName)
                    : query.OrderBy(u => u.FullName),
                "email" => filter.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(u => u.Email)
                    : query.OrderBy(u => u.Email),
                "createdat" => filter.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(u => u.CreatedAt)
                    : query.OrderBy(u => u.CreatedAt),
                _ => query.OrderByDescending(u => u.CreatedAt)
            };

            // Apply pagination
            var users = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(u => new UserListDto
                {
                    UserId = u.UserId,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    Status = u.Status,
                    PortraitUrl = u.PortraitUrl,
                    Experience = u.Experience,
                    Approved = u.Approved,
                    Gender = u.Gender,
                    Address = u.Address,
                    DateOfBirth = u.DateOfBirth != default(DateOnly) ? u.DateOfBirth.ToDateTime(TimeOnly.MinValue) : null,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                })
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize);

            return new PaginatedUserListDto
            {
                Users = users,
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize,
                TotalPages = totalPages,
                HasPreviousPage = filter.Page > 1,
                HasNextPage = filter.Page < totalPages
            };
        }

        public async Task<List<UserListDto>> GetStudentsAsync()
        {
            return await _context.Users
                .Where(u => u.Role == "student")
                .Select(u => new UserListDto
                {
                    UserId = u.UserId,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    Status = u.Status,
                    PortraitUrl = u.PortraitUrl,
                    Experience = u.Experience,
                    Approved = u.Approved,
                    Gender = u.Gender,
                    Address = u.Address,
                    DateOfBirth = u.DateOfBirth != default(DateOnly) ? u.DateOfBirth.ToDateTime(TimeOnly.MinValue) : null,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                })
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<UserListDto>> GetMentorsAsync()
        {
            return await _context.Users
                .Where(u => u.Role == "mentor")
                .Select(u => new UserListDto
                {
                    UserId = u.UserId,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    Status = u.Status,
                    PortraitUrl = u.PortraitUrl,
                    Experience = u.Experience,
                    Approved = u.Approved,
                    Gender = u.Gender,
                    Address = u.Address,
                    DateOfBirth = u.DateOfBirth != default(DateOnly) ? u.DateOfBirth.ToDateTime(TimeOnly.MinValue) : null,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                })
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
        }

        public async Task<UserListDto?> GetUserByIdAsync(int userId)
        {
            return await _context.Users
                .Where(u => u.UserId == userId)
                .Select(u => new UserListDto
                {
                    UserId = u.UserId,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    Status = u.Status,
                    PortraitUrl = u.PortraitUrl,
                    Experience = u.Experience,
                    Approved = u.Approved,
                    Gender = u.Gender,
                    Address = u.Address,
                    DateOfBirth = u.DateOfBirth != default(DateOnly) ? u.DateOfBirth.ToDateTime(TimeOnly.MinValue) : null,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<User?> GetUserEntityByIdAsync(int userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        public async Task<bool> UpdateUserStatusAsync(int userId, string status)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.Status = status;
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateUserRoleAsync(int userId, string role)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.Role = role;
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ApproveUserAsync(int userId, bool approved)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.Approved = approved;
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        // Mentor Management Methods
        public async Task<List<MentorManagementDto>> GetMentorManagementListAsync()
        {
            return await _context.Users
                .Where(u => u.Role == "mentor")
                .Select(u => new MentorManagementDto
                {
                    UserId = u.UserId,
                    FullName = u.FullName,
                    Email = u.Email,
                    Status = u.Status ?? "Active",
                    Approved = u.Approved,
                    Experience = u.Experience,
                    PortraitUrl = u.PortraitUrl,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt,
                    TotalStudents = 0, // TODO: Calculate from relationships
                    AverageRating = 0.0m // TODO: Calculate from ratings
                })
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
        }

        public async Task<MentorManagementDto?> GetMentorManagementByIdAsync(int userId)
        {
            return await _context.Users
                .Where(u => u.UserId == userId && u.Role == "mentor")
                .Select(u => new MentorManagementDto
                {
                    UserId = u.UserId,
                    FullName = u.FullName,
                    Email = u.Email,
                    Status = u.Status ?? "Active",
                    Approved = u.Approved,
                    Experience = u.Experience,
                    PortraitUrl = u.PortraitUrl,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt,
                    TotalStudents = 0, // TODO: Calculate from relationships
                    AverageRating = 0.0m // TODO: Calculate from ratings
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> BanMentorAsync(int userId, string reason, DateTime? banUntil = null)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.Role != "mentor") return false;

            user.Status = "Banned";
            user.UpdatedAt = DateTime.UtcNow;
            // Có thể lưu reason vào Experience field hoặc tạo log riêng

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnbanMentorAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.Role != "mentor") return false;

            user.Status = "Active";
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateMentorStatusAsync(int userId, MentorStatusUpdateDto statusUpdate)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.Role != "mentor") return false;

            user.Status = statusUpdate.Status;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}