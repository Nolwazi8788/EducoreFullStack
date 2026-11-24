using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace educorelmsbackend.Migrations
{
    /// <inheritdoc />
    public partial class latestupdatedmigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "3ea97c77-f1ac-4183-994b-d2e676a7fee7");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "6965de44-daff-47ae-8ca6-1bd58ea01001");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "8bc73ab8-dbd9-4fa6-aa5c-19bfbffaa16e");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "5afc421f-f342-4d09-8484-4ed86232660f", "2", "Lecturer", "Lecturer" },
                    { "b4b15fb4-ed08-4d54-82f2-3d6ef1594b52", "3", "Student", "Student" },
                    { "e5413816-0150-4b0a-980f-d41349d91bb5", "1", "Admin", "Admin" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "5afc421f-f342-4d09-8484-4ed86232660f");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "b4b15fb4-ed08-4d54-82f2-3d6ef1594b52");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "e5413816-0150-4b0a-980f-d41349d91bb5");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "3ea97c77-f1ac-4183-994b-d2e676a7fee7", "1", "Admin", "Admin" },
                    { "6965de44-daff-47ae-8ca6-1bd58ea01001", "2", "Lecturer", "Lecturer" },
                    { "8bc73ab8-dbd9-4fa6-aa5c-19bfbffaa16e", "3", "Student", "Student" }
                });
        }
    }
}
