using System;
using System.Collections.Generic;
using BookSearchDataLibrary.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookSearchDataLibrary;

public partial class BookSearchDbContext : DbContext
{
    public BookSearchDbContext()
    {
    }

    public BookSearchDbContext(DbContextOptions<BookSearchDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<User> Users { get; set; }

//    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
//        => optionsBuilder.UseSqlServer("Data Source=MANOJSAINEELAM;Initial Catalog=BookSearchDB;Integrated Security=True;Trust Server Certificate=True;MultipleActiveResultSets=False");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCAC6A833C68");

            entity.HasIndex(e => e.Username, "UQ__Users__536C85E41818C8FA").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Users__A9D1053496EB658E").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Username).HasMaxLength(50);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
