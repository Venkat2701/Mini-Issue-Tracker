using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniIssueTrackerWebAPI.Data;
using MiniIssueTrackerWebAPI.Business;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace MiniIssueTrackerWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Lock down the whole controller
    public class UsersController : ControllerBase
    {
        private readonly UsersData _usersData;
        private readonly AuthBusiness _authBusiness;

        public UsersController(UsersData usersData, AuthBusiness authBusiness)
        {
            _usersData = usersData;
            _authBusiness = authBusiness;
        }

        // GET: api/users
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _usersData.GetAllUsersAsync();
            var safeUsers = users.Select(u => new UserDto
            {
                UserId = u.UserId,
                FullName = u.FullName ?? u.Email,
                Email = u.Email,
                Role = u.Role,
                Status = u.Status // <-- MAP THIS
            });
            return Ok(safeUsers);
        }

        // POST: api/users (Admin Only)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto request)
        {
            try
            {
                // We reuse the secure registration logic so passwords get hashed!
                await _authBusiness.RegisterAsync(request.Email, request.Password, request.FullName, request.Role, request.Status);
                return Ok(new { message = "User created successfully!" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/users/5 (Admin Only)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto request)
        {
            var user = await _usersData.GetUserByIdAsync(id);
            if (user == null) return NotFound();

            // Only update fields that the client provided.
            // This preserves any fields not included in the request.
            if (!string.IsNullOrEmpty(request.FullName)) user.FullName = request.FullName;
            if (!string.IsNullOrEmpty(request.Role)) user.Role = request.Role;
            if (!string.IsNullOrEmpty(request.Status)) user.Status = request.Status;

            await _usersData.UpdateUserAsync(user);
            return NoContent();
        }

        // DELETE: api/users/5 (Admin Only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var success = await _usersData.DeleteUserAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }

    // DTOs for transferring user data safely between client and server.
    // DTOs avoid exposing sensitive fields like PasswordHash.

    public class UserDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string Status { get; set; } = null!; // Account status (e.g., Active, Pending)
    }

    public class CreateUserDto
    {
        // When creating a user, the client provides email, plain password and optional metadata.
        // Password will be hashed by the server before storage.
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string Status { get; set; } = "Active"; // Default initial status for created users
    }

    public class UpdateUserDto
    {
        // All fields optional: only provided ones will be used to update the user.
        public string? FullName { get; set; } = null!;
        public string? Role { get; set; } = null!;
        public string? Status { get; set; } = null!; // e.g., "Active", "Pending", "Disabled"
    }
}