using Microsoft.EntityFrameworkCore;
using WebRtcApi.Models;

namespace WebRtcApi.Data
{
    public partial class DatabaseContext : DbContext
    {
        public DatabaseContext()
        {
        }

        public DatabaseContext(DbContextOptions<DatabaseContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Feedback> Feedbacks { get; set; }

        public virtual DbSet<FeedbackReply> FeedbackReplies { get; set; }

        public virtual DbSet<ListeningExam> ListeningExams { get; set; }

        public virtual DbSet<ListeningExamSet> ListeningExamSets { get; set; }

        public virtual DbSet<MentorPackage> MentorPackages { get; set; }

        public virtual DbSet<Rating> Ratings { get; set; }

        public virtual DbSet<ReadingExam> ReadingExams { get; set; }

        public virtual DbSet<ReadingExamSet> ReadingExamSets { get; set; }

        public virtual DbSet<SpeakingExam> SpeakingExams { get; set; }

        public virtual DbSet<SpeakingExamSet> SpeakingExamSets { get; set; }

        public virtual DbSet<Submission> Submissions { get; set; }

        public virtual DbSet<Tip> Tips { get; set; }

        public virtual DbSet<Transaction> Transactions { get; set; }

        public virtual DbSet<User> Users { get; set; }

        public virtual DbSet<WritingExam> WritingExams { get; set; }

        public virtual DbSet<WritingExamSet> WritingExamSets { get; set; }
        public virtual DbSet<ExamCourse> ExamCourse { get; set; }
        public virtual DbSet<ExamCourseExamSet> ExamCourseExamSets { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                IConfigurationRoot configuration = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                    .Build();

                //optionsBuilder.UseSqlServer(configuration.GetConnectionString("DefaultConnections"));
                optionsBuilder.UseSqlServer(configuration.GetConnectionString("DeployConnections"));
                
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Feedback>(entity =>
            {
                entity.HasKey(e => e.FeedbackId).HasName("PK__Feedback__7A6B2B8C1CBA65EC");

                entity.ToTable("Feedback");

                entity.Property(e => e.FeedbackId).HasColumnName("feedback_id");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
                entity.Property(e => e.FeedbackText).HasColumnName("feedback_text");
                entity.Property(e => e.MentorId).HasColumnName("mentor_id");
                entity.Property(e => e.SubmissionId).HasColumnName("submission_id");

                entity.HasOne(d => d.Mentor).WithMany(p => p.Feedbacks)
                    .HasForeignKey(d => d.MentorId)
                    .HasConstraintName("FK__Feedback__mentor__628FA481");

                entity.HasOne(d => d.Submission).WithMany(p => p.Feedbacks)
                    .HasForeignKey(d => d.SubmissionId)
                    .HasConstraintName("FK__Feedback__submis__619B8048");
            });

            modelBuilder.Entity<FeedbackReply>(entity =>
            {
                entity.HasKey(e => e.ReplyId).HasName("PK__Feedback__EE4056981FA1A631");

                entity.Property(e => e.ReplyId).HasColumnName("reply_id");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
                entity.Property(e => e.FeedbackId).HasColumnName("feedback_id");
                entity.Property(e => e.ReplyText).HasColumnName("reply_text");
                entity.Property(e => e.UserId).HasColumnName("user_id");

                entity.HasOne(d => d.Feedback).WithMany(p => p.FeedbackReplies)
                    .HasForeignKey(d => d.FeedbackId)
                    .HasConstraintName("FK__FeedbackR__feedb__66603565");

                entity.HasOne(d => d.User).WithMany(p => p.FeedbackReplies)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__FeedbackR__user___6754599E");
            });

            modelBuilder.Entity<ListeningExam>(entity =>
            {
                entity.HasKey(e => e.ListeningExamId).HasName("PK__Listenin__8BD405AC8C1D506F");

                entity.Property(e => e.ListeningExamId).HasColumnName("listening_exam_id");
                entity.Property(e => e.AnswerFill)
                    .HasMaxLength(500)
                    .HasColumnName("answer_fill");
                entity.Property(e => e.AudioUrl)
                    .HasMaxLength(255)
                    .HasColumnName("audio_url");
                entity.Property(e => e.CorrectAnswer)
                    .HasMaxLength(500)
                    .HasColumnName("correct_answer");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
                entity.Property(e => e.ExamSetId).HasColumnName("exam_set_id");
                entity.Property(e => e.OptionA)
                    .HasMaxLength(500)
                    .HasColumnName("option_a");
                entity.Property(e => e.OptionB)
                    .HasMaxLength(500)
                    .HasColumnName("option_b");
                entity.Property(e => e.OptionC)
                    .HasMaxLength(500)
                    .HasColumnName("option_c");
                entity.Property(e => e.OptionD)
                    .HasMaxLength(500)
                    .HasColumnName("option_d");
                entity.Property(e => e.QuestionText).HasColumnName("question_text");

                entity.HasOne(d => d.ExamSet).WithMany(p => p.ListeningExams)
                    .HasForeignKey(d => d.ExamSetId)
                    .HasConstraintName("FK__Listening__exam___4D94879B");
            });

            modelBuilder.Entity<ListeningExamSet>(entity =>
            {
                entity.HasKey(e => e.ExamSetId).HasName("PK__Listenin__A17B929E0671B6BC");

                entity.Property(e => e.ExamSetId).HasColumnName("exam_set_id");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
                entity.Property(e => e.ExamSetCode)
                    .HasMaxLength(50)
                    .HasColumnName("exam_set_code");
                entity.Property(e => e.ExamSetTitle)
                    .HasMaxLength(200)
                    .HasColumnName("exam_set_title");
                entity.Property(e => e.TotalQuestions).HasColumnName("total_questions");
            });

            modelBuilder.Entity<MentorPackage>(entity =>
            {
                entity.HasKey(e => e.PackageId).HasName("PK__MentorPa__63846AE826817531");

                entity.Property(e => e.PackageId).HasColumnName("package_id");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.Description)
                    .HasMaxLength(500)
                    .HasColumnName("description");
                entity.Property(e => e.DurationMonths).HasColumnName("duration_months");
                entity.Property(e => e.Name)
                    .HasMaxLength(100)
                    .HasColumnName("name");
                entity.Property(e => e.Price)
                    .HasColumnType("decimal(10, 2)")
                    .HasColumnName("price");

                entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.MentorPackages)
                    .HasForeignKey(d => d.CreatedBy)
                    .HasConstraintName("FK__MentorPac__creat__6B24EA82");
            });

