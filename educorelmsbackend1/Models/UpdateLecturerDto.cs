namespace educorelmsbackend.Models
{
    public class UpdateLecturerDto
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public required string Surname { get; set; }
        public required string Gender { get; set; }
        public required DateTime DateOfBirth { get; set; }
        public required string HomeAddress { get; set; }
        public required string EmailAddress { get; set; }
        public required string TelephoneNumber { get; set; }
    }
}
