using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using lsa_web_apis.Controllers;
using lsa_web_apis.Data;
using lsa_web_apis.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.Text.Json;
using lsa_web_apis.Entities;
using lsa_web_apis.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace lsa_web_apis.Tests.Controllers
{
    public class LessonsControllerTests
    {
        private static DbContextOptions<VideoRecordingsDbContext> CreateNewContextOptions()
        {
            return new DbContextOptionsBuilder<VideoRecordingsDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestLessonsDb_{Guid.NewGuid()}")
                .Options;
        }

        private static ClaimsPrincipal CreateAdminUser()
        {
            return new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            { new Claim(ClaimTypes.Role, "Admin")}, "mock"));
        }

        private static List<Lesson> GetTestLessons()
        {
            return new List<Lesson>
            {
                new Lesson
                {
                    Id = 1,
                    Date = DateTime.Now,
                    Title = "Lesson 1",
                    VideoPath = "path/to/lesson1.mp4",
                    Cover = "path/to/cover1.jpg",
                    Playlist = Guid.NewGuid(),
                    PreacherId = 1,
                    Preacher = new Preacher { Id = 1, Name = "Preacher 1" }
                },
                new Lesson
                {
                    Id = 2,
                    Date = DateTime.Now,
                    Title = "Lesson 2",
                    VideoPath = "path/to/lesson2.mp4",
                    Cover = "path/to/cover2.jpg",
                    Playlist = Guid.NewGuid(),
                    PreacherId = 2,
                    Preacher = new Preacher { Id = 2, Name = "Preacher 2" }
                }
            };
        }

        [Fact]
        public async Task GetLessons_WithoutSearchTerm_ShouldReturnPagedLessons()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testLessons = GetTestLessons();
            context.Lessons.AddRange(testLessons);
            await context.SaveChangesAsync();

            var mockImageService = new Mock<IImageUploadService>();
            var controller = new LessonsController(context, mockImageService.Object);

            // Act
            var result = await controller.GetLessons(page: 1, pageSize: 10);

            // Assert
            var actionResult = Assert.IsType<ActionResult<PagedResult<Lesson>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var pagedResult = Assert.IsType<PagedResult<Lesson>>(okResult.Value);
            Assert.Equal(2, pagedResult.TotalItems);
        }

        [Fact]
        public async Task GetLessons_WithSearchTerm_ShouldReturnFilteredLessons()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testLessons = GetTestLessons();
            var mockImageService = new Mock<IImageUploadService>();
            var mockVideoService = new Mock<IVideoRecordingService>();

            mockVideoService.Setup(x => x.FilterVideosPaged<Lesson>(
                It.IsAny<string>(),
                It.IsAny<int>(),
                It.IsAny<int>()))
            .ReturnsAsync(new PagedResult<Lesson>
            {
                Items = testLessons.Take(1),
                TotalItems = 1,
                Page = 1,
                PageSize = 10
            });

            // Usamos reflexión para establecer el campo privado _videoRecordingService
            var controller = new LessonsController(context, mockImageService.Object);
            var videoServiceField = typeof(LessonsController).GetField("_videoRecordingService",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            videoServiceField?.SetValue(controller, mockVideoService.Object);

            // Act
            var result = await controller.GetLessons(page: 1, pageSize: 10, searchTerm: "Lesson 1");

            // Assert
            var actionResult = Assert.IsType<ActionResult<PagedResult<Lesson>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var pagedResult = Assert.IsType<PagedResult<Lesson>>(okResult.Value);
            Assert.Single(pagedResult.Items);
        }

        [Fact]
        public async Task GetLesson_WithValidId_ShouldReturnLesson()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testLessons = GetTestLessons();
            context.Lessons.AddRange(testLessons);
            await context.SaveChangesAsync();

            var mockImageService = new Mock<IImageUploadService>();
            var controller = new LessonsController(context, mockImageService.Object);

            // Act
            var result = await controller.GetLesson(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Lesson>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var lesson = Assert.IsType<Lesson>(okResult.Value);
            Assert.Equal(1, lesson.Id);
        }

        [Fact]
        public async Task GetLesson_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var mockImageService = new Mock<IImageUploadService>();
            var controller = new LessonsController(context, mockImageService.Object);

            // Act
            var result = await controller.GetLesson(999);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Lesson>>(result);
            Assert.IsType<NotFoundResult>(actionResult.Result);
        }

        [Fact]
        public async Task CreateLesson_WithValidData_ShouldCreateLesson()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var mockImageService = new Mock<IImageUploadService>();
            var controller = new LessonsController(context, mockImageService.Object);

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = CreateAdminUser() }
            };

            var newLesson = new Lesson
            {
                Title = "New Lesson",
                VideoPath = "path/to/new.mp4",
                Date = DateTime.Now,
                PreacherId = 1
            };

            // Act
            var result = await controller.CreateLesson(JsonSerializer.Serialize(newLesson), null!);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdLesson = Assert.IsType<Lesson>(createdAtActionResult.Value);
            Assert.Equal("New Lesson", createdLesson.Title);
        }

        [Fact]
        public async Task UpdateLesson_WithValidData_ShouldUpdateLesson()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testLessons = GetTestLessons();
            context.Lessons.AddRange(testLessons);
            await context.SaveChangesAsync();

            var mockImageService = new Mock<IImageUploadService>();
            var controller = new LessonsController(context, mockImageService.Object);

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = CreateAdminUser() }
            };

            var updatedLesson = new Lesson
            {
                Id = 1,
                Title = "Updated Lesson",
                VideoPath = "path/to/updated.mp4",
                Date = DateTime.Now,
                PreacherId = 1
            };

            // Act
            var result = await controller.UpdateLesson(1, JsonSerializer.Serialize(updatedLesson), null);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteLesson_WithValidId_ShouldDeleteLesson()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testLessons = GetTestLessons();
            context.Lessons.AddRange(testLessons);
            await context.SaveChangesAsync();

            var mockImageService = new Mock<IImageUploadService>();
            var controller = new LessonsController(context, mockImageService.Object);

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = CreateAdminUser() }
            };

            // Act
            var result = await controller.DeleteLesson(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Null(await context.Lessons.FindAsync(1));
        }
    }
}