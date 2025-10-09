namespace WebRtcApi.Dtos.Submissions
{
    public class SpeakingSubmissionDto
    {
        public int UserId { get; set; }
        public int ExamSetId { get; set; }
        public List<IFormFile> AudioFiles { get; set; } = new List<IFormFile>();
    }
}