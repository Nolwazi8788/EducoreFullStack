using educorelmsbackend.Data;
using educorelmsbackend.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace educorelmsbackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        public TaskController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        // 1. Lecturer: View assigned courses and modules
        [HttpGet("LecturerCourses/{lecturerId}")]
        public IActionResult GetLecturerCoursesAndModules(Guid lecturerId)
        {
            var courses = dbContext.Courses
                .Where(c => c.LecturerId == lecturerId)
                .Include(c => c.Modules)
                .ToList();
            return Ok(courses);
        }

        // 2. Lecturer: Create tasks for students within each module
        [HttpPost("Create")]
        public IActionResult CreateTask([FromBody] ModuleTask task)
        {
            task.ModuleTaskId = Guid.NewGuid();
            dbContext.Tasks.Add(task);
            dbContext.SaveChanges();
            return Ok(task);
        }

        // 3. Student: View a list of tasks for their enrolled modules
        [HttpGet("StudentTasks/{studentId}")]
        public IActionResult GetStudentTasks(Guid studentId, [FromQuery] string? status)
        {
            var student = dbContext.Students.Include(s => s.Course).ThenInclude(c => c.Modules).FirstOrDefault(s => s.StudentId == studentId);
            if (student == null)
                return NotFound("Student not found");

            var moduleIds = student.Course.Modules.Select(m => m.ModuleId).ToList();
            var tasksQuery = dbContext.Tasks.Where(t => moduleIds.Contains(t.ModuleId));
            if (!string.IsNullOrEmpty(status))
            {
                tasksQuery = tasksQuery.Where(t => t.Status == status);
            }
            var tasks = tasksQuery.ToList();
            return Ok(tasks);
        }

        // 4. Student: Update task status
        [HttpPut("UpdateStatus/{taskId}")]
        public IActionResult UpdateTaskStatus(Guid taskId, [FromBody] string status)
        {
            var task = dbContext.Tasks.FirstOrDefault(t => t.ModuleTaskId == taskId);
            if (task == null)
                return NotFound("Task not found");
            task.Status = status;
            dbContext.SaveChanges();
            return Ok(task);
        }
    }
}
