using educorelmsbackend.Data;
using educorelmsbackend.Models;
using educorelmsbackend.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace educorelmsbackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ModuleController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        public ModuleController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;   
        }

        [HttpGet("GetAllModules")]
        public IActionResult GetModules()
        {
            var getModules = dbContext.Modules.ToList();

            if (dbContext.Modules == null)
            {
                return BadRequest("No modules here");
            }

            return Ok(getModules);
        }

        [HttpPost]
        public IActionResult AddModules(AddModuleDto addmoduleDto)
        {
            var ModuleEntity = new Module()
            {
                ModuleId = Guid.NewGuid(),
                Name = addmoduleDto.Name,
                ModuleCode = addmoduleDto.ModuleCode,
                CourseId = addmoduleDto.CourseId
            };
            dbContext.Add(ModuleEntity);
            dbContext.SaveChanges();
            return Ok(ModuleEntity);
        }

        [HttpPut("{id:guid}")]
        public IActionResult UpdateModule(Guid id, [FromBody] AddModuleDto updateModuleDto)
        {
            var module = dbContext.Modules.Find(id);
            if (module == null)
            {
                return NotFound("Module not found");
            }
            module.Name = updateModuleDto.Name;
            module.ModuleCode = updateModuleDto.ModuleCode;
            module.CourseId = updateModuleDto.CourseId;
            dbContext.SaveChanges();
            return Ok(module);
        }

        [HttpDelete("{id:guid}")]
        public IActionResult DeleteModule(Guid id)
        {
            var module = dbContext.Modules.Find(id);
            if (module == null)
            {
                return NotFound("Module not found");
            }
            dbContext.Modules.Remove(module);
            dbContext.SaveChanges();
            return Ok("Module deleted successfully");
        }

        [HttpGet("search/name/{name}")]
        public IActionResult SearchModuleByName(string name)
        {
            var modules = dbContext.Modules.Where(m => m.Name.Contains(name)).ToList();
            if (!modules.Any())
            {
                return NotFound("No modules found with that name");
            }
            return Ok(modules);
        }

        [HttpGet("search/code/{code}")]
        public IActionResult SearchModuleByCode(string code)
        {
            var modules = dbContext.Modules.Where(m => m.ModuleCode.Contains(code)).ToList();
            if (!modules.Any())
            {
                return NotFound("No modules found with that code");
            }
            return Ok(modules);
        }
    }
}
