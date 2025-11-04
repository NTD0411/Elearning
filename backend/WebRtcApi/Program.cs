using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;
using WebRtcApi.Data;
using WebRtcApi.Repositories.Auths;
using WebRtcApi.Repositories.Users;
using WebRtcApi.Repositories.Exams;
using WebRtcApi.Services;
using WebRtcApi.Services.Mail;
using WebRtcApi.Repositories.Packages;
using WebRtcApi.Repositories.Transactions;
using Net.payOS;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddScoped<IFileUploadService, FileUploadService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
    {
        builder.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5074")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        // Support System.DateOnly and nullable DateOnly in JSON payloads
        options.JsonSerializerOptions.Converters.Add(new WebRtcApi.Infrastructure.Converters.DateOnlyJsonConverter());
        options.JsonSerializerOptions.Converters.Add(new WebRtcApi.Infrastructure.Converters.NullableDateOnlyJsonConverter());
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<DatabaseContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Appsetting:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Appsetting:Audience"],
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Appsetting:Token"]!)),
            ValidateIssuerSigningKey = true
        };
    });

builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IReadingExamRepository, ReadingExamRepository>();
builder.Services.AddScoped<IListeningExamRepository, ListeningExamRepository>();
builder.Services.AddScoped<ISpeakingExamRepository, SpeakingExamRepository>();
builder.Services.AddScoped<IWritingExamRepository, WritingExamRepository>();
builder.Services.AddScoped<IPackageRepository, PackageRepository>();
builder.Services.AddScoped<IMailService, MailService>();
builder.Services.AddScoped<WebRtcApi.Services.AIWritingScoringService>();
builder.Services.AddScoped<WebRtcApi.Services.AIExamGeneratorService>();
builder.Services.AddScoped<WebRtcApi.Services.TextToSpeechService>();
builder.Services.AddScoped<ILearningRoadmapService, LearningRoadmapService>();
builder.Services.AddMemoryCache();

// Register payment related services
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();

// PayOS - đăng ký singleton như dự án cũ, lấy từ configuration
builder.Services.AddSingleton(new PayOS(
    builder.Configuration["PayOS:ClientId"]!,
    builder.Configuration["PayOS:ApiKey"]!,
    builder.Configuration["PayOS:ChecksumKey"]!
));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapScalarApiReference();
}

app.UseRouting();

app.UseCors("CorsPolicy");

// Comment out HTTPS redirection for development
// app.UseHttpsRedirection();

// Enable static files serving with proper content types
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // Add CORS headers for media files and images
        if (ctx.File.Name.EndsWith(".mp3") || ctx.File.Name.EndsWith(".wav") || 
            ctx.File.Name.EndsWith(".ogg") || ctx.File.Name.EndsWith(".m4a") ||
            ctx.File.Name.EndsWith(".jpg") || ctx.File.Name.EndsWith(".jpeg") ||
            ctx.File.Name.EndsWith(".png") || ctx.File.Name.EndsWith(".pdf"))
        {
            ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
            ctx.Context.Response.Headers.Append("Access-Control-Allow-Methods", "GET");
            ctx.Context.Response.Headers.Append("Access-Control-Allow-Headers", "*");
        }
        
        // Set proper content type for files
        string extension = Path.GetExtension(ctx.File.Name).ToLower();
        switch (extension) {
            case ".jpg":
            case ".jpeg":
                ctx.Context.Response.ContentType = "image/jpeg";
                break;
            case ".png":
                ctx.Context.Response.ContentType = "image/png";
                break;
            case ".pdf":
                ctx.Context.Response.ContentType = "application/pdf";
                break;
        }
        
        // Log file access for debugging
        Console.WriteLine($"Serving static file: {ctx.File.PhysicalPath}");
    }
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
