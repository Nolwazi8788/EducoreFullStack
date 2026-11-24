using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educorelmsbackend.Models.Entities
{
    public class Module
    {
        [Key]
        public Guid ModuleId { get; set; }
        public required string Name { get; set; }
        public required string ModuleCode { get; set; }

        [ForeignKey("Course")]  // Foreign Key to Course (One Course - Many Modules)
        public Guid CourseId { get; set; }
        public Course Course { get; set; }


        // One Module - Many Tasks
        public ICollection<ModuleTask> Tasks { get; set; } = new List<ModuleTask>();
    }
}
