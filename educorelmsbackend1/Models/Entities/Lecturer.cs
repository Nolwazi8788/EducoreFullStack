using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educorelmsbackend.Models.Entities
{
    public class Lecturer
    {
        [Key]
        public Guid LecturerId { get; set; }
        public required string Name { get; set; }
        public required string Surname { get; set; }
        public required string Gender { get; set; }
        public required DateTime DateOfBirth { get; set; }
        public required string HomeAddress { get; set; }
        public required string EmailAddress { get; set; }
        public required string TelephoneNumber { get; set; }

        // One Lecturer - Many Courses
        public ICollection<Course> Courses { get; set; } = new List<Course>();
    }
}
