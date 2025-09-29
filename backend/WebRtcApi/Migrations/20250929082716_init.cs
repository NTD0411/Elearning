using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebRtcApi.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ListeningExamSets",
                columns: table => new
                {
                    exam_set_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    exam_set_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    exam_set_title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    total_questions = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Listenin__A17B929E0671B6BC", x => x.exam_set_id);
                });

            migrationBuilder.CreateTable(
                name: "ReadingExamSets",
                columns: table => new
                {
                    exam_set_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    exam_set_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    exam_set_title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    total_questions = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ReadingE__A17B929E4482E5F5", x => x.exam_set_id);
                });

            migrationBuilder.CreateTable(
                name: "SpeakingExamSets",
                columns: table => new
                {
                    exam_set_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    exam_set_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    exam_set_title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    total_questions = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Speaking__A17B929E81B9EAEC", x => x.exam_set_id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    full_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    password_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "Active"),
                    portrait_url = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    experience = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    approved = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    RefreshToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefreshTokenExpiryTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Users__B9BE370FEC5421A2", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "WritingExamSets",
                columns: table => new
                {
                    exam_set_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    exam_set_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    exam_set_title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    total_questions = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__WritingE__A17B929E054A746A", x => x.exam_set_id);
                });

            migrationBuilder.CreateTable(
                name: "ListeningExams",
                columns: table => new
                {
                    listening_exam_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    exam_set_id = table.Column<int>(type: "int", nullable: true),
                    audio_url = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    question_text = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    option_a = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    option_b = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    option_c = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    option_d = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    answer_fill = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    correct_answer = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Listenin__8BD405AC8C1D506F", x => x.listening_exam_id);
                    table.ForeignKey(
                        name: "FK__Listening__exam___4D94879B",
                        column: x => x.exam_set_id,
                        principalTable: "ListeningExamSets",
                        principalColumn: "exam_set_id");
                });

            migrationBuilder.CreateTable(
                name: "ReadingExams",
                columns: table => new
                {
                    reading_exam_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    exam_set_id = table.Column<int>(type: "int", nullable: true),
                    question_text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    option_a = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    option_b = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    option_c = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    option_d = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    answer_fill = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    correct_answer = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ReadingE__42DF75E4BB21C89B", x => x.reading_exam_id);
                    table.ForeignKey(
                        name: "FK__ReadingEx__exam___49C3F6B7",
                        column: x => x.exam_set_id,
                        principalTable: "ReadingExamSets",
                        principalColumn: "exam_set_id");
                });

            migrationBuilder.CreateTable(
                name: "SpeakingExams",
                columns: table => new
                {
                    speaking_exam_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    exam_set_id = table.Column<int>(type: "int", nullable: true),
                    question_text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Speaking__748363AD3304BFEF", x => x.speaking_exam_id);
                    table.ForeignKey(
                        name: "FK__SpeakingE__exam___5535A963",
                        column: x => x.exam_set_id,
                        principalTable: "SpeakingExamSets",
                        principalColumn: "exam_set_id");
                });

            migrationBuilder.CreateTable(
                name: "MentorPackages",
                columns: table => new
                {
                    package_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    duration_months = table.Column<int>(type: "int", nullable: false),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__MentorPa__63846AE826817531", x => x.package_id);
                    table.ForeignKey(
                        name: "FK__MentorPac__creat__6B24EA82",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Ratings",
                columns: table => new
                {
                    rating_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    student_id = table.Column<int>(type: "int", nullable: true),
                    mentor_id = table.Column<int>(type: "int", nullable: true),
                    score = table.Column<int>(type: "int", nullable: true),
                    comment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Ratings__D35B278BA9325B36", x => x.rating_id);
                    table.ForeignKey(
                        name: "FK__Ratings__mentor___797309D9",
                        column: x => x.mentor_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Ratings__student__787EE5A0",
                        column: x => x.student_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Tips",
                columns: table => new
                {
                    tip_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    mentor_id = table.Column<int>(type: "int", nullable: true),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Tips__377877B260C35396", x => x.tip_id);
                    table.ForeignKey(
                        name: "FK__Tips__mentor_id__74AE54BC",
                        column: x => x.mentor_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Submissions",
                columns: table => new
                {
                    submission_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    reading_exam_set_id = table.Column<int>(type: "int", nullable: true),
                    listening_exam_set_id = table.Column<int>(type: "int", nullable: true),
                    writing_exam_set_id = table.Column<int>(type: "int", nullable: true),
                    speaking_exam_set_id = table.Column<int>(type: "int", nullable: true),
                    answer_text = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    answer_choice = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: true),
                    answer_fill = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    answer_audio_url = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    submitted_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    ai_score = table.Column<decimal>(type: "decimal(4,2)", nullable: true),
                    mentor_score = table.Column<decimal>(type: "decimal(4,2)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "Pending")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Submissi__9B535595A47119B8", x => x.submission_id);
                    table.ForeignKey(
                        name: "FK__Submissio__liste__5AEE82B9",
                        column: x => x.listening_exam_set_id,
                        principalTable: "ListeningExamSets",
                        principalColumn: "exam_set_id");
                    table.ForeignKey(
                        name: "FK__Submissio__readi__59FA5E80",
                        column: x => x.reading_exam_set_id,
                        principalTable: "ReadingExamSets",
                        principalColumn: "exam_set_id");
                    table.ForeignKey(
                        name: "FK__Submissio__speak__5CD6CB2B",
                        column: x => x.speaking_exam_set_id,
                        principalTable: "SpeakingExamSets",
                        principalColumn: "exam_set_id");
                    table.ForeignKey(
                        name: "FK__Submissio__user___59063A47",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Submissio__writi__5BE2A6F2",
                        column: x => x.writing_exam_set_id,
                        principalTable: "WritingExamSets",
                        principalColumn: "exam_set_id");
                });

            migrationBuilder.CreateTable(
                name: "WritingExams",
                columns: table => new
                {
                    writing_exam_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    exam_set_id = table.Column<int>(type: "int", nullable: true),
                    question_text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__WritingE__AD39DDEE5F9515DB", x => x.writing_exam_id);
                    table.ForeignKey(
                        name: "FK__WritingEx__exam___5165187F",
                        column: x => x.exam_set_id,
                        principalTable: "WritingExamSets",
                        principalColumn: "exam_set_id");
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    transaction_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    package_id = table.Column<int>(type: "int", nullable: true),
                    amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "Success"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Transact__85C600AF9F6E8EE6", x => x.transaction_id);
                    table.ForeignKey(
                        name: "FK__Transacti__packa__6FE99F9F",
                        column: x => x.package_id,
                        principalTable: "MentorPackages",
                        principalColumn: "package_id");
                    table.ForeignKey(
                        name: "FK__Transacti__user___6EF57B66",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Feedback",
                columns: table => new
                {
                    feedback_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    submission_id = table.Column<int>(type: "int", nullable: true),
                    mentor_id = table.Column<int>(type: "int", nullable: true),
                    feedback_text = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Feedback__7A6B2B8C1CBA65EC", x => x.feedback_id);
                    table.ForeignKey(
                        name: "FK__Feedback__mentor__628FA481",
                        column: x => x.mentor_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Feedback__submis__619B8048",
                        column: x => x.submission_id,
                        principalTable: "Submissions",
                        principalColumn: "submission_id");
                });

            migrationBuilder.CreateTable(
                name: "FeedbackReplies",
                columns: table => new
                {
                    reply_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    feedback_id = table.Column<int>(type: "int", nullable: true),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    reply_text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Feedback__EE4056981FA1A631", x => x.reply_id);
                    table.ForeignKey(
                        name: "FK__FeedbackR__feedb__66603565",
                        column: x => x.feedback_id,
                        principalTable: "Feedback",
                        principalColumn: "feedback_id");
                    table.ForeignKey(
                        name: "FK__FeedbackR__user___6754599E",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_mentor_id",
                table: "Feedback",
                column: "mentor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_submission_id",
                table: "Feedback",
                column: "submission_id");

            migrationBuilder.CreateIndex(
                name: "IX_FeedbackReplies_feedback_id",
                table: "FeedbackReplies",
                column: "feedback_id");

            migrationBuilder.CreateIndex(
                name: "IX_FeedbackReplies_user_id",
                table: "FeedbackReplies",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_ListeningExams_exam_set_id",
                table: "ListeningExams",
                column: "exam_set_id");

            migrationBuilder.CreateIndex(
                name: "IX_MentorPackages_created_by",
                table: "MentorPackages",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_mentor_id",
                table: "Ratings",
                column: "mentor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_student_id",
                table: "Ratings",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingExams_exam_set_id",
                table: "ReadingExams",
                column: "exam_set_id");

            migrationBuilder.CreateIndex(
                name: "IX_SpeakingExams_exam_set_id",
                table: "SpeakingExams",
                column: "exam_set_id");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_listening_exam_set_id",
                table: "Submissions",
                column: "listening_exam_set_id");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_reading_exam_set_id",
                table: "Submissions",
                column: "reading_exam_set_id");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_speaking_exam_set_id",
                table: "Submissions",
                column: "speaking_exam_set_id");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_user_id",
                table: "Submissions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_writing_exam_set_id",
                table: "Submissions",
                column: "writing_exam_set_id");

            migrationBuilder.CreateIndex(
                name: "IX_Tips_mentor_id",
                table: "Tips",
                column: "mentor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_package_id",
                table: "Transactions",
                column: "package_id");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_user_id",
                table: "Transactions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Users__AB6E6164878D058A",
                table: "Users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WritingExams_exam_set_id",
                table: "WritingExams",
                column: "exam_set_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FeedbackReplies");

            migrationBuilder.DropTable(
                name: "ListeningExams");

            migrationBuilder.DropTable(
                name: "Ratings");

            migrationBuilder.DropTable(
                name: "ReadingExams");

            migrationBuilder.DropTable(
                name: "SpeakingExams");

            migrationBuilder.DropTable(
                name: "Tips");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "WritingExams");

            migrationBuilder.DropTable(
                name: "Feedback");

            migrationBuilder.DropTable(
                name: "MentorPackages");

            migrationBuilder.DropTable(
                name: "Submissions");

            migrationBuilder.DropTable(
                name: "ListeningExamSets");

            migrationBuilder.DropTable(
                name: "ReadingExamSets");

            migrationBuilder.DropTable(
                name: "SpeakingExamSets");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "WritingExamSets");
        }
    }
}
