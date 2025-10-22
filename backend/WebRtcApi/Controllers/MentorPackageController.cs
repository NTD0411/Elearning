using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebRtcApi.Dtos.MentorPackages;
using WebRtcApi.Repositories.MentorPackages;

namespace WebRtcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MentorPackageController : ControllerBase
    {
        private readonly IMentorPackageRepository _mentorPackageRepository;

        public MentorPackageController(IMentorPackageRepository mentorPackageRepository)
        {
            _mentorPackageRepository = mentorPackageRepository;
        }

        /// <summary>
        /// Get paginated list of mentor packages with filters
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<PaginatedMentorPackageListDto>> GetMentorPackages([FromQuery] MentorPackageFilterDto filter)
        {
            try
            {
                var result = await _mentorPackageRepository.GetMentorPackagesAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving mentor packages: {ex.Message}");
            }
        }

        /// <summary>
        /// Get all mentor packages (without pagination)
        /// </summary>
        [HttpGet("all")]
        public async Task<ActionResult<List<MentorPackageDto>>> GetAllMentorPackages()
        {
            try
            {
                var mentorPackages = await _mentorPackageRepository.GetAllMentorPackagesAsync();
                return Ok(mentorPackages);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving all mentor packages: {ex.Message}");
            }
        }

        /// <summary>
        /// Get mentor package by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<MentorPackageDto>> GetMentorPackageById(int id)
        {
            try
            {
                var mentorPackage = await _mentorPackageRepository.GetMentorPackageByIdAsync(id);
                if (mentorPackage == null)
                {
                    return NotFound($"Mentor package with ID {id} not found");
                }
                return Ok(mentorPackage);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving mentor package: {ex.Message}");
            }
        }

        /// <summary>
        /// Get mentor packages by creator
        /// </summary>
        [HttpGet("creator/{createdBy}")]
        public async Task<ActionResult<List<MentorPackageDto>>> GetMentorPackagesByCreator(int createdBy)
        {
            try
            {
                var mentorPackages = await _mentorPackageRepository.GetMentorPackagesByCreatorAsync(createdBy);
                return Ok(mentorPackages);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving mentor packages by creator: {ex.Message}");
            }
        }

        /// <summary>
        /// Create a new mentor package
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<MentorPackageDto>> CreateMentorPackage([FromBody] CreateMentorPackageDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Check if package name already exists
                if (await _mentorPackageRepository.MentorPackageNameExistsAsync(createDto.Name))
                {
                    return BadRequest($"A mentor package with the name '{createDto.Name}' already exists");
                }

                var createdPackage = await _mentorPackageRepository.CreateMentorPackageAsync(createDto);
                return CreatedAtAction(nameof(GetMentorPackageById), new { id = createdPackage.PackageId }, createdPackage);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating mentor package: {ex.Message}");
            }
        }

        /// <summary>
        /// Update an existing mentor package
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<MentorPackageDto>> UpdateMentorPackage(int id, [FromBody] UpdateMentorPackageDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Check if package exists
                if (!await _mentorPackageRepository.MentorPackageExistsAsync(id))
                {
                    return NotFound($"Mentor package with ID {id} not found");
                }

                // Check if package name already exists (excluding current package)
                if (await _mentorPackageRepository.MentorPackageNameExistsAsync(updateDto.Name, id))
                {
                    return BadRequest($"A mentor package with the name '{updateDto.Name}' already exists");
                }

                var updatedPackage = await _mentorPackageRepository.UpdateMentorPackageAsync(id, updateDto);
                if (updatedPackage == null)
                {
                    return NotFound($"Mentor package with ID {id} not found");
                }

                return Ok(updatedPackage);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error updating mentor package: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete a mentor package
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMentorPackage(int id)
        {
            try
            {
                var deleted = await _mentorPackageRepository.DeleteMentorPackageAsync(id);
                if (!deleted)
                {
                    return NotFound($"Mentor package with ID {id} not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error deleting mentor package: {ex.Message}");
            }
        }

        /// <summary>
        /// Check if mentor package name exists
        /// </summary>
        [HttpGet("check-name")]
        public async Task<ActionResult<bool>> CheckMentorPackageNameExists([FromQuery] string name, [FromQuery] int? excludeId = null)
        {
            try
            {
                var exists = await _mentorPackageRepository.MentorPackageNameExistsAsync(name, excludeId);
                return Ok(exists);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error checking mentor package name: {ex.Message}");
            }
        }
    }
}
