using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCaseDocumentConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CaseDocuments_Users_UploadedById",
                table: "CaseDocuments");

            migrationBuilder.AlterColumn<string>(
                name: "StoragePath",
                table: "CaseDocuments",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "FileName",
                table: "CaseDocuments",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "CaseDocuments",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ContentType",
                table: "CaseDocuments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "AiSummary",
                table: "CaseDocuments",
                type: "character varying(10000)",
                maxLength: 10000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OriginalFileName",
                table: "CaseDocuments",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "CaseDocuments",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CaseDocuments_UserId",
                table: "CaseDocuments",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CaseDocuments_Users_UploadedById",
                table: "CaseDocuments",
                column: "UploadedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CaseDocuments_Users_UserId",
                table: "CaseDocuments",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CaseDocuments_Users_UploadedById",
                table: "CaseDocuments");

            migrationBuilder.DropForeignKey(
                name: "FK_CaseDocuments_Users_UserId",
                table: "CaseDocuments");

            migrationBuilder.DropIndex(
                name: "IX_CaseDocuments_UserId",
                table: "CaseDocuments");

            migrationBuilder.DropColumn(
                name: "OriginalFileName",
                table: "CaseDocuments");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "CaseDocuments");

            migrationBuilder.AlterColumn<string>(
                name: "StoragePath",
                table: "CaseDocuments",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000);

            migrationBuilder.AlterColumn<string>(
                name: "FileName",
                table: "CaseDocuments",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "CaseDocuments",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ContentType",
                table: "CaseDocuments",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "AiSummary",
                table: "CaseDocuments",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(10000)",
                oldMaxLength: 10000,
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CaseDocuments_Users_UploadedById",
                table: "CaseDocuments",
                column: "UploadedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
