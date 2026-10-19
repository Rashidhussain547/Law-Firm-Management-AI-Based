using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCaseNoteConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CaseNotes_Users_CreatedById",
                table: "CaseNotes");

            migrationBuilder.DropIndex(
                name: "IX_CaseNotes_CaseId",
                table: "CaseNotes");

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "CaseNotes",
                type: "character varying(10000)",
                maxLength: 10000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "CaseNotes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CaseNotes_CaseId_CreatedById",
                table: "CaseNotes",
                columns: new[] { "CaseId", "CreatedById" });

            migrationBuilder.CreateIndex(
                name: "IX_CaseNotes_UserId",
                table: "CaseNotes",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CaseNotes_Users_CreatedById",
                table: "CaseNotes",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CaseNotes_Users_UserId",
                table: "CaseNotes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CaseNotes_Users_CreatedById",
                table: "CaseNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_CaseNotes_Users_UserId",
                table: "CaseNotes");

            migrationBuilder.DropIndex(
                name: "IX_CaseNotes_CaseId_CreatedById",
                table: "CaseNotes");

            migrationBuilder.DropIndex(
                name: "IX_CaseNotes_UserId",
                table: "CaseNotes");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "CaseNotes");

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "CaseNotes",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(10000)",
                oldMaxLength: 10000);

            migrationBuilder.CreateIndex(
                name: "IX_CaseNotes_CaseId",
                table: "CaseNotes",
                column: "CaseId");

            migrationBuilder.AddForeignKey(
                name: "FK_CaseNotes_Users_CreatedById",
                table: "CaseNotes",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
