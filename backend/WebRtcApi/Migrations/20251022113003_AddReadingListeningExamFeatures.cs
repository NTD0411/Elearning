using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebRtcApi.Migrations
{
    /// <inheritdoc />
    public partial class AddReadingListeningExamFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListeningExamSets_ExamCourse_ExamCourseId",
                table: "ListeningExamSets");

            migrationBuilder.DropForeignKey(
                name: "FK_ReadingExamSets_ExamCourse_ExamCourseId",
                table: "ReadingExamSets");

            migrationBuilder.DropForeignKey(
                name: "FK_Submissions_ExamCourse_ExamCourseId",
                table: "Submissions");

            migrationBuilder.RenameColumn(
                name: "Answers",
                table: "Submissions",
                newName: "answers");

            migrationBuilder.RenameColumn(
                name: "TotalWordCount",
                table: "Submissions",
                newName: "total_word_count");

            migrationBuilder.RenameColumn(
                name: "TimeSpent",
                table: "Submissions",
                newName: "time_spent");

            migrationBuilder.RenameColumn(
                name: "ExamType",
                table: "Submissions",
                newName: "exam_type");

            migrationBuilder.RenameColumn(
                name: "ExamId",
                table: "Submissions",
                newName: "exam_id");

            migrationBuilder.RenameColumn(
                name: "ExamCourseId",
                table: "Submissions",
                newName: "exam_course_id");

            migrationBuilder.RenameColumn(
                name: "AiTaskAchievementScore",
                table: "Submissions",
                newName: "ai_task_achievement_score");

            migrationBuilder.RenameColumn(
                name: "AiTaskAchievementFeedback",
                table: "Submissions",
                newName: "ai_task_achievement_feedback");

            migrationBuilder.RenameColumn(
                name: "AiLexicalResourceScore",
                table: "Submissions",
                newName: "ai_lexical_resource_score");

            migrationBuilder.RenameColumn(
                name: "AiLexicalResourceFeedback",
                table: "Submissions",
                newName: "ai_lexical_resource_feedback");

            migrationBuilder.RenameColumn(
                name: "AiGrammaticalRangeScore",
                table: "Submissions",
                newName: "ai_grammatical_range_score");

            migrationBuilder.RenameColumn(
                name: "AiGrammaticalRangeFeedback",
                table: "Submissions",
                newName: "ai_grammatical_range_feedback");

            migrationBuilder.RenameColumn(
                name: "AiGeneralFeedback",
                table: "Submissions",
                newName: "ai_general_feedback");

            migrationBuilder.RenameColumn(
                name: "AiCoherenceCohesionScore",
                table: "Submissions",
                newName: "ai_coherence_cohesion_score");

            migrationBuilder.RenameColumn(
                name: "AiCoherenceCohesionFeedback",
                table: "Submissions",
                newName: "ai_coherence_cohesion_feedback");

            migrationBuilder.RenameIndex(
                name: "IX_Submissions_ExamCourseId",
                table: "Submissions",
                newName: "IX_Submissions_exam_course_id");

            migrationBuilder.RenameColumn(
                name: "ReadingImage",
                table: "ReadingExamSets",
                newName: "reading_image");

            migrationBuilder.RenameColumn(
                name: "ReadingContext",
                table: "ReadingExamSets",
                newName: "reading_context");

            migrationBuilder.RenameColumn(
                name: "ExamCourseId",
                table: "ReadingExamSets",
                newName: "exam_course_id");

            migrationBuilder.RenameIndex(
                name: "IX_ReadingExamSets_ExamCourseId",
                table: "ReadingExamSets",
                newName: "IX_ReadingExamSets_exam_course_id");

            migrationBuilder.RenameColumn(
                name: "OptionH",
                table: "ReadingExams",
                newName: "option_h");

            migrationBuilder.RenameColumn(
                name: "OptionG",
                table: "ReadingExams",
                newName: "option_g");

            migrationBuilder.RenameColumn(
                name: "OptionF",
                table: "ReadingExams",
                newName: "option_f");

            migrationBuilder.RenameColumn(
                name: "OptionE",
                table: "ReadingExams",
                newName: "option_e");

            migrationBuilder.RenameColumn(
                name: "ListeningImage",
                table: "ListeningExamSets",
                newName: "listening_image");

            migrationBuilder.RenameColumn(
                name: "ExamCourseId",
                table: "ListeningExamSets",
                newName: "exam_course_id");

            migrationBuilder.RenameIndex(
                name: "IX_ListeningExamSets_ExamCourseId",
                table: "ListeningExamSets",
                newName: "IX_ListeningExamSets_exam_course_id");

            migrationBuilder.RenameColumn(
                name: "OptionH",
                table: "ListeningExams",
                newName: "option_h");

            migrationBuilder.RenameColumn(
                name: "OptionG",
                table: "ListeningExams",
                newName: "option_g");

            migrationBuilder.RenameColumn(
                name: "OptionF",
                table: "ListeningExams",
                newName: "option_f");

            migrationBuilder.RenameColumn(
                name: "OptionE",
                table: "ListeningExams",
                newName: "option_e");

            migrationBuilder.AlterColumn<string>(
                name: "exam_type",
                table: "Submissions",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExamCourseId1",
                table: "Submissions",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "reading_image",
                table: "ReadingExamSets",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "option_h",
                table: "ReadingExams",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "option_g",
                table: "ReadingExams",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "option_f",
                table: "ReadingExams",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "option_e",
                table: "ReadingExams",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "listening_image",
                table: "ListeningExamSets",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "option_h",
                table: "ListeningExams",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "option_g",
                table: "ListeningExams",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "option_f",
                table: "ListeningExams",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "option_e",
                table: "ListeningExams",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_ExamCourseId1",
                table: "Submissions",
                column: "ExamCourseId1");

            migrationBuilder.AddForeignKey(
                name: "FK__ListeninE__exam___4E88ABD4",
                table: "ListeningExamSets",
                column: "exam_course_id",
                principalTable: "ExamCourse",
                principalColumn: "ExamCourseId");

            migrationBuilder.AddForeignKey(
                name: "FK__ReadingEx__exam___4AB81AF0",
                table: "ReadingExamSets",
                column: "exam_course_id",
                principalTable: "ExamCourse",
                principalColumn: "ExamCourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Submissions_ExamCourse_ExamCourseId1",
                table: "Submissions",
                column: "ExamCourseId1",
                principalTable: "ExamCourse",
                principalColumn: "ExamCourseId");

            migrationBuilder.AddForeignKey(
                name: "FK__Submissio__exam___5AEE82B9",
                table: "Submissions",
                column: "exam_course_id",
                principalTable: "ExamCourse",
                principalColumn: "ExamCourseId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__ListeninE__exam___4E88ABD4",
                table: "ListeningExamSets");

            migrationBuilder.DropForeignKey(
                name: "FK__ReadingEx__exam___4AB81AF0",
                table: "ReadingExamSets");

            migrationBuilder.DropForeignKey(
                name: "FK_Submissions_ExamCourse_ExamCourseId1",
                table: "Submissions");

            migrationBuilder.DropForeignKey(
                name: "FK__Submissio__exam___5AEE82B9",
                table: "Submissions");

            migrationBuilder.DropIndex(
                name: "IX_Submissions_ExamCourseId1",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "ExamCourseId1",
                table: "Submissions");

            migrationBuilder.RenameColumn(
                name: "answers",
                table: "Submissions",
                newName: "Answers");

            migrationBuilder.RenameColumn(
                name: "total_word_count",
                table: "Submissions",
                newName: "TotalWordCount");

            migrationBuilder.RenameColumn(
                name: "time_spent",
                table: "Submissions",
                newName: "TimeSpent");

            migrationBuilder.RenameColumn(
                name: "exam_type",
                table: "Submissions",
                newName: "ExamType");

            migrationBuilder.RenameColumn(
                name: "exam_id",
                table: "Submissions",
                newName: "ExamId");

            migrationBuilder.RenameColumn(
                name: "exam_course_id",
                table: "Submissions",
                newName: "ExamCourseId");

            migrationBuilder.RenameColumn(
                name: "ai_task_achievement_score",
                table: "Submissions",
                newName: "AiTaskAchievementScore");

            migrationBuilder.RenameColumn(
                name: "ai_task_achievement_feedback",
                table: "Submissions",
                newName: "AiTaskAchievementFeedback");

            migrationBuilder.RenameColumn(
                name: "ai_lexical_resource_score",
                table: "Submissions",
                newName: "AiLexicalResourceScore");

            migrationBuilder.RenameColumn(
                name: "ai_lexical_resource_feedback",
                table: "Submissions",
                newName: "AiLexicalResourceFeedback");

            migrationBuilder.RenameColumn(
                name: "ai_grammatical_range_score",
                table: "Submissions",
                newName: "AiGrammaticalRangeScore");

            migrationBuilder.RenameColumn(
                name: "ai_grammatical_range_feedback",
                table: "Submissions",
                newName: "AiGrammaticalRangeFeedback");

            migrationBuilder.RenameColumn(
                name: "ai_general_feedback",
                table: "Submissions",
                newName: "AiGeneralFeedback");

            migrationBuilder.RenameColumn(
                name: "ai_coherence_cohesion_score",
                table: "Submissions",
                newName: "AiCoherenceCohesionScore");

            migrationBuilder.RenameColumn(
                name: "ai_coherence_cohesion_feedback",
                table: "Submissions",
                newName: "AiCoherenceCohesionFeedback");

            migrationBuilder.RenameIndex(
                name: "IX_Submissions_exam_course_id",
                table: "Submissions",
                newName: "IX_Submissions_ExamCourseId");

            migrationBuilder.RenameColumn(
                name: "reading_image",
                table: "ReadingExamSets",
                newName: "ReadingImage");

            migrationBuilder.RenameColumn(
                name: "reading_context",
                table: "ReadingExamSets",
                newName: "ReadingContext");

            migrationBuilder.RenameColumn(
                name: "exam_course_id",
                table: "ReadingExamSets",
                newName: "ExamCourseId");

            migrationBuilder.RenameIndex(
                name: "IX_ReadingExamSets_exam_course_id",
                table: "ReadingExamSets",
                newName: "IX_ReadingExamSets_ExamCourseId");

            migrationBuilder.RenameColumn(
                name: "option_h",
                table: "ReadingExams",
                newName: "OptionH");

            migrationBuilder.RenameColumn(
                name: "option_g",
                table: "ReadingExams",
                newName: "OptionG");

            migrationBuilder.RenameColumn(
                name: "option_f",
                table: "ReadingExams",
                newName: "OptionF");

            migrationBuilder.RenameColumn(
                name: "option_e",
                table: "ReadingExams",
                newName: "OptionE");

            migrationBuilder.RenameColumn(
                name: "listening_image",
                table: "ListeningExamSets",
                newName: "ListeningImage");

            migrationBuilder.RenameColumn(
                name: "exam_course_id",
                table: "ListeningExamSets",
                newName: "ExamCourseId");

            migrationBuilder.RenameIndex(
                name: "IX_ListeningExamSets_exam_course_id",
                table: "ListeningExamSets",
                newName: "IX_ListeningExamSets_ExamCourseId");

            migrationBuilder.RenameColumn(
                name: "option_h",
                table: "ListeningExams",
                newName: "OptionH");

            migrationBuilder.RenameColumn(
                name: "option_g",
                table: "ListeningExams",
                newName: "OptionG");

            migrationBuilder.RenameColumn(
                name: "option_f",
                table: "ListeningExams",
                newName: "OptionF");

            migrationBuilder.RenameColumn(
                name: "option_e",
                table: "ListeningExams",
                newName: "OptionE");

            migrationBuilder.AlterColumn<string>(
                name: "ExamType",
                table: "Submissions",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ReadingImage",
                table: "ReadingExamSets",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "OptionH",
                table: "ReadingExams",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "OptionG",
                table: "ReadingExams",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "OptionF",
                table: "ReadingExams",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "OptionE",
                table: "ReadingExams",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ListeningImage",
                table: "ListeningExamSets",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "OptionH",
                table: "ListeningExams",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "OptionG",
                table: "ListeningExams",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "OptionF",
                table: "ListeningExams",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "OptionE",
                table: "ListeningExams",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ListeningExamSets_ExamCourse_ExamCourseId",
                table: "ListeningExamSets",
                column: "ExamCourseId",
                principalTable: "ExamCourse",
                principalColumn: "ExamCourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_ReadingExamSets_ExamCourse_ExamCourseId",
                table: "ReadingExamSets",
                column: "ExamCourseId",
                principalTable: "ExamCourse",
                principalColumn: "ExamCourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Submissions_ExamCourse_ExamCourseId",
                table: "Submissions",
                column: "ExamCourseId",
                principalTable: "ExamCourse",
                principalColumn: "ExamCourseId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
