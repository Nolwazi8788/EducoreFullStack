namespace educorelmsbackend.Models
{
    public class UpdateStudentDto
    {
        public required string StudentNumber { get; set; }
        public required string Name { get; set; }
        public required string Surname { get; set; }
        public required string Gender { get; set; }
        public required DateTime DateOfBirth { get; set; }
        public required string HomeAddress { get; set; }
        public required string EmailAddress { get; set; }
        public string? PhoneNumber { get; set; }

        // Allow changing course via update (optional)
        public Guid? CourseId { get; set; }
    }
}
