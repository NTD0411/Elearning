using Microsoft.AspNetCore.Mvc;
using WebRtcApi.Repositories.Exams;
using WebRtcApi.Dtos.Exams;

namespace WebRtcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListeningExamController : ControllerBase
    {
        private readonly IListeningExamRepository _repository;

        public ListeningExamController(IListeningExamRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ListeningExamDto>>> GetAll()
        {
            var listeningExams = await _repository.GetAllAsync();
            var listeningExamDtos = listeningExams.Select(l => new ListeningExamDto
            {
                ListeningExamId = l.ListeningExamId,
                ExamSetId = l.ExamSetId,
                AudioUrl = l.AudioUrl,
                QuestionText = l.QuestionText,
                OptionA = l.OptionA,
                OptionB = l.OptionB,
                OptionC = l.OptionC,
                OptionD = l.OptionD,
                AnswerFill = l.AnswerFill,
                CorrectAnswer = l.CorrectAnswer,
                CreatedAt = l.CreatedAt
            });

            return Ok(listeningExamDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ListeningExamDto>> GetById(int id)
        {
            var listeningExam = await _repository.GetByIdAsync(id);
            if (listeningExam == null)
                return NotFound($"Listening exam with ID {id} not found.");

            var listeningExamDto = new ListeningExamDto
            {
                ListeningExamId = listeningExam.ListeningExamId,
                ExamSetId = listeningExam.ExamSetId,
                AudioUrl = listeningExam.AudioUrl,
                QuestionText = listeningExam.QuestionText,
                OptionA = listeningExam.OptionA,
                OptionB = listeningExam.OptionB,
                OptionC = listeningExam.OptionC,
                OptionD = listeningExam.OptionD,
                AnswerFill = listeningExam.AnswerFill,
                CorrectAnswer = listeningExam.CorrectAnswer,
                CreatedAt = listeningExam.CreatedAt
            };

            return Ok(listeningExamDto);
        }

        [HttpGet("examset/{examSetId}")]
        public async Task<ActionResult<IEnumerable<ListeningExamDto>>> GetByExamSetId(int examSetId)
        {
            var listeningExams = await _repository.GetByExamSetIdAsync(examSetId);
            var listeningExamDtos = listeningExams.Select(l => new ListeningExamDto
            {
                ListeningExamId = l.ListeningExamId,
                ExamSetId = l.ExamSetId,
                AudioUrl = l.AudioUrl,
                QuestionText = l.QuestionText,
                OptionA = l.OptionA,
                OptionB = l.OptionB,
                OptionC = l.OptionC,
                OptionD = l.OptionD,
                AnswerFill = l.AnswerFill,
                CorrectAnswer = l.CorrectAnswer,
                CreatedAt = l.CreatedAt
            });

            return Ok(listeningExamDtos);
        }

        [HttpPost]
        public async Task<ActionResult<ListeningExamDto>> Create([FromBody] CreateListeningExamDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var listeningExam = await _repository.CreateAsync(createDto);
            var listeningExamDto = new ListeningExamDto
            {
                ListeningExamId = listeningExam.ListeningExamId,
                ExamSetId = listeningExam.ExamSetId,
                AudioUrl = listeningExam.AudioUrl,
                QuestionText = listeningExam.QuestionText,
                OptionA = listeningExam.OptionA,
                OptionB = listeningExam.OptionB,
                OptionC = listeningExam.OptionC,
                OptionD = listeningExam.OptionD,
                AnswerFill = listeningExam.AnswerFill,
                CorrectAnswer = listeningExam.CorrectAnswer,
                CreatedAt = listeningExam.CreatedAt
            };

            return CreatedAtAction(nameof(GetById), new { id = listeningExam.ListeningExamId }, listeningExamDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ListeningExamDto>> Update(int id, [FromBody] UpdateListeningExamDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var listeningExam = await _repository.UpdateAsync(id, updateDto);
            if (listeningExam == null)
                return NotFound($"Listening exam with ID {id} not found.");

            var listeningExamDto = new ListeningExamDto
            {
                ListeningExamId = listeningExam.ListeningExamId,
                ExamSetId = listeningExam.ExamSetId,
                AudioUrl = listeningExam.AudioUrl,
                QuestionText = listeningExam.QuestionText,
                OptionA = listeningExam.OptionA,
                OptionB = listeningExam.OptionB,
                OptionC = listeningExam.OptionC,
                OptionD = listeningExam.OptionD,
                AnswerFill = listeningExam.AnswerFill,
                CorrectAnswer = listeningExam.CorrectAnswer,
                CreatedAt = listeningExam.CreatedAt
            };

            return Ok(listeningExamDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _repository.DeleteAsync(id);
            if (!result)
                return NotFound($"Listening exam with ID {id} not found.");

            return NoContent();
        }
    }
}