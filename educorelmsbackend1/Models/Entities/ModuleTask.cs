using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educorelmsbackend.Models.Entities
{
    public class ModuleTask
    {
        [Key]
        public Guid ModuleTaskId { get; set; }
        public required string TaskName { get; set; }
        public required DateTime DueDate { get; set; }

        // Foreign Key to Module (One Module - Many Tasks)
        [ForeignKey("Module")]
        public Guid ModuleId { get; set; }
        public Module Module { get; set; }

        // Task status: Not Started, In Progress, Complete
        public string Status { get; set; } = "Not Started";
    }
}