            modelBuilder.Entity<Rating>(entity =>
            {
                entity.HasKey(e => e.RatingId).HasName("PK__Ratings__D35B278BA9325B36");

                entity.Property(e => e.RatingId).HasColumnName("rating_id");
                entity.Property(e => e.Comment)
                    .HasMaxLength(500)
                    .HasColumnName("comment");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
                entity.Property(e => e.MentorId).HasColumnName("mentor_id");
                entity.Property(e => e.Score).HasColumnName("score");
                entity.Property(e => e.StudentId).HasColumnName("student_id");

                entity.HasOne(d => d.Mentor).WithMany(p => p.RatingMentors)
                    .HasForeignKey(d => d.MentorId)
                    .HasConstraintName("FK__Ratings__mentor___797309D9");

                entity.HasOne(d => d.Student).WithMany(p => p.RatingStudents)
                    .HasForeignKey(d => d.StudentId)
                    .HasConstraintName("FK__Ratings__student__787EE5A0");
            });

            modelBuilder.Entity<ReadingExam>(entity =>
            {
                entity.HasKey(e => e.ReadingExamId).HasName("PK__ReadingE__42DF75E4BB21C89B");

                entity.Property(e => e.ReadingExamId).HasColumnName("reading_exam_id");
                entity.Property(e => e.AnswerFill)
                    .HasMaxLength(500)
                    .HasColumnName("answer_fill");
                entity.Property(e => e.CorrectAnswer)
                    .HasMaxLength(500)
                    .HasColumnName("correct_answer");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
                entity.Property(e => e.ExamSetId).HasColumnName("exam_set_id");
                entity.Property(e => e.OptionA)
                    .HasMaxLength(500)
                    .HasColumnName("option_a");
                entity.Property(e => e.OptionB)
                    .HasMaxLength(500)
                    .HasColumnName("option_b");
                entity.Property(e => e.OptionC)
                    .HasMaxLength(500)
                    .HasColumnName("option_c");
                entity.Property(e => e.OptionD)
                    .HasMaxLength(500)
                    .HasColumnName("option_d");
                entity.Property(e => e.QuestionText).HasColumnName("question_text");

                entity.HasOne(d => d.ExamSet).WithMany(p => p.ReadingExams)
                    .HasForeignKey(d => d.ExamSetId)
                    .HasConstraintName("FK__ReadingEx__exam___49C3F6B7");
            });

