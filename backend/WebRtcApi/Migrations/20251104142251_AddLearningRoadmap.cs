using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebRtcApi.Migrations
{
    /// <inheritdoc />
    public partial class AddLearningRoadmap : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LearningGoals",
                columns: table => new
                {
                    LearningGoalId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    GoalTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TargetBand = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FocusSkill = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TargetDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CurrentBand = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProgressPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CompletedExams = table.Column<int>(type: "int", nullable: false),
                    TotalExamsRequired = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AiGeneratedPlan = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningGoals", x => x.LearningGoalId);
                    table.ForeignKey(
                        name: "FK_LearningGoals_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoadmapSteps",
                columns: table => new
                {
                    RoadmapStepId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LearningGoalId = table.Column<int>(type: "int", nullable: false),
                    StepOrder = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SkillType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RecommendedExamSets = table.Column<int>(type: "int", nullable: false),
                    ResourceLinks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Tips = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExamsCompleted = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoadmapSteps", x => x.RoadmapStepId);
                    table.ForeignKey(
                        name: "FK_RoadmapSteps_LearningGoals_LearningGoalId",
                        column: x => x.LearningGoalId,
                        principalTable: "LearningGoals",
                        principalColumn: "LearningGoalId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoadmapCourses",
                columns: table => new
                {
                    RoadmapCourseId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoadmapStepId = table.Column<int>(type: "int", nullable: false),
                    ExamCourseId = table.Column<int>(type: "int", nullable: false),
                    RecommendationOrder = table.Column<int>(type: "int", nullable: false),
                    ReasonForRecommendation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoadmapCourses", x => x.RoadmapCourseId);
                    table.ForeignKey(
                        name: "FK_RoadmapCourses_ExamCourse_ExamCourseId",
                        column: x => x.ExamCourseId,
                        principalTable: "ExamCourse",
                        principalColumn: "ExamCourseId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoadmapCourses_RoadmapSteps_RoadmapStepId",
                        column: x => x.RoadmapStepId,
                        principalTable: "RoadmapSteps",
                        principalColumn: "RoadmapStepId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LearningGoals_UserId",
                table: "LearningGoals",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RoadmapCourses_ExamCourseId",
                table: "RoadmapCourses",
                column: "ExamCourseId");

            migrationBuilder.CreateIndex(
                name: "IX_RoadmapCourses_RoadmapStepId",
                table: "RoadmapCourses",
                column: "RoadmapStepId");

            migrationBuilder.CreateIndex(
                name: "IX_RoadmapSteps_LearningGoalId",
                table: "RoadmapSteps",
                column: "LearningGoalId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RoadmapCourses");

            migrationBuilder.DropTable(
                name: "RoadmapSteps");

            migrationBuilder.DropTable(
                name: "LearningGoals");
        }
    }
}
