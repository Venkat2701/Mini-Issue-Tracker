using Microsoft.EntityFrameworkCore;
using MiniIssueTrackerWebAPI.Models;

namespace MiniIssueTrackerWebAPI.Data
{
    public class IssuesData
    {
        private readonly MiniIssueTrackerContext _context;

        // Inject the Database Context
        public IssuesData(MiniIssueTrackerContext context)
        {
            _context = context;
        }

        // GET: All Issues
        public async Task<IEnumerable<Issue>> GetAllIssuesAsync()
        {
            // MAGIC HAPPENS HERE: .Include() grabs the Assignee user data!
            return await _context.Issues
                .Include(i => i.Assignee)
                .ToListAsync();
        }

        public async Task<Issue?> GetIssueByIdAsync(int id)
        {
            // We do the same here using SingleOrDefaultAsync instead of FindAsync
            return await _context.Issues
                .Include(i => i.Assignee)
                .SingleOrDefaultAsync(i => i.IssueId == id);
        }

        // POST: Add a new Issue
        public async Task<Issue> AddIssueAsync(Issue issue)
        {
            _context.Issues.Add(issue);
            await _context.SaveChangesAsync();
            return issue;
        }

        // PUT: Update an existing Issue
        public async Task<Issue> UpdateIssueAsync(Issue issue)
        {
            // Note: EF automatically tracks the entity if retrieved first, 
            // but setting state to modified forces the update.
            _context.Entry(issue).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return issue;
        }

        // DELETE: Remove an Issue
        public async Task<bool> DeleteIssueAsync(int id)
        {
            var issue = await _context.Issues.FindAsync(id);
            if (issue == null)
            {
                return false;
            }

            _context.Issues.Remove(issue);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}