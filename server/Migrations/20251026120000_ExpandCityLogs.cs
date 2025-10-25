using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class ExpandCityLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Conditions",
                table: "CityLogs",
                type: "TEXT",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "FeelsLikeC",
                table: "CityLogs",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TemperatureC",
                table: "CityLogs",
                type: "REAL",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CityLogs_UserId_City",
                table: "CityLogs",
                columns: new[] { "UserId", "City" });

            migrationBuilder.CreateIndex(
                name: "IX_CityLogs_UserId_Timestamp",
                table: "CityLogs",
                columns: new[] { "UserId", "Timestamp" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CityLogs_UserId_City",
                table: "CityLogs");

            migrationBuilder.DropIndex(
                name: "IX_CityLogs_UserId_Timestamp",
                table: "CityLogs");

            migrationBuilder.DropColumn(
                name: "Conditions",
                table: "CityLogs");

            migrationBuilder.DropColumn(
                name: "FeelsLikeC",
                table: "CityLogs");

            migrationBuilder.DropColumn(
                name: "TemperatureC",
                table: "CityLogs");
        }
    }
}
