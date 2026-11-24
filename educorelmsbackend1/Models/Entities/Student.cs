using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educorelmsbackend.Models.Entities
{
    public class Student
    {
        [Key]
        public Guid StudentId { get; set; }
        public required string StudentNumber { get; set; }
        public required string Name { get; set; }
        public required string Surname { get; set; }
        public required string Gender { get; set; }
        public required DateTime DateOfBirth { get; set; }
        public required string HomeAddress { get; set; }
        public required string EmailAddress { get; set; }
        public string? PhoneNumber { get; set; }

        // Foreign Key to Course (One Course - Many Students)
        // Made nullable so a student can exist without being assigned to a course.
        public Guid? CourseId { get; set; }
        public Course? Course { get; set; }
    }
}