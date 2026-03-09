using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace MiniIssueTrackerWebAPI.Models;

public partial class MiniIssueTrackerContext : DbContext
{
    public MiniIssueTrackerContext()
    {
    }

    public MiniIssueTrackerContext(DbContextOptions<MiniIssueTrackerContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Issue> Issues { get; set; }

    public virtual DbSet<User> Users { get; set; }

    /// <summary>
    /// Configure EF Core mappings, default values, keys, and relationships.
    /// Keep database defaults in sync with the model where possible.
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Issue>(entity =>
        {
            // Primary key
            entity.HasKey(e => e.IssueId).HasName("PK__Issues__6C8616043E92C58A");

            // Default CreatedDate to SQL Server GETDATE()
            entity.Property(e => e.CreatedDate).HasDefaultValueSql("(getdate())");

            // Column sizing and defaults
            entity.Property(e => e.Priority).HasMaxLength(50);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Open");
            entity.Property(e => e.Title).HasMaxLength(200);

            // Relationship: an Issue may have an Assignee (User)
            entity.HasOne(d => d.Assignee).WithMany(p => p.Issues)
                .HasForeignKey(d => d.AssigneeId)
                .HasConstraintName("FK_Issues_Users");
        });

        modelBuilder.Entity<User>(entity =>
        {
            // Primary key and unique email constraint
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C17DE968C");
            entity.HasIndex(e => e.Email, "UQ__Users__A9D105341D0E78B6").IsUnique();

            // Default CreatedDate and property configurations
            entity.Property(e => e.CreatedDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Role)
                .HasMaxLength(50)
                .HasDefaultValue("User");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Active");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
