using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<CityLog> CityLogs { get; set; }
        public DbSet<DailyCityInsight> DailyCityInsights { get; set; }
        public DbSet<AlertRule> AlertRules { get; set; }
        public DbSet<AlertDelivery> AlertDeliveries { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
            });

            modelBuilder.Entity<CityLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.City).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Timestamp).IsRequired();
                entity.Property(e => e.TemperatureC);
                entity.Property(e => e.FeelsLikeC);
                entity.Property(e => e.Conditions).HasMaxLength(255);
                entity.HasIndex(e => new { e.UserId, e.Timestamp });
                entity.HasIndex(e => new { e.UserId, e.City });
            });

            modelBuilder.Entity<DailyCityInsight>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.City).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Date).IsRequired();
                entity.Property(e => e.Views).IsRequired();
                entity.Property(e => e.GeneratedAt).IsRequired();
                entity.HasIndex(e => new { e.UserId, e.City, e.Date }).IsUnique();
                entity.HasIndex(e => new { e.UserId, e.Date });
            });

            modelBuilder.Entity<AlertRule>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.City).IsRequired().HasMaxLength(255);
                entity.Property(e => e.PlaceCode).IsRequired().HasMaxLength(255);
                entity.Property(e => e.ThresholdC).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.Active).IsRequired();
                entity.Property(e => e.DigestEnabled).IsRequired();
                entity.Property(e => e.QuietHoursStart);
                entity.Property(e => e.QuietHoursEnd);
                entity.Property(e => e.DigestSendHourLocal);
                entity.HasIndex(e => new { e.UserId, e.PlaceCode, e.ConditionType, e.ThresholdC, e.Active });
            });

            modelBuilder.Entity<AlertDelivery>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status).IsRequired();
                entity.Property(e => e.AttemptedAt).IsRequired();
                entity.Property(e => e.DigestBatchDate);
                entity.HasOne(e => e.AlertRule)
                      .WithMany()
                      .HasForeignKey(e => e.AlertRuleId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(e => e.AlertRuleId);
            });
        }
    }
}
