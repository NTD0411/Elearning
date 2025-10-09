using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebRtcApi.Migrations
{
    /// <inheritdoc />
    public partial class addExamCourse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ExamCourseId",
                table: "WritingExamSets",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExamCourseId",
                table: "SpeakingExamSets",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExamCourseId",
                table: "ReadingExamSets",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OptionE",
                table: "ReadingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OptionF",
                table: "ReadingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OptionG",
                table: "ReadingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OptionH",
                table: "ReadingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReadingContext",
                table: "ReadingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReadingImage",
                table: "ReadingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExamCourseId",
                table: "ListeningExamSets",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ListeningImage",
                table: "ListeningExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OptionE",
                table: "ListeningExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OptionF",
                table: "ListeningExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OptionG",
                table: "ListeningExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OptionH",
                table: "ListeningExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ExamCourse",
                columns: table => new
                {
                    ExamCourseId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CourseCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExamType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamCourse", x => x.ExamCourseId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WritingExamSets_ExamCourseId",
                table: "WritingExamSets",
                column: "ExamCourseId");

            migrationBuilder.CreateIndex(
                name: "IX_SpeakingExamSets_ExamCourseId",
                table: "SpeakingExamSets",
                column: "ExamCourseId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingExamSets_ExamCourseId",
                table: "ReadingExamSets",
                column: "ExamCourseId");

            migrationBuilder.CreateIndex(
                name: "IX_ListeningExamSets_ExamCourseId",
                table: "ListeningExamSets",
                column: "ExamCourseId");

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
                name: "FK_SpeakingExamSets_ExamCourse_ExamCourseId",
                table: "SpeakingExamSets",
                column: "ExamCourseId",
                principalTable: "ExamCourse",
                principalColumn: "ExamCourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_WritingExamSets_ExamCourse_ExamCourseId",
                table: "WritingExamSets",
                column: "ExamCourseId",
                principalTable: "ExamCourse",
                principalColumn: "ExamCourseId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListeningExamSets_ExamCourse_ExamCourseId",
                table: "ListeningExamSets");

            migrationBuilder.DropForeignKey(
                name: "FK_ReadingExamSets_ExamCourse_ExamCourseId",
                table: "ReadingExamSets");

            migrationBuilder.DropForeignKey(
                name: "FK_SpeakingExamSets_ExamCourse_ExamCourseId",
                table: "SpeakingExamSets");

            migrationBuilder.DropForeignKey(
                name: "FK_WritingExamSets_ExamCourse_ExamCourseId",
                table: "WritingExamSets");

            migrationBuilder.DropTable(
                name: "ExamCourse");

            migrationBuilder.DropIndex(
                name: "IX_WritingExamSets_ExamCourseId",
                table: "WritingExamSets");

            migrationBuilder.DropIndex(
                name: "IX_SpeakingExamSets_ExamCourseId",
                table: "SpeakingExamSets");

            migrationBuilder.DropIndex(
                name: "IX_ReadingExamSets_ExamCourseId",
                table: "ReadingExamSets");

            migrationBuilder.DropIndex(
                name: "IX_ListeningExamSets_ExamCourseId",
                table: "ListeningExamSets");

            migrationBuilder.DropColumn(
                name: "ExamCourseId",
                table: "WritingExamSets");

            migrationBuilder.DropColumn(
                name: "ExamCourseId",
                table: "SpeakingExamSets");

            migrationBuilder.DropColumn(
                name: "ExamCourseId",
                table: "ReadingExamSets");

            migrationBuilder.DropColumn(
                name: "OptionE",
                table: "ReadingExams");

            migrationBuilder.DropColumn(
                name: "OptionF",
                table: "ReadingExams");

            migrationBuilder.DropColumn(
                name: "OptionG",
                table: "ReadingExams");

            migrationBuilder.DropColumn(
                name: "OptionH",
                table: "ReadingExams");

            migrationBuilder.DropColumn(
                name: "ReadingContext",
                table: "ReadingExams");

            migrationBuilder.DropColumn(
                name: "ReadingImage",
                table: "ReadingExams");

            migrationBuilder.DropColumn(
                name: "ExamCourseId",
                table: "ListeningExamSets");

            migrationBuilder.DropColumn(
                name: "ListeningImage",
                table: "ListeningExams");

            migrationBuilder.DropColumn(
                name: "OptionE",
                table: "ListeningExams");

            migrationBuilder.DropColumn(
                name: "OptionF",
                table: "ListeningExams");

            migrationBuilder.DropColumn(
                name: "OptionG",
                table: "ListeningExams");

            migrationBuilder.DropColumn(
                name: "OptionH",
                table: "ListeningExams");
        }
    }
}
