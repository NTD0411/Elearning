using Microsoft.EntityFrameworkCore.Migrations;

namespace WebRtcApi.Migrations
{
    public partial class UpdateTransaction : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "payment_id",
                table: "Transactions",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "payment_method",
                table: "Transactions",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "transaction_reference",
                table: "Transactions",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            // Update Status column constraints and default value
            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "Transactions",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "PENDING",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "payment_id",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "payment_method",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "transaction_reference",
                table: "Transactions");

            // Revert Status column changes
            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "Transactions",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: false,
                oldDefaultValue: "PENDING");
        }
    }
}