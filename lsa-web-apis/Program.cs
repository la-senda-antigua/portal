using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using lsa_web_apis.Data;
using lsa_web_apis.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

// Initialize Firebase Admin SDK if credentials are provided in configuration
var firebaseKeySection = builder.Configuration.GetSection("FirebaseKey");
if (FirebaseApp.GetApps().Count == 0 && firebaseKeySection.Exists())
{
    var firebaseKey = firebaseKeySection.Get<FirebaseKeyOptions>();
    if (firebaseKey is not null)
    {
        var firebaseKeyJson = JsonSerializer.Serialize(new
        {
            type = firebaseKey.Type,
            project_id = firebaseKey.ProjectId,
            private_key_id = firebaseKey.PrivateKeyId,
            private_key = firebaseKey.PrivateKey,
            client_email = firebaseKey.ClientEmail,
            client_id = firebaseKey.ClientId,
            auth_uri = firebaseKey.AuthUri,
            token_uri = firebaseKey.TokenUri,
            auth_provider_x509_cert_url = firebaseKey.AuthProviderX509CertUrl,
            client_x509_cert_url = firebaseKey.ClientX509CertUrl,
            universe_domain = firebaseKey.UniverseDomain
        });

        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromJson(firebaseKeyJson)
        });
    }
}

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
            ValidateIssuerSigningKey = true,
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.NameIdentifier
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

sealed class FirebaseKeyOptions
{
    public string? Type { get; set; }
    public string? ProjectId { get; set; }
    public string? PrivateKeyId { get; set; }
    public string? PrivateKey { get; set; }
    public string? ClientEmail { get; set; }
    public string? ClientId { get; set; }
    public string? AuthUri { get; set; }
    public string? TokenUri { get; set; }
    public string? AuthProviderX509CertUrl { get; set; }
    public string? ClientX509CertUrl { get; set; }
    public string? UniverseDomain { get; set; }
}
