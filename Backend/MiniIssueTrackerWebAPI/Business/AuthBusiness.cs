using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MiniIssueTrackerWebAPI.Data;
using MiniIssueTrackerWebAPI.Models;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace MiniIssueTrackerWebAPI.Business
{
    /// <summary>
    /// Encapsulates authentication-related business rules:
    /// - user registration (uniqueness check, password hashing, default fields)
    /// - user login (password verification, status check, JWT creation)
    /// </summary>
    public class AuthBusiness
    {
        private readonly UsersData _usersData;
        private readonly IConfiguration _configuration;

        public AuthBusiness(UsersData usersData, IConfiguration configuration)
        {
            _usersData = usersData;
            _configuration = configuration;
        }

        /// <summary>
        /// Register a new user:
        /// 1. Ensure the email is not already registered.
        /// 2. Hash the provided password.
        /// 3. Populate user fields (including role and status) and persist via data layer.
        /// </summary>
        /// <param name="email">User email (unique)</param>
        /// <param name="password">Plain-text password to be hashed</param>
        /// <param name="fullName">Optional full name</param>
        /// <param name="role">Role assigned to the user (default: "User")</param>
        /// <param name="status">Account status (default: "Pending")</param>
        public async Task<User> RegisterAsync(string email, string password, string? fullName, string role = "User", string status = "Pending")
        {
            var existingUser = await _usersData.GetUserByEmailAsync(email);
            if (existingUser != null) throw new ArgumentException("Email is already registered.");

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

            var newUser = new User
            {
                Email = email,
                PasswordHash = hashedPassword,
                FullName = fullName,
                Role = role,
                Status = status,
                CreatedDate = DateTime.Now
            };

            return await _usersData.AddUserAsync(newUser);
        }

        /// <summary>
        /// Log in a user:
        /// 1. Look up user by email.
        /// 2. Verify provided password against stored hash.
        /// 3. Confirm account status allows login.
        /// 4. Return a signed JWT if successful, otherwise null or exception for blocked accounts.
        /// </summary>
        public async Task<string?> LoginAsync(string email, string password)
        {
            var user = await _usersData.GetUserByEmailAsync(email);
            if (user == null) return null;

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            if (!isPasswordValid) return null;

            // Prevent login if account has not been approved yet.
            if (user.Status == "Pending")
            {
                throw new UnauthorizedAccessException("Account is pending admin approval.");
            }

            return GenerateJwtToken(user);
        }

        /// <summary>
        /// Create a JWT for the authenticated user:
        /// - reads signing configuration from app settings
        /// - creates common identity claims (email, role, jti)
        /// - signs token and sets a short expiration
        /// </summary>
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(secretKey);
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}