using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUserReportingRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ReportsToUserId",
                table: "Users",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_ReportsToUserId",
                table: "Users",
                column: "ReportsToUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Users_ReportsToUserId",
                table: "Users",
                column: "ReportsToUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Users_ReportsToUserId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_ReportsToUserId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ReportsToUserId",
                table: "Users");
        }
    }
}
