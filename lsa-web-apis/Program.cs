using System.Text;
using System.Text.Json.Serialization;
using lsa_web_apis.Data;
using lsa_web_apis.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()  ?? Array.Empty<string>();

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder => builder.WithOrigins(allowedOrigins!)
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials()
                          );
});
builder.Services.AddSingleton<IRadioInfoService, RadioInfoService>();
builder.Services.AddScoped<IImageUploadService, ImageUploadService>();
builder.Services.AddSignalR();
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<UserDbContext>(options => options.UseMySQL(builder.Configuration.GetConnectionString("UsersDatabase")!));
builder.Services.AddDbContext<VideoRecordingsDbContext>(options => options.UseMySQL(builder.Configuration.GetConnectionString("VideoRecordingsDatabase")!));
builder.Services.AddDbContext<PublicEventsDbContext>(options => options.UseMySQL(builder.Configuration.GetConnectionString("VideoRecordingsDatabase")!));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddCookie()
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
        options.SaveTokens = true;
        options.Scope.Add("email");
        options.Scope.Add("profile");
        options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["AppSettings:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["AppSettings:Audience"],
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Token"]!)),
            ValidateIssuerSigningKey = true
        };
    });

builder.Services.AddScoped<IAuthService, AuthService>();
// LiveService holds a Timer and must be a singleton so the same instance (and timer)
// is used across requests. If it remains scoped, different requests get different
// LiveService instances which causes timers to be out of sync.
builder.Services.AddSingleton<ILiveService, LiveService>();
builder.Services.AddScoped<IVideoRecordingService, VideoRecordingService>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

if (app.Environment.IsEnvironment("Testing"))
{
    app.Use(async (context, next) =>
    {        
        context.Request.Headers["Authorization"] = "Test";
        await next();
    });
}


app.UseCors("CorsPolicy");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapHub<LiveServiceHub>("/lsa-service-hub");
app.MapHub<RadioInfoHub>("/radio-info-hub");

app.Run();
