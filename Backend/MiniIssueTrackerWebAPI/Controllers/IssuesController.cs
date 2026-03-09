using Microsoft.AspNetCore.Mvc;
using MiniIssueTrackerWebAPI.Business;
using MiniIssueTrackerWebAPI.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace MiniIssueTrackerWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class IssuesController : ControllerBase
    {
        private readonly IssuesBusiness _issuesBusiness;

        // Inject the Business layer instead of the Database Context!
        public IssuesController(IssuesBusiness issuesBusiness)
        {
            _issuesBusiness = issuesBusiness;
        }

        // GET: api/Issues
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Issue>>> GetIssues()
        {
            var issues = await _issuesBusiness.GetAllIssuesAsync();
            return Ok(issues);
        }

        // GET: api/Issues/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Issue>> GetIssue(int id)
        {
            var issue = await _issuesBusiness.GetIssueByIdAsync(id);

            if (issue == null)
            {
                return NotFound();
            }

            return Ok(issue);
        }

        // POST: api/Issues
        [HttpPost]
        public async Task<ActionResult<Issue>> PostIssue(Issue issue)
        {
            try
            {
                // The Business layer handles validation and default values now
                var createdIssue = await _issuesBusiness.AddIssueAsync(issue);

                // Return a 201 Created status and a link to the new issue
                return CreatedAtAction(nameof(GetIssue), new { id = createdIssue.IssueId }, createdIssue);
            }
            catch (ArgumentException ex)
            {
                // If the business validation fails, tell the user exactly why
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/Issues/5
        // PUT: api/Issues/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutIssue(int id, [FromBody] Issue issue)
        {
            try
            {
                // 1. Fetch the real, complete issue from the database first
                var existingIssue = await _issuesBusiness.GetIssueByIdAsync(id);
                if (existingIssue == null)
                {
                    return NotFound();
                }

                // 2. Safely map ONLY the fields the Angular frontend actually sent
                existingIssue.Title = issue.Title;
                existingIssue.Description = issue.Description;
                existingIssue.Priority = issue.Priority;
                existingIssue.Status = issue.Status;
                existingIssue.AssigneeId = issue.AssigneeId;

                // 3. Send the complete, updated object down to your business layer
                await _issuesBusiness.UpdateIssueAsync(id, existingIssue);

                return NoContent(); // 204 Success
            }
            catch (ArgumentException ex)
            {
                // Catches the ID mismatch validation from our Business layer
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                // We will print the exact crash to your console just in case!
                Console.WriteLine($"Crash in PutIssue: {ex.Message}");
                return StatusCode(500, "An error occurred while updating the issue.");
            }
        }

        // DELETE: api/Issues/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteIssue(int id)
        {
            var success = await _issuesBusiness.DeleteIssueAsync(id);
            if (!success)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}