using System;
using System.Collections.Generic;

namespace WebRtcApi.Models;

public partial class User
{
    public int UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Role { get; set; } = null!;

    public string? Status { get; set; }

    public string? PortraitUrl { get; set; }

    public string? Experience { get; set; }

    public bool? Approved { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    public virtual ICollection<FeedbackReply> FeedbackReplies { get; set; } = new List<FeedbackReply>();

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<MentorPackage> MentorPackages { get; set; } = new List<MentorPackage>();

    public virtual ICollection<Rating> RatingMentors { get; set; } = new List<Rating>();

    public virtual ICollection<Rating> RatingStudents { get; set; } = new List<Rating>();

    public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();

    public virtual ICollection<Tip> Tips { get; set; } = new List<Tip>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
