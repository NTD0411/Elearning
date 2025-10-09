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
                ExamTitle = w.ExamSet?.ExamSetTitle ?? "IELTS Writing Test",
                Task1Title = w.Task1Title,
                Task1Description = w.Task1Description,
                Task1ImageUrl = w.Task1ImageUrl,
                Task1Requirements = w.Task1Requirements,
                Task1MinWords = w.Task1MinWords,
                Task1MaxTime = w.Task1MaxTime,
                Task2Title = w.Task2Title,
                Task2Question = w.Task2Question,
                Task2Context = w.Task2Context,
                Task2Requirements = w.Task2Requirements,
                Task2MinWords = w.Task2MinWords,
                Task2MaxTime = w.Task2MaxTime,
                TotalTimeMinutes = w.TotalTimeMinutes,
                Instructions = w.Instructions,
                CreatedAt = w.CreatedAt
            });

            return Ok(writingExamDtos);
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<WritingExamDto>> GetByCourseId(int courseId)
        {
            var writingExam = await _repository.GetByCourseIdAsync(courseId);
            if (writingExam == null)
                return NotFound($"Writing exam for course ID {courseId} not found.");

            var writingExamDto = new WritingExamDto
            {
                WritingExamId = writingExam.WritingExamId,
                ExamSetId = writingExam.ExamSetId,
                ExamTitle = writingExam.ExamSet?.ExamSetTitle ?? "IELTS Writing Test",
                Task1Title = writingExam.Task1Title,
                Task1Description = writingExam.Task1Description,
                Task1ImageUrl = writingExam.Task1ImageUrl,
                Task1Requirements = writingExam.Task1Requirements,
                Task1MinWords = writingExam.Task1MinWords,
                Task1MaxTime = writingExam.Task1MaxTime,
                Task2Title = writingExam.Task2Title,
                Task2Question = writingExam.Task2Question,
                Task2Context = writingExam.Task2Context,
                Task2Requirements = writingExam.Task2Requirements,
                Task2MinWords = writingExam.Task2MinWords,
                Task2MaxTime = writingExam.Task2MaxTime,
                TotalTimeMinutes = writingExam.TotalTimeMinutes,
                Instructions = writingExam.Instructions,
                CreatedAt = writingExam.CreatedAt
            };

            return Ok(writingExamDto);
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
                ExamTitle = writingExam.ExamSet?.ExamSetTitle ?? "IELTS Writing Test",
                Task1Title = writingExam.Task1Title,
                Task1Description = writingExam.Task1Description,
                Task1ImageUrl = writingExam.Task1ImageUrl,
                Task1Requirements = writingExam.Task1Requirements,
                Task1MinWords = writingExam.Task1MinWords,
                Task1MaxTime = writingExam.Task1MaxTime,
                Task2Title = writingExam.Task2Title,
                Task2Question = writingExam.Task2Question,
                Task2Context = writingExam.Task2Context,
                Task2Requirements = writingExam.Task2Requirements,
                Task2MinWords = writingExam.Task2MinWords,
                Task2MaxTime = writingExam.Task2MaxTime,
                TotalTimeMinutes = writingExam.TotalTimeMinutes,
                Instructions = writingExam.Instructions,
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
                ExamTitle = w.ExamSet?.ExamSetTitle ?? "IELTS Writing Test",
                Task1Title = w.Task1Title,
                Task1Description = w.Task1Description,
                Task1ImageUrl = w.Task1ImageUrl,
                Task1Requirements = w.Task1Requirements,
                Task1MinWords = w.Task1MinWords,
                Task1MaxTime = w.Task1MaxTime,
                Task2Title = w.Task2Title,
                Task2Question = w.Task2Question,
                Task2Context = w.Task2Context,
                Task2Requirements = w.Task2Requirements,
                Task2MinWords = w.Task2MinWords,
                Task2MaxTime = w.Task2MaxTime,
                TotalTimeMinutes = w.TotalTimeMinutes,
                Instructions = w.Instructions,
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
                ExamTitle = writingExam.ExamSet?.ExamSetTitle ?? "IELTS Writing Test",
                Task1Title = writingExam.Task1Title,
                Task1Description = writingExam.Task1Description,
                Task1ImageUrl = writingExam.Task1ImageUrl,
                Task1Requirements = writingExam.Task1Requirements,
                Task1MinWords = writingExam.Task1MinWords,
                Task1MaxTime = writingExam.Task1MaxTime,
                Task2Title = writingExam.Task2Title,
                Task2Question = writingExam.Task2Question,
                Task2Context = writingExam.Task2Context,
                Task2Requirements = writingExam.Task2Requirements,
                Task2MinWords = writingExam.Task2MinWords,
                Task2MaxTime = writingExam.Task2MaxTime,
                TotalTimeMinutes = writingExam.TotalTimeMinutes,
                Instructions = writingExam.Instructions,
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
                ExamTitle = writingExam.ExamSet?.ExamSetTitle ?? "IELTS Writing Test",
                Task1Title = writingExam.Task1Title,
                Task1Description = writingExam.Task1Description,
                Task1ImageUrl = writingExam.Task1ImageUrl,
                Task1Requirements = writingExam.Task1Requirements,
                Task1MinWords = writingExam.Task1MinWords,
                Task1MaxTime = writingExam.Task1MaxTime,
                Task2Title = writingExam.Task2Title,
                Task2Question = writingExam.Task2Question,
                Task2Context = writingExam.Task2Context,
                Task2Requirements = writingExam.Task2Requirements,
                Task2MinWords = writingExam.Task2MinWords,
                Task2MaxTime = writingExam.Task2MaxTime,
                TotalTimeMinutes = writingExam.TotalTimeMinutes,
                Instructions = writingExam.Instructions,
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