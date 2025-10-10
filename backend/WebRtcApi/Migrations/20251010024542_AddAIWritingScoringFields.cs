using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebRtcApi.Migrations
{
    /// <inheritdoc />
    public partial class AddAIWritingScoringFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AiCoherenceCohesionFeedback",
                table: "Submissions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AiCoherenceCohesionScore",
                table: "Submissions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiGeneralFeedback",
                table: "Submissions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiGrammaticalRangeFeedback",
                table: "Submissions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AiGrammaticalRangeScore",
                table: "Submissions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiLexicalResourceFeedback",
                table: "Submissions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AiLexicalResourceScore",
                table: "Submissions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiTaskAchievementFeedback",
                table: "Submissions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AiTaskAchievementScore",
                table: "Submissions",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiCoherenceCohesionFeedback",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "AiCoherenceCohesionScore",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "AiGeneralFeedback",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "AiGrammaticalRangeFeedback",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "AiGrammaticalRangeScore",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "AiLexicalResourceFeedback",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "AiLexicalResourceScore",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "AiTaskAchievementFeedback",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "AiTaskAchievementScore",
                table: "Submissions");
        }
    }
}
