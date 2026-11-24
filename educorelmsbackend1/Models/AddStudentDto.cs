namespace educorelmsbackend.Models
{
    public class AddStudentDto
    {
        public required string StudentNumber { get; set; }
        public required string Name { get; set; }
        public required string Surname { get; set; }
        public required string Gender { get; set; }
        public required DateTime DateOfBirth { get; set; }
        public required string HomeAddress { get; set; }
        public required string EmailAddress { get; set; }
        public string? PhoneNumber { get; set; }

        // Optional initial course assignment
        public Guid? CourseId { get; set; }
    }
}
