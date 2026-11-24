using educorelmsbackend.Models.Authentication;
using educorelmsbackend.Models.Authentication.SignUp;
using educorelmsbackend.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace educorebackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext dbContext;

        public AuthenticationController(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration, ApplicationDbContext dbContext)
        {
            (_userManager, _roleManager, _configuration, this.dbContext) = (userManager, roleManager, configuration, dbContext);
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterUser registerUser, [FromQuery] string role)
        {
            // Check User Exists
            var userExists = await _userManager.FindByEmailAsync(registerUser.Email);

            if (userExists != null)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new Response { Status = "Error", Message = "User already exists! " });
            }

            // Validate password match
            if (registerUser.Password != registerUser.ConfirmPassword)
            {
                return StatusCode(StatusCodes.Status400BadRequest, new Response { Status = "Error", Message = "Passwords do not match." });
            }

            // Validate role
            if (string.IsNullOrWhiteSpace(role) || (role != "Admin" && role != "Lecturer"))
            {
                return StatusCode(StatusCodes.Status400BadRequest, new Response { Status = "Error", Message = "Role must be 'Admin' or 'Lecturer'." });
            }

            // Add the User in the Database
            IdentityUser user = new IdentityUser()
            {
                Email = registerUser.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = registerUser.Username
            };

            if (await _roleManager.RoleExistsAsync(role))
            {
                var result = await _userManager.CreateAsync(user, registerUser.Password);

                if (!result.Succeeded)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User Failed to Create" });
                }

                await _userManager.AddToRoleAsync(user, role);

                return StatusCode(StatusCodes.Status200OK, new Response { Status = "Success", Message = $"{role} Created Successfully" });
            }
            else
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "This Role Does not Exist." });
            }
        }

        [HttpPost("RegisterStudent")]
        public async Task<IActionResult> RegisterStudent([FromBody] RegisterStudent student)
        {
            // Check if email already exists
            var userExists = await _userManager.FindByEmailAsync(student.EmailAddress);
            if (userExists != null)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new Response { Status = "Error", Message = "User already exists!" });
            }

            // Validate password match
            if (student.Password != student.ConfirmPassword)
            {
                return StatusCode(StatusCodes.Status400BadRequest, new Response { Status = "Error", Message = "Passwords do not match." });
            }

            // Create IdentityUser for authentication
            IdentityUser user = new IdentityUser()
            {
                Email = student.EmailAddress,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = student.EmailAddress
            };

            if (await _roleManager.RoleExistsAsync("Student"))
            {
                var result = await _userManager.CreateAsync(user, student.Password);

                if (!result.Succeeded)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User Failed to Create" });
                }

                await _userManager.AddToRoleAsync(user, "Student");

                var newStudent = new educorelmsbackend.Models.Entities.Student
                {
                    StudentId = Guid.NewGuid(),
                    StudentNumber = student.StudentNumber, // Or use your own logic for student numbers
                    Name = student.Name,
                    Surname = student.Surname,
                    Gender = student.Gender,
                    DateOfBirth = student.DateOfBirth,
                    HomeAddress = student.HomeAddress,
                    EmailAddress = student.EmailAddress,
                    PhoneNumber = student.PhoneNumber,
                    CourseId = Guid.Empty // Set to a valid CourseId if available, otherwise Guid.Empty
                };

                // Save student details to your database
                // _context.Students.Add(newStudent);
                // await _context.SaveChangesAsync();

                return StatusCode(StatusCodes.Status200OK, new Response { Status = "Success", Message = "Student Registered Successfully" });
            }
            else
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "Student Role Does not Exist." });
            }
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginUser loginUser)
        {
            var user = await _userManager.FindByEmailAsync(loginUser.Email);
            if (user == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, new Response { Status = "Error", Message = "User not found." });
            }

            if (!await _userManager.CheckPasswordAsync(user, loginUser.Password))
            {
                return StatusCode(StatusCodes.Status401Unauthorized, new Response { Status = "Error", Message = "Invalid password." });
            }

            // Optionally, you can add JWT token generation here
            return StatusCode(StatusCodes.Status200OK, new Response { Status = "Success", Message = "Login successful." });
        }

        [HttpGet("Users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = _userManager.Users.ToList();
            var userList = new List<object>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    Roles = roles
                });
            }
            return Ok(userList);
        }

        [HttpDelete("Users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new Response { Status = "Error", Message = "User not found." });
            }
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "Failed to delete user." });
            }
            return Ok(new Response { Status = "Success", Message = "User deleted successfully." });
        }

        [HttpPut("Users/{id}")]
        public async Task<IActionResult> EditUser(string id, [FromBody] RegisterUser updateUser)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new Response { Status = "Error", Message = "User not found." });
            }
            user.UserName = updateUser.Username;
            user.Email = updateUser.Email;
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "Failed to update user." });
            }
            return Ok(new Response { Status = "Success", Message = "User updated successfully." });
        }

        [HttpGet("Users/{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new Response { Status = "Error", Message = "User not found." });
            }
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new
            {
                user.Id,
                user.UserName,
                user.Email,
                Roles = roles
            });
        }

        
    }
}
