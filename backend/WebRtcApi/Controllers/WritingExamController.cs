using Microsoft.AspNetCore.Mvc;
using WebRtcApi.Repositories.Exams;
using WebRtcApi.Dtos.Exams;

namespace WebRtcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WritingExamController : ControllerBase
    {
        private readonly IWritingExamRepository _repository;

        public WritingExamController(IWritingExamRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WritingExamDto>>> GetAll()
        {
            var writingExams = await _repository.GetAllAsync();
            var writingExamDtos = writingExams.Select(w => new WritingExamDto
            {
                WritingExamId = w.WritingExamId,
                ExamSetId = w.ExamSetId,
                QuestionText = w.QuestionText,
                CreatedAt = w.CreatedAt
            });

            return Ok(writingExamDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WritingExamDto>> GetById(int id)
        {
            var writingExam = await _repository.GetByIdAsync(id);
            if (writingExam == null)
                return NotFound($"Writing exam with ID {id} not found.");

            var writingExamDto = new WritingExamDto
            {
                WritingExamId = writingExam.WritingExamId,
                ExamSetId = writingExam.ExamSetId,
                QuestionText = writingExam.QuestionText,
                CreatedAt = writingExam.CreatedAt
            };

            return Ok(writingExamDto);
        }

        [HttpGet("examset/{examSetId}")]
        public async Task<ActionResult<IEnumerable<WritingExamDto>>> GetByExamSetId(int examSetId)
        {
            var writingExams = await _repository.GetByExamSetIdAsync(examSetId);
            var writingExamDtos = writingExams.Select(w => new WritingExamDto
            {
                WritingExamId = w.WritingExamId,
                ExamSetId = w.ExamSetId,
                QuestionText = w.QuestionText,
                CreatedAt = w.CreatedAt
            });

            return Ok(writingExamDtos);
        }

        [HttpPost]
        public async Task<ActionResult<WritingExamDto>> Create([FromBody] CreateWritingExamDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var writingExam = await _repository.CreateAsync(createDto);
            var writingExamDto = new WritingExamDto
            {
                WritingExamId = writingExam.WritingExamId,
                ExamSetId = writingExam.ExamSetId,
                QuestionText = writingExam.QuestionText,
                CreatedAt = writingExam.CreatedAt
            };

            return CreatedAtAction(nameof(GetById), new { id = writingExam.WritingExamId }, writingExamDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<WritingExamDto>> Update(int id, [FromBody] UpdateWritingExamDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var writingExam = await _repository.UpdateAsync(id, updateDto);
            if (writingExam == null)
                return NotFound($"Writing exam with ID {id} not found.");

            var writingExamDto = new WritingExamDto
            {
                WritingExamId = writingExam.WritingExamId,
                ExamSetId = writingExam.ExamSetId,
                QuestionText = writingExam.QuestionText,
                CreatedAt = writingExam.CreatedAt
            };

            return Ok(writingExamDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _repository.DeleteAsync(id);
            if (!result)
                return NotFound($"Writing exam with ID {id} not found.");

            return NoContent();
        }
    }
}