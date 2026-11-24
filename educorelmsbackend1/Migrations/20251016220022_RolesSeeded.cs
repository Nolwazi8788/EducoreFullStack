using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace educorelmsbackend.Migrations
{
    /// <inheritdoc />
    public partial class RolesSeeded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "23eccd33-4440-4f35-8835-6619db48a842", "3", "Student", "Student" },
                    { "48149735-dc9b-4f91-9986-dd84f0a8a733", "1", "Admin", "Admin" },
                    { "f4ce65a9-fca6-4375-b2cc-e76f4c67b95e", "2", "Lecturer", "Lecturer" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "23eccd33-4440-4f35-8835-6619db48a842");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "48149735-dc9b-4f91-9986-dd84f0a8a733");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "f4ce65a9-fca6-4375-b2cc-e76f4c67b95e");
        }
    }
}
