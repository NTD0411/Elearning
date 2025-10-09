using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebRtcApi.Dtos.Exams;
using WebRtcApi.Repositories.Exams;

namespace WebRtcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ReadingExamController : ControllerBase
    {
        private readonly IReadingExamRepository _repository;

        public ReadingExamController(IReadingExamRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReadingExamDto>>> GetAll()
        {
            var readingExams = await _repository.GetAllAsync();
            var readingExamDtos = readingExams.Select(r => new ReadingExamDto
            {
                ReadingExamId = r.ReadingExamId,
                ExamSetId = r.ExamSetId,
                QuestionText = r.QuestionText,
                OptionA = r.OptionA,
                OptionB = r.OptionB,
                OptionC = r.OptionC,
                OptionD = r.OptionD,
                AnswerFill = r.AnswerFill,
                CorrectAnswer = r.CorrectAnswer,
                CreatedAt = r.CreatedAt
            });

            return Ok(readingExamDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ReadingExamDto>> GetById(int id)
        {
            var readingExam = await _repository.GetByIdAsync(id);
            if (readingExam == null)
                return NotFound($"Reading exam with ID {id} not found.");

            var readingExamDto = new ReadingExamDto
            {
                ReadingExamId = readingExam.ReadingExamId,
                ExamSetId = readingExam.ExamSetId,
                QuestionText = readingExam.QuestionText,
                OptionA = readingExam.OptionA,
                OptionB = readingExam.OptionB,
                OptionC = readingExam.OptionC,
                OptionD = readingExam.OptionD,
                AnswerFill = readingExam.AnswerFill,
                CorrectAnswer = readingExam.CorrectAnswer,
                CreatedAt = readingExam.CreatedAt
            };

            return Ok(readingExamDto);
        }

        [HttpGet("examset/{examSetId}")]
        public async Task<ActionResult<IEnumerable<ReadingExamDto>>> GetByExamSetId(int examSetId)
        {
            var readingExams = await _repository.GetByExamSetIdAsync(examSetId);
            var readingExamDtos = readingExams.Select(r => new ReadingExamDto
            {
                ReadingExamId = r.ReadingExamId,
                ExamSetId = r.ExamSetId,
                QuestionText = r.QuestionText,
                OptionA = r.OptionA,
                OptionB = r.OptionB,
                OptionC = r.OptionC,
                OptionD = r.OptionD,
                AnswerFill = r.AnswerFill,
                CorrectAnswer = r.CorrectAnswer,
                CreatedAt = r.CreatedAt
            });

            return Ok(readingExamDtos);
        }

        [HttpPost]
        public async Task<ActionResult<ReadingExamDto>> Create([FromBody] CreateReadingExamDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var readingExam = await _repository.CreateAsync(createDto);
            var readingExamDto = new ReadingExamDto
            {
                ReadingExamId = readingExam.ReadingExamId,
                ExamSetId = readingExam.ExamSetId,
                QuestionText = readingExam.QuestionText,
                OptionA = readingExam.OptionA,
                OptionB = readingExam.OptionB,
                OptionC = readingExam.OptionC,
                OptionD = readingExam.OptionD,
                AnswerFill = readingExam.AnswerFill,
                CorrectAnswer = readingExam.CorrectAnswer,
                CreatedAt = readingExam.CreatedAt
            };

            return CreatedAtAction(nameof(GetById), new { id = readingExam.ReadingExamId }, readingExamDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ReadingExamDto>> Update(int id, [FromBody] UpdateReadingExamDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var readingExam = await _repository.UpdateAsync(id, updateDto);
            if (readingExam == null)
                return NotFound($"Reading exam with ID {id} not found.");

            var readingExamDto = new ReadingExamDto
            {
                ReadingExamId = readingExam.ReadingExamId,
                ExamSetId = readingExam.ExamSetId,
                QuestionText = readingExam.QuestionText,
                OptionA = readingExam.OptionA,
                OptionB = readingExam.OptionB,
                OptionC = readingExam.OptionC,
                OptionD = readingExam.OptionD,
                AnswerFill = readingExam.AnswerFill,
                CorrectAnswer = readingExam.CorrectAnswer,
                CreatedAt = readingExam.CreatedAt
            };

            return Ok(readingExamDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _repository.DeleteAsync(id);
            if (!result)
                return NotFound($"Reading exam with ID {id} not found.");

            return NoContent();
        }
    }
}