using educorelmsbackend.Models.Entities;
using educorelmsbackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using educorelmsbackend.Data;

namespace educorelmsbackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        public CourseController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllCourses()
        {
            var allCourses = dbContext.Courses.ToList();
            return Ok(allCourses);
        }

        [HttpGet]
        [Route("{id:guid}")]
        public IActionResult GetCourse(Guid id)
        {
            var getCourse = dbContext.Courses.Find(id);
            if (getCourse == null) return NotFound();
            return Ok(getCourse);
        }

        [HttpPost]
        public IActionResult AddCourses(AddCourseDto addCourseDto)
        {
            // validate lecturer exists
            var lecturer = dbContext.Lecturers.Find(addCourseDto.LecturerId);
            if (lecturer == null) return NotFound($"Lecturer with id {addCourseDto.LecturerId} not found.");

            var CourseEntity = new Course()
            {
                CourseId = Guid.NewGuid(),
                Name = addCourseDto.Name,
                Faculty = addCourseDto.Faculty,
                LecturerId = addCourseDto.LecturerId
            };

            dbContext.Courses.Add(CourseEntity);
            dbContext.SaveChanges();
            return Ok(CourseEntity);
        }

        [HttpPut("{id:guid}")] // Updating
        public IActionResult UpdateCourse(Guid id, UpdateCourseDto updateCourseDto)
        {
            var course = dbContext.Courses.Find(id);

            if (course == null)
            {
                return NotFound();
            }

            course.Name = updateCourseDto.CourseName;
            course.Faculty = updateCourseDto.Faculty;
            dbContext.SaveChanges();
            return Ok(course);
        }

        // Assign a lecturer to a course (admin action)
        [HttpPut("{courseId:guid}/assign-lecturer/{lecturerId:guid}")]
        [Authorize(Roles = "Admin")]
        public IActionResult AssignLecturer(Guid courseId, Guid lecturerId)
        {
            var course = dbContext.Courses.Find(courseId);
            if (course == null) return NotFound($"Course with id {courseId} not found.");

            var lecturer = dbContext.Lecturers.Find(lecturerId);
            if (lecturer == null) return NotFound($"Lecturer with id {lecturerId} not found.");

            course.LecturerId = lecturerId;
            dbContext.SaveChanges();

            return Ok(course);
        }

        [HttpDelete] // Delete
        [Route("{id:guid}")]
        public IActionResult DeleteCourse(Guid id)
        {   
            var course = dbContext.Courses.Find(id);
            if (course == null)
            {
                return NotFound();
            }

            dbContext.Courses.Remove(course);
            dbContext.SaveChanges();
            return Ok(course);
        }
    }
}
