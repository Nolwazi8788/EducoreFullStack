using educorelmsbackend.Data;
using educorelmsbackend.Models;
using educorelmsbackend.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace educorelmsbackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public StudentController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllStudents()
        {
            var students = dbContext.Students.ToList();
            return Ok(students);
        }

        [HttpGet("{id:guid}")]
        public IActionResult GetStudent(Guid id)
        {
            var student = dbContext.Students.Find(id);
            if (student == null) return NotFound();
            return Ok(student);
        }

        [HttpPost]
        public IActionResult AddStudent(AddStudentDto dto)
        {
            // If CourseId is provided, ensure course exists
            if (dto.CourseId.HasValue)
            {
                var course = dbContext.Courses.Find(dto.CourseId.Value);
                if (course == null) return NotFound($"Course with id {dto.CourseId} not found.");
            }

            var student = new Student
            {
                StudentId = Guid.NewGuid(),
                StudentNumber = dto.StudentNumber,
                Name = dto.Name,
                Surname = dto.Surname,
                Gender = dto.Gender,
                DateOfBirth = dto.DateOfBirth,
                HomeAddress = dto.HomeAddress,
                EmailAddress = dto.EmailAddress,
                PhoneNumber = dto.PhoneNumber,
                CourseId = dto.CourseId
            };

            dbContext.Students.Add(student);
            dbContext.SaveChanges();

            return Ok(student);
        }

        [HttpPut("{id:guid}")]
        public IActionResult UpdateStudent(Guid id, UpdateStudentDto dto)
        {
            var student = dbContext.Students.Find(id);
            if (student == null) return NotFound();

            if (dto.CourseId.HasValue)
            {
                var course = dbContext.Courses.Find(dto.CourseId.Value);
                if (course == null) return NotFound($"Course with id {dto.CourseId} not found.");
            }

            student.StudentNumber = dto.StudentNumber;
            student.Name = dto.Name;
            student.Surname = dto.Surname;
            student.Gender = dto.Gender;
            student.DateOfBirth = dto.DateOfBirth;
            student.HomeAddress = dto.HomeAddress;
            student.EmailAddress = dto.EmailAddress;
            student.PhoneNumber = dto.PhoneNumber;
            student.CourseId = dto.CourseId;

            dbContext.SaveChanges();
            return Ok(student);
        }

        // Assign a student to a course (admin action)
        [HttpPut("{studentId:guid}/assign-course/{courseId:guid}")]
        [Authorize(Roles = "Admin")]
        public IActionResult AssignCourse(Guid studentId, Guid courseId)
        {
            var student = dbContext.Students.Find(studentId);
            if (student == null) return NotFound($"Student with id {studentId} not found.");

            var course = dbContext.Courses.Find(courseId);
            if (course == null) return NotFound($"Course with id {courseId} not found.");

            student.CourseId = courseId;
            dbContext.SaveChanges();
            return Ok(student);
        }

        [HttpDelete("{id:guid}")]
        public IActionResult DeleteStudent(Guid id)
        {
            var student = dbContext.Students.Find(id);
            if (student == null) return NotFound();

            dbContext.Students.Remove(student);
            dbContext.SaveChanges();
            return Ok(student);
        }
    }
}
