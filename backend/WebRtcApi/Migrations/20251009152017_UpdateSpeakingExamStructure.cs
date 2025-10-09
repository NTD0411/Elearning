using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebRtcApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSpeakingExamStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CueCardPrompts",
                table: "SpeakingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CueCardTopic",
                table: "SpeakingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PartNumber",
                table: "SpeakingExams",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PartTitle",
                table: "SpeakingExams",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TimeLimit",
                table: "SpeakingExams",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CueCardPrompts",
                table: "SpeakingExams");

            migrationBuilder.DropColumn(
                name: "CueCardTopic",
                table: "SpeakingExams");

            migrationBuilder.DropColumn(
                name: "PartNumber",
                table: "SpeakingExams");

            migrationBuilder.DropColumn(
                name: "PartTitle",
                table: "SpeakingExams");

            migrationBuilder.DropColumn(
                name: "TimeLimit",
                table: "SpeakingExams");
        }
    }
}
