using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebRtcApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSubmissionForWritingExam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Answers",
                table: "Submissions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExamId",
                table: "Submissions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExamType",
                table: "Submissions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TimeSpent",
                table: "Submissions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalWordCount",
                table: "Submissions",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Answers",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "ExamId",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "ExamType",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "TimeSpent",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "TotalWordCount",
                table: "Submissions");
        }
    }
}