            modelBuilder.Entity<ReadingExamSet>(entity =>
            {
                entity.HasKey(e => e.ExamSetId).HasName("PK__ReadingE__A17B929E4482E5F5");

                entity.Property(e => e.ExamSetId).HasColumnName("exam_set_id");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
                entity.Property(e => e.ExamSetCode)
                    .HasMaxLength(50)
                    .HasColumnName("exam_set_code");
                entity.Property(e => e.ExamSetTitle)
                    .HasMaxLength(200)
                    .HasColumnName("exam_set_title");
                entity.Property(e => e.TotalQuestions).HasColumnName("total_questions");
            });

            modelBuilder.Entity<SpeakingExam>(entity =>
            {
                entity.HasKey(e => e.SpeakingExamId).HasName("PK__Speaking__748363AD3304BFEF");

                entity.Property(e => e.SpeakingExamId).HasColumnName("speaking_exam_id");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
                entity.Property(e => e.ExamSetId).HasColumnName("exam_set_id");
                entity.Property(e => e.QuestionText).HasColumnName("question_text");

                entity.HasOne(d => d.ExamSet).WithMany(p => p.SpeakingExams)
                    .HasForeignKey(d => d.ExamSetId)
                    .HasConstraintName("FK__SpeakingE__exam___5535A963");
            });

            modelBuilder.Entity<SpeakingExamSet>(entity =>
            {
                entity.HasKey(e => e.ExamSetId).HasName("PK__Speaking__A17B929E81B9EAEC");

                entity.Property(e => e.ExamSetId).HasColumnName("exam_set_id");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
                entity.Property(e => e.ExamSetCode)
                    .HasMaxLength(50)
                    .HasColumnName("exam_set_code");
                entity.Property(e => e.ExamSetTitle)
                    .HasMaxLength(200)
                    .HasColumnName("exam_set_title");
                entity.Property(e => e.TotalQuestions).HasColumnName("total_questions");
            });

