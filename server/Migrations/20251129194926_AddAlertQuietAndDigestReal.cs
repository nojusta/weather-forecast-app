using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddAlertQuietAndDigestReal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "DigestEnabled",
                table: "AlertRules",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "QuietHoursEnd",
                table: "AlertRules",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QuietHoursStart",
                table: "AlertRules",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DigestBatchDate",
                table: "AlertDeliveries",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DigestEnabled",
                table: "AlertRules");

            migrationBuilder.DropColumn(
                name: "QuietHoursEnd",
                table: "AlertRules");

            migrationBuilder.DropColumn(
                name: "QuietHoursStart",
                table: "AlertRules");

            migrationBuilder.DropColumn(
                name: "DigestBatchDate",
                table: "AlertDeliveries");
        }
    }
}
