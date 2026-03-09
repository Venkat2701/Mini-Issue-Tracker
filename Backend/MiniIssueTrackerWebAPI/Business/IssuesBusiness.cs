using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MiniIssueTrackerWebAPI.Data;
using MiniIssueTrackerWebAPI.Models;

namespace MiniIssueTrackerWebAPI.Business
{
    /// <summary>
    /// Business-layer rules for Issue operations.
    /// Validates input and applies defaults/timestamps before delegating to the data layer.
    /// </summary>
    public class IssuesBusiness
    {
        private readonly IssuesData _issuesData;

        public IssuesBusiness(IssuesData issuesData)
        {
            _issuesData = issuesData;
        }

        /// <summary>
        /// Retrieve all issues.
        /// Delegates directly to the data layer.
        /// </summary>
        public async Task<IEnumerable<Issue>> GetAllIssuesAsync()
        {
            return await _issuesData.GetAllIssuesAsync();
        }

        /// <summary>
        /// Retrieve a single issue by id.
        /// </summary>
        public async Task<Issue?> GetIssueByIdAsync(int id)
        {
            return await _issuesData.GetIssueByIdAsync(id);
        }

        /// <summary>
        /// Validate and persist a new issue:
        /// - Ensure title is provided.
        /// - Ensure status has a sensible default ("Open").
        /// - Set CreatedDate before saving.
        /// </summary>
        public async Task<Issue> AddIssueAsync(Issue issue)
        {
            // Validation: Title is required.
            if (string.IsNullOrWhiteSpace(issue.Title))
            {
                throw new ArgumentException("Issue title cannot be empty.");
            }

            // Defaulting: if status not provided, default to "Open".
            if (string.IsNullOrWhiteSpace(issue.Status))
            {
                issue.Status = "Open";
            }

            // Timestamp creation explicitly.
            issue.CreatedDate = DateTime.Now;

            // Pass the validated and prepared entity to the data layer.
            return await _issuesData.AddIssueAsync(issue);
        }

        /// <summary>
        /// Update an existing issue:
        /// - Optionally a guard could prevent ID mismatch between URL/body (commented out).
        /// - Always update UpdatedDate timestamp.
        /// - Delegate update to data layer.
        /// </summary>
        public async Task<Issue> UpdateIssueAsync(int id, Issue issue)
        {
            // Guard clause to prevent tampering could be enabled if the controller does not already check ids.
            // if (id != issue.IssueId) throw new ArgumentException("The ID in the URL does not match the ID in the body.");

            // Record when the update happened.
            issue.UpdatedDate = DateTime.Now;

            return await _issuesData.UpdateIssueAsync(issue);
        }

        /// <summary>
        /// Delete an issue by id. Returns true when deletion succeeded.
        /// </summary>
        public async Task<bool> DeleteIssueAsync(int id)
        {
            return await _issuesData.DeleteIssueAsync(id);
        }
    }
}