using Microsoft.AspNetCore.Mvc;
using MiniIssueTrackerWebAPI.Business;
using System;
using System.Threading.Tasks;

namespace MiniIssueTrackerWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthBusiness _authBusiness;

        public AuthController(AuthBusiness authBusiness)
        {
            _authBusiness = authBusiness;
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // We pass the email, password, and optionally a role (defaults to "User")
                await _authBusiness.RegisterAsync(request.Email, request.Password, request.FullName, request.Role ?? "User");
                return Ok(new { message = "User registered successfully!" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var token = await _authBusiness.LoginAsync(request.Email, request.Password);
            
            if (token == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            // Return the JWT token back to the user!
            return Ok(new { token = token });
        }
    }

    // --- Data Transfer Objects (DTOs) to shape the incoming JSON ---
    public class RegisterRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? FullName { get; set; } // <-- ADD THIS
        public string? Role { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}