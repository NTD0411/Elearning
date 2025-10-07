using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebRtcApi.Migrations
{
    /// <inheritdoc />
    public partial class AddExamCourseExamSetJunctionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExamCourseExamSets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExamCourseId = table.Column<int>(type: "int", nullable: false),
                    ExamSetId = table.Column<int>(type: "int", nullable: false),
                    ExamSetType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamCourseExamSets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExamCourseExamSets_ExamCourse_ExamCourseId",
                        column: x => x.ExamCourseId,
                        principalTable: "ExamCourse",
                        principalColumn: "ExamCourseId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExamCourseExamSets_ExamCourseId",
                table: "ExamCourseExamSets",
                column: "ExamCourseId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExamCourseExamSets");
        }
    }
}
