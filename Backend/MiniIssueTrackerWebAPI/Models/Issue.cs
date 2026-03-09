using System;
using System.Collections.Generic;

namespace MiniIssueTrackerWebAPI.Models;

/// <summary>
/// Domain model representing a tracked issue/ticket.
/// Properties reflect database columns and navigation to an assignee user.
/// </summary>
public partial class Issue
{
    public int IssueId { get; set; }

    /// <summary>Short summary/title of the issue (required).</summary>
    public string Title { get; set; } = null!;

    /// <summary>Detailed description (optional).</summary>
    public string? Description { get; set; }

    /// <summary>Priority value (e.g., Low, Medium, High).</summary>
    public string Priority { get; set; } = null!;

    /// <summary>Status of the issue (e.g., Open, Closed).</summary>
    public string Status { get; set; } = null!;

    /// <summary>Timestamp when the issue was created.</summary>
    public DateTime CreatedDate { get; set; }

    /// <summary>Timestamp when the issue was last updated (optional).</summary>
    public DateTime? UpdatedDate { get; set; }

    /// <summary>Optional foreign key to the assigned user.</summary>
    public int? AssigneeId { get; set; }

    /// <summary>Navigation property to the assignee user (may be null).</summary>
    public virtual User? Assignee { get; set; }
}
