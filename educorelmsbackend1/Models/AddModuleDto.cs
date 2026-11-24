namespace educorelmsbackend.Models
{
    public class AddModuleDto
    {
        public required string Name { get; set; }
        public required string ModuleCode { get; set; }
        public required Guid CourseId { get; set; }
    }
}
