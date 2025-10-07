using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebRtcApi.Migrations
{
    /// <inheritdoc />
    public partial class changeattri : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReadingContext",
                table: "ReadingExams");

            migrationBuilder.DropColumn(
                name: "ReadingImage",
                table: "ReadingExams");

            migrationBuilder.DropColumn(
                name: "ListeningImage",
                table: "ListeningExams");

            migrationBuilder.AddColumn<string>(
                name: "ReadingContext",
                table: "ReadingExamSets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReadingImage",
                table: "ReadingExamSets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ListeningImage",
                table: "ListeningExamSets",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReadingContext",
                table: "ReadingExamSets");

            migrationBuilder.DropColumn(
                name: "ReadingImage",
                table: "ReadingExamSets");

            migrationBuilder.DropColumn(
                name: "ListeningImage",
                table: "ListeningExamSets");

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

            migrationBuilder.AddColumn<string>(
                name: "ListeningImage",
                table: "ListeningExams",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
