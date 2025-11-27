using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddInsightsAndAlerts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AlertRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    City = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    PlaceCode = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    ConditionType = table.Column<int>(type: "INTEGER", nullable: false),
                    ThresholdC = table.Column<double>(type: "REAL", nullable: false),
                    Active = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastTriggeredAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DailyCityInsights",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    City = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Views = table.Column<int>(type: "INTEGER", nullable: false),
                    AverageTemperatureC = table.Column<double>(type: "REAL", nullable: true),
                    MaxTemperatureC = table.Column<double>(type: "REAL", nullable: true),
                    MinTemperatureC = table.Column<double>(type: "REAL", nullable: true),
                    GeneratedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyCityInsights", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AlertDeliveries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AlertRuleId = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    AttemptedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ErrorMessage = table.Column<string>(type: "TEXT", nullable: true),
                    Payload = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertDeliveries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlertDeliveries_AlertRules_AlertRuleId",
                        column: x => x.AlertRuleId,
                        principalTable: "AlertRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AlertDeliveries_AlertRuleId",
                table: "AlertDeliveries",
                column: "AlertRuleId");

            migrationBuilder.CreateIndex(
                name: "IX_AlertRules_UserId_PlaceCode_ConditionType_ThresholdC_Active",
                table: "AlertRules",
                columns: new[] { "UserId", "PlaceCode", "ConditionType", "ThresholdC", "Active" });

            migrationBuilder.CreateIndex(
                name: "IX_DailyCityInsights_UserId_City_Date",
                table: "DailyCityInsights",
                columns: new[] { "UserId", "City", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DailyCityInsights_UserId_Date",
                table: "DailyCityInsights",
                columns: new[] { "UserId", "Date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlertDeliveries");

            migrationBuilder.DropTable(
                name: "DailyCityInsights");

            migrationBuilder.DropTable(
                name: "AlertRules");
        }
    }
}
