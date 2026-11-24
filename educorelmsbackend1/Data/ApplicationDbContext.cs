using System.Reflection.Emit;
using System.Xml.Linq;
using educorelmsbackend.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace educorelmsbackend.Data
{
    public class ApplicationDbContext : IdentityDbContext<IdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }
        public DbSet<Lecturer> Lecturers { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Module> Modules { get; set; }
        public DbSet<ModuleTask> Tasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            SeedRoles(modelBuilder);

            // One Lecturer - Many Courses
            modelBuilder.Entity<Course>().HasOne(c => c.Lecturer).WithMany(l => l.Courses).HasForeignKey(c => c.LecturerId);

            // One Course - Many Modules
            modelBuilder.Entity<Module>().HasOne(m => m.Course).WithMany(c => c.Modules).HasForeignKey(m => m.CourseId);

            // One Course - Many Students
            modelBuilder.Entity<Student>().HasOne(s => s.Course).WithMany(c => c.Students).HasForeignKey(s => s.CourseId);

            // One Module - Many Tasks
            modelBuilder.Entity<ModuleTask>().HasOne(t => t.Module).WithMany(m => m.Tasks).HasForeignKey(t => t.ModuleId);

        }

        private void SeedRoles(ModelBuilder builder)
        {
            builder.Entity<IdentityRole>().HasData
                (
                new IdentityRole() { Name = "Admin", ConcurrencyStamp = "1", NormalizedName = "Admin" },
                new IdentityRole() { Name = "Lecturer", ConcurrencyStamp = "2", NormalizedName = "Lecturer" },
                new IdentityRole() { Name = "Student", ConcurrencyStamp = "3", NormalizedName = "Student" }
                );
        }
    }
}
