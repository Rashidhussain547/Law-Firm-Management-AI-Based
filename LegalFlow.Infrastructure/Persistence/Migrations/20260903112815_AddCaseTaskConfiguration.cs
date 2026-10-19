using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCaseTaskConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CaseTasks_Users_AssignedToId",
                table: "CaseTasks");

            migrationBuilder.DropIndex(
                name: "IX_CaseTasks_AssignedToId",
                table: "CaseTasks");

            migrationBuilder.DropIndex(
                name: "IX_CaseTasks_CaseId",
                table: "CaseTasks");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "CaseTasks",
                type: "character varying(250)",
                maxLength: 250,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "CaseTasks",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "CaseTasks",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CaseTasks_AssignedToId_Status",
                table: "CaseTasks",
                columns: new[] { "AssignedToId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_CaseTasks_CaseId_DueDate",
                table: "CaseTasks",
                columns: new[] { "CaseId", "DueDate" });

            migrationBuilder.CreateIndex(
                name: "IX_CaseTasks_UserId",
                table: "CaseTasks",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CaseTasks_Users_AssignedToId",
                table: "CaseTasks",
                column: "AssignedToId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CaseTasks_Users_UserId",
                table: "CaseTasks",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CaseTasks_Users_AssignedToId",
                table: "CaseTasks");

            migrationBuilder.DropForeignKey(
                name: "FK_CaseTasks_Users_UserId",
                table: "CaseTasks");

            migrationBuilder.DropIndex(
                name: "IX_CaseTasks_AssignedToId_Status",
                table: "CaseTasks");

            migrationBuilder.DropIndex(
                name: "IX_CaseTasks_CaseId_DueDate",
                table: "CaseTasks");

            migrationBuilder.DropIndex(
                name: "IX_CaseTasks_UserId",
                table: "CaseTasks");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "CaseTasks");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "CaseTasks",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(250)",
                oldMaxLength: 250);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "CaseTasks",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(5000)",
                oldMaxLength: 5000,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CaseTasks_AssignedToId",
                table: "CaseTasks",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_CaseTasks_CaseId",
                table: "CaseTasks",
                column: "CaseId");

            migrationBuilder.AddForeignKey(
                name: "FK_CaseTasks_Users_AssignedToId",
                table: "CaseTasks",
                column: "AssignedToId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
