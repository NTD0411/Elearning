using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebRtcApi.Migrations
{
    /// <inheritdoc />
    public partial class delSubmitRela : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__Submissio__liste__5AEE82B9",
                table: "Submissions");

            migrationBuilder.DropForeignKey(
                name: "FK__Submissio__readi__59FA5E80",
                table: "Submissions");

            migrationBuilder.DropForeignKey(
                name: "FK__Submissio__speak__5CD6CB2B",
                table: "Submissions");

            migrationBuilder.DropForeignKey(
                name: "FK__Submissio__writi__5BE2A6F2",
                table: "Submissions");

            migrationBuilder.DropIndex(
                name: "IX_Submissions_listening_exam_set_id",
                table: "Submissions");

            migrationBuilder.DropIndex(
                name: "IX_Submissions_reading_exam_set_id",
                table: "Submissions");

            migrationBuilder.DropIndex(
                name: "IX_Submissions_speaking_exam_set_id",
                table: "Submissions");

            migrationBuilder.DropIndex(
                name: "IX_Submissions_writing_exam_set_id",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "listening_exam_set_id",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "reading_exam_set_id",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "speaking_exam_set_id",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "writing_exam_set_id",
                table: "Submissions");

            migrationBuilder.AddColumn<int>(
                name: "ExamCourseId",
                table: "Submissions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_ExamCourseId",
                table: "Submissions",
                column: "ExamCourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Submissions_ExamCourse_ExamCourseId",
                table: "Submissions",
                column: "ExamCourseId",
                principalTable: "ExamCourse",
                principalColumn: "ExamCourseId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Submissions_ExamCourse_ExamCourseId",
                table: "Submissions");

            migrationBuilder.DropIndex(
                name: "IX_Submissions_ExamCourseId",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "ExamCourseId",
                table: "Submissions");

            migrationBuilder.AddColumn<int>(
                name: "listening_exam_set_id",
                table: "Submissions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "reading_exam_set_id",
                table: "Submissions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "speaking_exam_set_id",
                table: "Submissions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "writing_exam_set_id",
                table: "Submissions",
                type: "int",
                nullable: true);

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
                name: "IX_Submissions_writing_exam_set_id",
                table: "Submissions",
                column: "writing_exam_set_id");

            migrationBuilder.AddForeignKey(
                name: "FK__Submissio__liste__5AEE82B9",
                table: "Submissions",
                column: "listening_exam_set_id",
                principalTable: "ListeningExamSets",
                principalColumn: "exam_set_id");

            migrationBuilder.AddForeignKey(
                name: "FK__Submissio__readi__59FA5E80",
                table: "Submissions",
                column: "reading_exam_set_id",
                principalTable: "ReadingExamSets",
                principalColumn: "exam_set_id");

            migrationBuilder.AddForeignKey(
                name: "FK__Submissio__speak__5CD6CB2B",
                table: "Submissions",
                column: "speaking_exam_set_id",
                principalTable: "SpeakingExamSets",
                principalColumn: "exam_set_id");

            migrationBuilder.AddForeignKey(
                name: "FK__Submissio__writi__5BE2A6F2",
                table: "Submissions",
                column: "writing_exam_set_id",
                principalTable: "WritingExamSets",
                principalColumn: "exam_set_id");
        }
    }
}
