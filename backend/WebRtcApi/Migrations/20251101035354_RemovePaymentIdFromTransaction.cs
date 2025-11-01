using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebRtcApi.Migrations
{
    /// <inheritdoc />
    public partial class RemovePaymentIdFromTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentId",
                table: "Transactions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentId",
                table: "Transactions",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
