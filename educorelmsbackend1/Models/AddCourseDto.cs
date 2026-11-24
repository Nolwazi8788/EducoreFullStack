namespace educorelmsbackend.Models
{
    public class AddCourseDto
    {
        public required string Name { get; set; }
        public required string Faculty { get; set; }
        public required Guid LecturerId { get; set; }
    }
}