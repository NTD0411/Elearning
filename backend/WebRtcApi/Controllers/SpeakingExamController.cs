using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebRtcApi.Dtos.Exams;
using WebRtcApi.Repositories.Exams;

namespace WebRtcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class SpeakingExamController : ControllerBase
    {
        private readonly ISpeakingExamRepository _repository;

        public SpeakingExamController(ISpeakingExamRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SpeakingExamDto>>> GetAll()
        {
            var speakingExams = await _repository.GetAllAsync();
            var speakingExamDtos = speakingExams.Select(s => new SpeakingExamDto
            {
                SpeakingExamId = s.SpeakingExamId,
                ExamSetId = s.ExamSetId,
                QuestionText = s.QuestionText,
                CreatedAt = s.CreatedAt
            });

            return Ok(speakingExamDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SpeakingExamDto>> GetById(int id)
        {
            var speakingExam = await _repository.GetByIdAsync(id);
            if (speakingExam == null)
                return NotFound($"Speaking exam with ID {id} not found.");

            var speakingExamDto = new SpeakingExamDto
            {
                SpeakingExamId = speakingExam.SpeakingExamId,
                ExamSetId = speakingExam.ExamSetId,
                QuestionText = speakingExam.QuestionText,
                CreatedAt = speakingExam.CreatedAt
            };

            return Ok(speakingExamDto);
        }

        [HttpGet("examset/{examSetId}")]
        public async Task<ActionResult<IEnumerable<SpeakingExamDto>>> GetByExamSetId(int examSetId)
        {
            var speakingExams = await _repository.GetByExamSetIdAsync(examSetId);
            var speakingExamDtos = speakingExams.Select(s => new SpeakingExamDto
            {
                SpeakingExamId = s.SpeakingExamId,
                ExamSetId = s.ExamSetId,
                QuestionText = s.QuestionText,
                CreatedAt = s.CreatedAt
            });

            return Ok(speakingExamDtos);
        }

        [HttpPost]
        public async Task<ActionResult<SpeakingExamDto>> Create([FromBody] CreateSpeakingExamDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var speakingExam = await _repository.CreateAsync(createDto);
            var speakingExamDto = new SpeakingExamDto
            {
                SpeakingExamId = speakingExam.SpeakingExamId,
                ExamSetId = speakingExam.ExamSetId,
                QuestionText = speakingExam.QuestionText,
                CreatedAt = speakingExam.CreatedAt
            };

            return CreatedAtAction(nameof(GetById), new { id = speakingExam.SpeakingExamId }, speakingExamDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<SpeakingExamDto>> Update(int id, [FromBody] UpdateSpeakingExamDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var speakingExam = await _repository.UpdateAsync(id, updateDto);
            if (speakingExam == null)
                return NotFound($"Speaking exam with ID {id} not found.");

            var speakingExamDto = new SpeakingExamDto
            {
                SpeakingExamId = speakingExam.SpeakingExamId,
                ExamSetId = speakingExam.ExamSetId,
                QuestionText = speakingExam.QuestionText,
                CreatedAt = speakingExam.CreatedAt
            };

            return Ok(speakingExamDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _repository.DeleteAsync(id);
            if (!result)
                return NotFound($"Speaking exam with ID {id} not found.");

            return NoContent();
        }
    }
}