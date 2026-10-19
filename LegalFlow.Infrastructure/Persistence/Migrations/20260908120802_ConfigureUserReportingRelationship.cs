using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureUserReportingRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Users_ReportsToUserId",
                table: "Users");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Users_ReportsToUserId",
                table: "Users",
                column: "ReportsToUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Users_ReportsToUserId",
                table: "Users");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Users_ReportsToUserId",
                table: "Users",
                column: "ReportsToUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