            modelBuilder.Entity<Submission>(entity =>
            {
                entity.HasKey(e => e.SubmissionId).HasName("PK__Submissi__9B535595A47119B8");

                entity.Property(e => e.SubmissionId).HasColumnName("submission_id");
                entity.Property(e => e.AiScore)
                    .HasColumnType("decimal(4, 2)")
                    .HasColumnName("ai_score");
                entity.Property(e => e.AnswerAudioUrl)
                    .HasMaxLength(255)
                    .HasColumnName("answer_audio_url");
                entity.Property(e => e.AnswerChoice)
                    .HasMaxLength(5)
                    .HasColumnName("answer_choice");
                entity.Property(e => e.AnswerFill)
                    .HasMaxLength(500)
                    .HasColumnName("answer_fill");
                entity.Property(e => e.AnswerText).HasColumnName("answer_text");
                
                entity.Property(e => e.MentorScore)
                    .HasColumnType("decimal(4, 2)")
                    .HasColumnName("mentor_score");
               
                entity.Property(e => e.Status)
                    .HasMaxLength(20)
                    .HasDefaultValue("Pending")
                    .HasColumnName("status");
                entity.Property(e => e.SubmittedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("submitted_at");
                entity.Property(e => e.UserId).HasColumnName("user_id");
               

                entity.HasOne(d => d.User).WithMany(p => p.Submissions)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__Submissio__user___59063A47");

                
            });

            modelBuilder.Entity<Tip>(entity =>
            {
                entity.HasKey(e => e.TipId).HasName("PK__Tips__377877B260C35396");

                entity.Property(e => e.TipId).HasColumnName("tip_id");
                entity.Property(e => e.Content).HasColumnName("content");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
                entity.Property(e => e.MentorId).HasColumnName("mentor_id");
                entity.Property(e => e.Title)
                    .HasMaxLength(200)
                    .HasColumnName("title");

                entity.HasOne(d => d.Mentor).WithMany(p => p.Tips)
                    .HasForeignKey(d => d.MentorId)
                    .HasConstraintName("FK__Tips__mentor_id__74AE54BC");
            });

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasKey(e => e.TransactionId).HasName("PK__Transact__85C600AF9F6E8EE6");

                entity.Property(e => e.TransactionId).HasColumnName("transaction_id");
                entity.Property(e => e.Amount)
                    .HasColumnType("decimal(10, 2)")
                    .HasColumnName("amount");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
                entity.Property(e => e.PackageId).HasColumnName("package_id");
                entity.Property(e => e.Status)
                    .HasMaxLength(20)
                    .HasDefaultValue("Success")
                    .HasColumnName("status");
                entity.Property(e => e.UserId).HasColumnName("user_id");

                entity.HasOne(d => d.Package).WithMany(p => p.Transactions)
                    .HasForeignKey(d => d.PackageId)
                    .HasConstraintName("FK__Transacti__packa__6FE99F9F");

                entity.HasOne(d => d.User).WithMany(p => p.Transactions)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__Transacti__user___6EF57B66");
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId).HasName("PK__Users__B9BE370FEC5421A2");

                entity.HasIndex(e => e.Email, "UQ__Users__AB6E6164878D058A").IsUnique();

                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Approved)
                    .HasDefaultValue(false)
                    .HasColumnName("approved");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
                entity.Property(e => e.Email)
                    .HasMaxLength(100)
                    .HasColumnName("email");
                entity.Property(e => e.Experience)
                    .HasMaxLength(500)
                    .HasColumnName("experience");
                entity.Property(e => e.FullName)
                    .HasMaxLength(100)
                    .HasColumnName("full_name");
                entity.Property(e => e.PasswordHash)
                    .HasMaxLength(255)
                    .HasColumnName("password_hash");
                entity.Property(e => e.PortraitUrl)
                    .HasMaxLength(255)
                    .HasColumnName("portrait_url");
                entity.Property(e => e.Role)
                    .HasMaxLength(20)
                    .HasColumnName("role");
                entity.Property(e => e.Status)
                    .HasMaxLength(20)
                    .HasDefaultValue("Active")
                    .HasColumnName("status");
                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasColumnName("updated_at");
            });

            modelBuilder.Entity<WritingExam>(entity =>
            {
                entity.HasKey(e => e.WritingExamId).HasName("PK__WritingE__AD39DDEE5F9515DB");

                entity.Property(e => e.WritingExamId).HasColumnName("writing_exam_id");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
                entity.Property(e => e.ExamSetId).HasColumnName("exam_set_id");
                entity.Property(e => e.QuestionText).HasColumnName("question_text");

                entity.HasOne(d => d.ExamSet).WithMany(p => p.WritingExams)
                    .HasForeignKey(d => d.ExamSetId)
                    .HasConstraintName("FK__WritingEx__exam___5165187F");
            });

            modelBuilder.Entity<WritingExamSet>(entity =>
            {
                entity.HasKey(e => e.ExamSetId).HasName("PK__WritingE__A17B929E054A746A");

                entity.Property(e => e.ExamSetId).HasColumnName("exam_set_id");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
                entity.Property(e => e.ExamSetCode)
                    .HasMaxLength(50)
                    .HasColumnName("exam_set_code");
                entity.Property(e => e.ExamSetTitle)
                    .HasMaxLength(200)
                    .HasColumnName("exam_set_title");
                entity.Property(e => e.TotalQuestions).HasColumnName("total_questions");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }

}
       
