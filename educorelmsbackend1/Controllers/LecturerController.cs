using System.ComponentModel.DataAnnotations;
using educorelmsbackend.Data;
using educorelmsbackend.Models;
using educorelmsbackend.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace educorebackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LecturerController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public LecturerController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        // Get(All) - Read
        [HttpGet("GetAllLecturers")]
        public IActionResult GetAllLecturers()
        {
            var allLecturers = dbContext.Lecturers.ToList();
            return Ok(allLecturers);
        }

        // Post(Add) - Create
        [HttpPost("AddNewLecturer")]
        public IActionResult AddLecturer(AddLecturerDto addLecturerDto)
        {
            var lecturerEntity = new Lecturer()
            {
                LecturerId = Guid.NewGuid(),
                Name = addLecturerDto.Name,
                Surname = addLecturerDto.Surname,
                Gender = addLecturerDto.Gender,
                DateOfBirth = addLecturerDto.DateOfBirth,
                HomeAddress = addLecturerDto.HomeAddress,
                EmailAddress = addLecturerDto.EmailAddress,
                TelephoneNumber = addLecturerDto.TelephoneNumber
            };

            dbContext.Lecturers.Add(lecturerEntity);
            dbContext.SaveChanges();

            return Ok(lecturerEntity);
        }

        // Put(Update) - Update
        [HttpPut("UpdateLecturerByID/{lecturerId}")]
        public IActionResult UpdateLecturer(Guid lecturerId, UpdateLecturerDto updateLecturerDto)
        {
            var lecturer = dbContext.Lecturers.FirstOrDefault(l => l.LecturerId == lecturerId);

            if (lecturer == null)
            {
                return NotFound();
            }

            lecturer.Name = updateLecturerDto.Name;
            lecturer.Surname = updateLecturerDto.Surname;
            lecturer.Gender = updateLecturerDto.Gender;
            lecturer.DateOfBirth = updateLecturerDto.DateOfBirth;
            lecturer.HomeAddress = updateLecturerDto.HomeAddress;
            lecturer.EmailAddress = updateLecturerDto.EmailAddress;
            lecturer.TelephoneNumber = updateLecturerDto.TelephoneNumber;

            dbContext.SaveChanges();
            return Ok(lecturer);
        }

        // Delete(Id) - Delete
        [HttpDelete("DeleteLecturerByID/{lecturerId}")]
        public IActionResult DeleteLecturer(Guid lecturerId)
        {
            var lecturer = dbContext.Lecturers.FirstOrDefault(l => l.LecturerId == lecturerId);

            if (lecturer != null)
            {
                dbContext.Lecturers.Remove(lecturer);
                dbContext.SaveChanges();
                return Ok("Lecturer successfully removed");
            }

            return StatusCode(StatusCodes.Status404NotFound, "The provided lecturer ID does not exist");
        }

        // Get(Id) - Search
        [HttpGet("GetLecturerByID/{lecturerId}")]
        public IActionResult GetLecturer(Guid lecturerId)
        {
            var lecturer = dbContext.Lecturers.FirstOrDefault(l => l.LecturerId == lecturerId);

            if (lecturer != null)
            {
                return Ok(lecturer);
            }

            return StatusCode(StatusCodes.Status404NotFound, "This lecturer ID does not exist!");
        }

        // Get(Name) - Search
        [HttpGet("GetLecturerByName/{name}")]
        public IActionResult GetLecturerByName(string name)
        {
            var lecturers = dbContext.Lecturers.Where(l => l.Name == name).ToList();

            if (lecturers.Any())
            {
                return Ok(lecturers);
            }

            return StatusCode(StatusCodes.Status404NotFound, "Lecturer not found, try another name");
        }

        // Get(Surname) - Search
        [HttpGet("GetLecturerBySurname/{surname}")]
        public IActionResult GetLecturerBySurname(string surname)
        {
            var lecturers = dbContext.Lecturers.Where(l => l.Surname == surname).ToList();

            if (lecturers.Any())
            {
                return Ok(lecturers);
            }

            return StatusCode(StatusCodes.Status404NotFound, "Lecturer not found, try another surname");
        }
    }
}
