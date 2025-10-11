using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebRtcApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSpeakingExamSetRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__SpeakingE__exam___5535A963",
                table: "SpeakingExams");

            migrationBuilder.AlterColumn<int>(
                name: "exam_set_id",
                table: "SpeakingExams",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK__SpeakingE__exam___5535A963",
                table: "SpeakingExams",
                column: "exam_set_id",
                principalTable: "SpeakingExamSets",
                principalColumn: "exam_set_id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__SpeakingE__exam___5535A963",
                table: "SpeakingExams");

            migrationBuilder.AlterColumn<int>(
                name: "exam_set_id",
                table: "SpeakingExams",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK__SpeakingE__exam___5535A963",
                table: "SpeakingExams",
                column: "exam_set_id",
                principalTable: "SpeakingExamSets",
                principalColumn: "exam_set_id");
        }
    }
}
