using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCaseAssignedAssistant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cases_Users_AssignedLawyerId",
                table: "Cases");

            migrationBuilder.AddColumn<Guid>(
                name: "AssignedAssistantId",
                table: "Cases",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Cases",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cases_AssignedAssistantId",
                table: "Cases",
                column: "AssignedAssistantId");

            migrationBuilder.CreateIndex(
                name: "IX_Cases_UserId",
                table: "Cases",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cases_Users_AssignedAssistantId",
                table: "Cases",
                column: "AssignedAssistantId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Cases_Users_AssignedLawyerId",
                table: "Cases",
                column: "AssignedLawyerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Cases_Users_UserId",
                table: "Cases",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cases_Users_AssignedAssistantId",
                table: "Cases");

            migrationBuilder.DropForeignKey(
                name: "FK_Cases_Users_AssignedLawyerId",
                table: "Cases");

            migrationBuilder.DropForeignKey(
                name: "FK_Cases_Users_UserId",
                table: "Cases");

            migrationBuilder.DropIndex(
                name: "IX_Cases_AssignedAssistantId",
                table: "Cases");

            migrationBuilder.DropIndex(
                name: "IX_Cases_UserId",
                table: "Cases");

            migrationBuilder.DropColumn(
                name: "AssignedAssistantId",
                table: "Cases");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Cases");

            migrationBuilder.AddForeignKey(
                name: "FK_Cases_Users_AssignedLawyerId",
                table: "Cases",
                column: "AssignedLawyerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
