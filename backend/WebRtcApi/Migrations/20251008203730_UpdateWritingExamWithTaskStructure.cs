using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebRtcApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateWritingExamWithTaskStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "WritingExamSets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExamType",
                table: "WritingExamSets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Instructions",
                table: "WritingExamSets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalTimeMinutes",
                table: "WritingExamSets",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Instructions",
                table: "WritingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Task1Description",
                table: "WritingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Task1ImageUrl",
                table: "WritingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Task1MaxTime",
                table: "WritingExams",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Task1MinWords",
                table: "WritingExams",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Task1Requirements",
                table: "WritingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Task1Title",
                table: "WritingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Task2Context",
                table: "WritingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Task2MaxTime",
                table: "WritingExams",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Task2MinWords",
                table: "WritingExams",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Task2Question",
                table: "WritingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Task2Requirements",
                table: "WritingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Task2Title",
                table: "WritingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalTimeMinutes",
                table: "WritingExams",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "WritingExamSets");

            migrationBuilder.DropColumn(
                name: "ExamType",
                table: "WritingExamSets");

            migrationBuilder.DropColumn(
                name: "Instructions",
                table: "WritingExamSets");

            migrationBuilder.DropColumn(
                name: "TotalTimeMinutes",
                table: "WritingExamSets");

            migrationBuilder.DropColumn(
                name: "Instructions",
                table: "WritingExams");

            migrationBuilder.DropColumn(
                name: "Task1Description",
                table: "WritingExams");

            migrationBuilder.DropColumn(
                name: "Task1ImageUrl",
                table: "WritingExams");

            migrationBuilder.DropColumn(
                name: "Task1MaxTime",
                table: "WritingExams");

            migrationBuilder.DropColumn(
                name: "Task1MinWords",
                table: "WritingExams");

            migrationBuilder.DropColumn(
                name: "Task1Requirements",
                table: "WritingExams");

            migrationBuilder.DropColumn(
                name: "Task1Title",
                table: "WritingExams");

            migrationBuilder.DropColumn(
                name: "Task2Context",
                table: "WritingExams");

            migrationBuilder.DropColumn(
                name: "Task2MaxTime",
                table: "WritingExams");

            migrationBuilder.DropColumn(
                name: "Task2MinWords",
                table: "WritingExams");

            migrationBuilder.DropColumn(
                name: "Task2Question",
                table: "WritingExams");

            migrationBuilder.DropColumn(
                name: "Task2Requirements",
                table: "WritingExams");

            migrationBuilder.DropColumn(
                name: "Task2Title",
                table: "WritingExams");

            migrationBuilder.DropColumn(
                name: "TotalTimeMinutes",
                table: "WritingExams");
        }
    }
}
