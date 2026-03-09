using System;
using System.Collections.Generic;

namespace MiniIssueTrackerWebAPI.Models;

/// <summary>
/// Domain model representing an application user.
/// The PasswordHash contains the hashed password and should never be exposed in DTOs.
/// </summary>
public partial class User
{
    public int UserId { get; set; }

    /// <summary>Unique email address used for login.</summary>
    public string Email { get; set; } = null!;

    /// <summary>BCrypt hashed password.</summary>
    public string PasswordHash { get; set; } = null!;

    /// <summary>User role for authorization (e.g., User, Admin).</summary>
    public string Role { get; set; } = null!;

    /// <summary>When the user account was created.</summary>
    public DateTime CreatedDate { get; set; }

    /// <summary>Optional full name for display purposes.</summary>
    public string? FullName { get; set; }

    /// <summary>Account status (e.g., Active, Pending) used to allow/deny login.</summary>
    public string Status { get; set; } = null!;

    /// <summary>Navigation collection of issues assigned to this user.</summary>
    public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();
}
