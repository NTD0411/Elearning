using Microsoft.EntityFrameworkCore.Migrations;

namespace WebRtcApi.Migrations
{
    public partial class AddExamSetIdToSpeakingExams : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ExamSetId",
                table: "SpeakingExams",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_SpeakingExams_ExamSetId",
                table: "SpeakingExams",
                column: "ExamSetId");

            migrationBuilder.AddForeignKey(
                name: "FK_SpeakingExams_ExamSets_ExamSetId",
                table: "SpeakingExams",
                column: "ExamSetId",
                principalTable: "ExamSets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SpeakingExams_ExamSets_ExamSetId",
                table: "SpeakingExams");

            migrationBuilder.DropIndex(
                name: "IX_SpeakingExams_ExamSetId",
                table: "SpeakingExams");

            migrationBuilder.DropColumn(
                name: "ExamSetId",
                table: "SpeakingExams");
        }
    }
}