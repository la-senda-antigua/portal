using System;
using lsa_web_apis.Entities;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Data;

public class PublicEventsDbContext(DbContextOptions<PublicEventsDbContext> options) : DbContext(options)
{
    public DbSet<PublicEvent> PublicEvents { get; set; }
}
