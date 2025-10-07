using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebRtcApi.Data;
using WebRtcApi.Models;

namespace WebRtcApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamSetController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public ExamSetController(DatabaseContext context)
        {
            _context = context;
        }

        // GET: api/ExamSet/reading
        [HttpGet("reading")]
        public async Task<ActionResult<IEnumerable<object>>> GetReadingExamSets()
        {
            var examSets = await _context.ReadingExamSets
                .Select(r => new
                {
                    r.ExamSetId,
                    r.ExamSetTitle,
                    r.ExamSetCode,
                    r.CreatedAt,
                    r.TotalQuestions,
                    r.ReadingContext,
                    r.ReadingImage,
                    QuestionCount = _context.ReadingExams.Count(e => e.ExamSetId == r.ExamSetId),
                    Type = "Reading"
                })
                .ToListAsync();

            return Ok(examSets);
        }

        // GET: api/ExamSet/listening
        [HttpGet("listening")]
        public async Task<ActionResult<IEnumerable<object>>> GetListeningExamSets()
        {
            var examSets = await _context.ListeningExamSets
                .Select(l => new
                {
                    l.ExamSetId,
                    l.ExamSetTitle,
                    l.ExamSetCode,
                    l.CreatedAt,
                    l.TotalQuestions,
                    l.ListeningImage,
                    QuestionCount = _context.ListeningExams.Count(e => e.ExamSetId == l.ExamSetId),
                    Type = "Listening"
                })
                .ToListAsync();

            return Ok(examSets);
        }

        // GET: api/ExamSet/speaking
        [HttpGet("speaking")]
        public async Task<ActionResult<IEnumerable<object>>> GetSpeakingExamSets()
        {
            var examSets = await _context.SpeakingExamSets
                .Select(s => new
                {
                    s.ExamSetId,
                    s.ExamSetTitle,
                    s.ExamSetCode,
                    s.CreatedAt,
                    s.TotalQuestions,
                    QuestionCount = _context.SpeakingExams.Count(e => e.ExamSetId == s.ExamSetId),
                    Type = "Speaking"
                })
                .ToListAsync();

            return Ok(examSets);
        }

        // GET: api/ExamSet/writing
        [HttpGet("writing")]
        public async Task<ActionResult<IEnumerable<object>>> GetWritingExamSets()
        {
            var examSets = await _context.WritingExamSets
                .Select(w => new
                {
                    w.ExamSetId,
                    w.ExamSetTitle,
                    w.ExamSetCode,
                    w.CreatedAt,
                    w.TotalQuestions,
                    QuestionCount = _context.WritingExams.Count(e => e.ExamSetId == w.ExamSetId),
                    Type = "Writing"
                })
                .ToListAsync();

            return Ok(examSets);
        }

        // GET: api/ExamSet/Reading/{id}
        [HttpGet("Reading/{id}")]
        public async Task<ActionResult<object>> GetReadingExamSet(int id)
        {
            var examSet = await _context.ReadingExamSets
                .Where(r => r.ExamSetId == id)
                .Select(r => new
                {
                    id = r.ExamSetId,
                    code = r.ExamSetCode,
                    name = r.ExamSetTitle,
                    description = "",
                    targetQuestions = r.TotalQuestions,
                    readingContext = r.ReadingContext,
                    readingImage = r.ReadingImage,
                    questionCount = _context.ReadingExams.Count(e => e.ExamSetId == r.ExamSetId),
                    createdAt = r.CreatedAt,
                    type = "Reading"
                })
                .FirstOrDefaultAsync();

            if (examSet == null)
                return NotFound();

            return Ok(examSet);
        }

        // GET: api/ExamSet/Listening/{id}
        [HttpGet("Listening/{id}")]
        public async Task<ActionResult<object>> GetListeningExamSet(int id)
        {
            var examSet = await _context.ListeningExamSets
                .Where(l => l.ExamSetId == id)
                .Select(l => new
                {
                    id = l.ExamSetId,
                    code = l.ExamSetCode,
                    name = l.ExamSetTitle,
                    description = "",
                    targetQuestions = l.TotalQuestions,
                    listeningImage = l.ListeningImage,
                    questionCount = _context.ListeningExams.Count(e => e.ExamSetId == l.ExamSetId),
                    createdAt = l.CreatedAt,
                    type = "Listening"
                })
                .FirstOrDefaultAsync();

            if (examSet == null)
                return NotFound();

            return Ok(examSet);
        }

        // GET: api/ExamSet/Speaking/{id}
        [HttpGet("Speaking/{id}")]
        public async Task<ActionResult<object>> GetSpeakingExamSet(int id)
        {
            var examSet = await _context.SpeakingExamSets
                .Where(s => s.ExamSetId == id)
                .Select(s => new
                {
                    id = s.ExamSetId,
                    code = s.ExamSetCode,
                    name = s.ExamSetTitle,
                    description = "",
                    targetQuestions = s.TotalQuestions,
                    questionCount = _context.SpeakingExams.Count(e => e.ExamSetId == s.ExamSetId),
                    createdAt = s.CreatedAt,
                    type = "Speaking"
                })
                .FirstOrDefaultAsync();

            if (examSet == null)
                return NotFound();

            return Ok(examSet);
        }

        // GET: api/ExamSet/Writing/{id}
        [HttpGet("Writing/{id}")]
        public async Task<ActionResult<object>> GetWritingExamSet(int id)
        {
            var examSet = await _context.WritingExamSets
                .Where(w => w.ExamSetId == id)
                .Select(w => new
                {
                    id = w.ExamSetId,
                    code = w.ExamSetCode,
                    name = w.ExamSetTitle,
                    description = "",
                    targetQuestions = w.TotalQuestions,
                    questionCount = _context.WritingExams.Count(e => e.ExamSetId == w.ExamSetId),
                    createdAt = w.CreatedAt,
                    type = "Writing"
                })
                .FirstOrDefaultAsync();

            if (examSet == null)
                return NotFound();

            return Ok(examSet);
        }

        // POST: api/ExamSet/reading
        [HttpPost("reading")]
        public async Task<ActionResult<ReadingExamSet>> CreateReadingExamSet([FromBody] CreateExamSetRequest request)
        {
            var examSet = new ReadingExamSet
            {
                ExamSetCode = $"RS_{DateTime.Now:yyyyMMddHHmmss}",
                ExamSetTitle = request.Title,
                TotalQuestions = request.TargetQuestions,
                ReadingContext = request.ReadingContext,
                ReadingImage = request.ReadingImage,
                CreatedAt = DateTime.Now
            };

            _context.ReadingExamSets.Add(examSet);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReadingExamSets), new { id = examSet.ExamSetId }, examSet);
        }

        // POST: api/ExamSet/listening
        [HttpPost("listening")]
        public async Task<ActionResult<ListeningExamSet>> CreateListeningExamSet([FromBody] CreateExamSetRequest request)
        {
            var examSet = new ListeningExamSet
            {
                ExamSetCode = $"LS_{DateTime.Now:yyyyMMddHHmmss}",
                ExamSetTitle = request.Title,
                TotalQuestions = request.TargetQuestions,
                ListeningImage = request.ListeningImage,
                CreatedAt = DateTime.Now
            };

            _context.ListeningExamSets.Add(examSet);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetListeningExamSets), new { id = examSet.ExamSetId }, examSet);
        }

        // POST: api/ExamSet/speaking
        [HttpPost("speaking")]
        public async Task<ActionResult<SpeakingExamSet>> CreateSpeakingExamSet([FromBody] CreateExamSetRequest request)
        {
            var examSet = new SpeakingExamSet
            {
                ExamSetCode = $"SS_{DateTime.Now:yyyyMMddHHmmss}",
                ExamSetTitle = request.Title,
                TotalQuestions = request.TargetQuestions,
                CreatedAt = DateTime.Now
            };

            _context.SpeakingExamSets.Add(examSet);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSpeakingExamSets), new { id = examSet.ExamSetId }, examSet);
        }

        // POST: api/ExamSet/writing
        [HttpPost("writing")]
        public async Task<ActionResult<WritingExamSet>> CreateWritingExamSet([FromBody] CreateExamSetRequest request)
        {
            var examSet = new WritingExamSet
            {
                ExamSetCode = $"WS_{DateTime.Now:yyyyMMddHHmmss}",
                ExamSetTitle = request.Title,
                TotalQuestions = request.TargetQuestions,
                CreatedAt = DateTime.Now
            };

            _context.WritingExamSets.Add(examSet);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWritingExamSets), new { id = examSet.ExamSetId }, examSet);
        }

        // PUT: api/ExamSet/Reading/{id}
        [HttpPut("Reading/{id}")]
        public async Task<IActionResult> UpdateReadingExamSet(int id, UpdateExamSetRequest request)
        {
            var examSet = await _context.ReadingExamSets.FindAsync(id);
            if (examSet == null)
                return NotFound();

            examSet.ExamSetTitle = request.ExamSetTitle;
            examSet.TotalQuestions = request.TotalQuestions;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, "Error updating exam set");
            }
        }

        // PUT: api/ExamSet/Listening/{id}
        [HttpPut("Listening/{id}")]
        public async Task<IActionResult> UpdateListeningExamSet(int id, UpdateExamSetRequest request)
        {
            var examSet = await _context.ListeningExamSets.FindAsync(id);
            if (examSet == null)
                return NotFound();

            examSet.ExamSetTitle = request.ExamSetTitle;
            examSet.TotalQuestions = request.TotalQuestions;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, "Error updating exam set");
            }
        }

        // PUT: api/ExamSet/Speaking/{id}
        [HttpPut("Speaking/{id}")]
        public async Task<IActionResult> UpdateSpeakingExamSet(int id, UpdateExamSetRequest request)
        {
            var examSet = await _context.SpeakingExamSets.FindAsync(id);
            if (examSet == null)
                return NotFound();

            examSet.ExamSetTitle = request.ExamSetTitle;
            examSet.TotalQuestions = request.TotalQuestions;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, "Error updating exam set");
            }
        }

        // PUT: api/ExamSet/Writing/{id}
        [HttpPut("Writing/{id}")]
        public async Task<IActionResult> UpdateWritingExamSet(int id, UpdateExamSetRequest request)
        {
            var examSet = await _context.WritingExamSets.FindAsync(id);
            if (examSet == null)
                return NotFound();

            examSet.ExamSetTitle = request.ExamSetTitle;
            examSet.TotalQuestions = request.TotalQuestions;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, "Error updating exam set");
            }
        }

        // DELETE: api/ExamSet/reading/{id}
        [HttpDelete("reading/{id}")]
        public async Task<IActionResult> DeleteReadingExamSet(int id)
        {
            var examSet = await _context.ReadingExamSets.FindAsync(id);
            if (examSet == null)
            {
                return NotFound();
            }

            _context.ReadingExamSets.Remove(examSet);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/ExamSet/listening/{id}
        [HttpDelete("listening/{id}")]
        public async Task<IActionResult> DeleteListeningExamSet(int id)
        {
            var examSet = await _context.ListeningExamSets.FindAsync(id);
            if (examSet == null)
            {
                return NotFound();
            }

            _context.ListeningExamSets.Remove(examSet);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/ExamSet/speaking/{id}
        [HttpDelete("speaking/{id}")]
        public async Task<IActionResult> DeleteSpeakingExamSet(int id)
        {
            var examSet = await _context.SpeakingExamSets.FindAsync(id);
            if (examSet == null)
            {
                return NotFound();
            }

            _context.SpeakingExamSets.Remove(examSet);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/ExamSet/writing/{id}
        [HttpDelete("writing/{id}")]
        public async Task<IActionResult> DeleteWritingExamSet(int id)
        {
            var examSet = await _context.WritingExamSets.FindAsync(id);
            if (examSet == null)
            {
                return NotFound();
            }

            _context.WritingExamSets.Remove(examSet);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class CreateExamSetRequest
    {
        public string Title { get; set; } = string.Empty;
        public int TargetQuestions { get; set; } = 5;
        public string? ReadingContext { get; set; }
        public string? ReadingImage { get; set; }
        public string? ListeningImage { get; set; }
    }

    public class UpdateExamSetRequest
    {
        public string ExamSetTitle { get; set; } = string.Empty;
        public int TotalQuestions { get; set; } = 5;
    }
}