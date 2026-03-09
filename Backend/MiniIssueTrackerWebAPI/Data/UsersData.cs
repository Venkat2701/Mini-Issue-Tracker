using Microsoft.EntityFrameworkCore;
using MiniIssueTrackerWebAPI.Models;
using System.Threading.Tasks;

namespace MiniIssueTrackerWebAPI.Data
{
    public class UsersData
    {
        private readonly MiniIssueTrackerContext _context;

        public UsersData(MiniIssueTrackerContext context)
        {
            _context = context;
        }

        // GET: Find all users for the dropdown
        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: Find a user by their email
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
        }

        // GET: Find a single user by ID
        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        // PUT: Update an existing user
        public async Task<User> UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }

        // DELETE: Remove a user
        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        // POST: Save a new user to the database
        public async Task<User> AddUserAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }
    }
}