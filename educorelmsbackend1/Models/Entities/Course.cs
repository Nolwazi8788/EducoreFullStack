using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educorelmsbackend.Models.Entities
{
    public class Course
    {
        [Key]
        public Guid CourseId { get; set; }
        public required string Name { get; set; }
        public required string Faculty { get; set; }

        // Foreign Key to Lecturer (One Lecturer - Many Courses)
        [ForeignKey("Lecturer")]
        public Guid LecturerId { get; set; }
        public Lecturer Lecturer { get; set; }

        // One Course - Many Modules
        public ICollection<Module> Modules = new List<Module>();

        // One Course - Many Students
        public ICollection<Student> Students { get; set; } = new List<Student>();
    }
}
