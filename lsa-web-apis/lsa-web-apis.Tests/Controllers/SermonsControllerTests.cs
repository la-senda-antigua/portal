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
    public class SermonsControllerTests
    {
        private static DbContextOptions<VideoRecordingsDbContext> CreateNewContextOptions()
        {
            return new DbContextOptionsBuilder<VideoRecordingsDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestSermonsDb_{Guid.NewGuid()}")
                .Options;
        }

        private static ClaimsPrincipal CreateAdminUser()
        {
            return new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            { new Claim(ClaimTypes.Role, "Admin")}, "mock"));
        }

        private static List<Sermon> GetTestSermons()
        {
            return new List<Sermon>
            {
                new Sermon
                {
                    Id = 1,
                    Date = DateTime.Now,
                    Title = "Sermon 1",
                    VideoPath = "path/to/sermon1.mp4",
                    AudioPath = "path/to/sermon1.mp3",
                    Cover = "path/to/cover1.jpg",
                    Playlist = Guid.NewGuid(),
                    PreacherId = 1,
                    Preacher = new Preacher { Id = 1, Name = "Preacher 1" }
                },
                new Sermon
                {
                    Id = 2,
                    Date = DateTime.Now,
                    Title = "Sermon 2",
                    VideoPath = "path/to/sermon2.mp4",
                    AudioPath = "path/to/sermon2.mp3",
                    Cover = "path/to/cover2.jpg",
                    Playlist = Guid.NewGuid(),
                    PreacherId = 2,
                    Preacher = new Preacher { Id = 2, Name = "Preacher 2" }
                }
            };
        }

        [Fact]
        public async Task GetSermons_WithoutSearchTerm_ShouldReturnPagedSermons()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testSermons = GetTestSermons();
            context.Sermons.AddRange(testSermons);
            await context.SaveChangesAsync();

            var mockVideoService = new Mock<IVideoRecordingService>();
            var mockImageService = new Mock<IImageUploadService>();
            var controller = new SermonsController(context, mockVideoService.Object, mockImageService.Object);

            // Act
            var result = await controller.GetSermons(page: 1, pageSize: 10);

            // Assert
            var actionResult = Assert.IsType<ActionResult<PagedResult<Sermon>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var pagedResult = Assert.IsType<PagedResult<Sermon>>(okResult.Value);
            Assert.Equal(2, pagedResult.TotalItems);
        }

        [Fact]
        public async Task GetSermons_WithSearchTerm_ShouldReturnFilteredSermons()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testSermons = GetTestSermons();
            var mockVideoService = new Mock<IVideoRecordingService>();
            var mockImageService = new Mock<IImageUploadService>();

            mockVideoService.Setup(x => x.FilterVideosPaged<Sermon>(
                It.IsAny<string>(),
                It.IsAny<int>(),
                It.IsAny<int>()))
            .ReturnsAsync(new PagedResult<Sermon>
            {
                Items = testSermons.Take(1),
                TotalItems = 1,
                Page = 1,
                PageSize = 10
            });

            var controller = new SermonsController(context, mockVideoService.Object, mockImageService.Object);

            // Act
            var result = await controller.GetSermons(page: 1, pageSize: 10, searchTerm: "Sermon 1");

            // Assert
            var actionResult = Assert.IsType<ActionResult<PagedResult<Sermon>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);            
            var pagedResult = Assert.IsType<PagedResult<Sermon>>(okResult.Value);
            Assert.Single(pagedResult.Items);
        }

        [Fact]
        public async Task GetSermon_WithValidId_ShouldReturnSermon()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testSermons = GetTestSermons();
            context.Sermons.AddRange(testSermons);
            await context.SaveChangesAsync();

            var mockVideoService = new Mock<IVideoRecordingService>();
            var mockImageService = new Mock<IImageUploadService>();
            var controller = new SermonsController(context, mockVideoService.Object, mockImageService.Object);

            // Act
            var result = await controller.GetSermon(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Sermon>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var sermon = Assert.IsType<Sermon>(okResult.Value);
            Assert.Equal(1, sermon.Id);
        }

        [Fact]
        public async Task GetSermon_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var mockVideoService = new Mock<IVideoRecordingService>();
            var mockImageService = new Mock<IImageUploadService>();
            var controller = new SermonsController(context, mockVideoService.Object, mockImageService.Object);

            // Act
            var result = await controller.GetSermon(999);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Sermon>>(result);
            Assert.IsType<NotFoundResult>(actionResult.Result);
        }

        [Fact]
        public async Task CreateSermon_WithValidData_ShouldCreateSermon()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var mockVideoService = new Mock<IVideoRecordingService>();
            var mockImageService = new Mock<IImageUploadService>();
            var controller = new SermonsController(context, mockVideoService.Object, mockImageService.Object);

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = CreateAdminUser() }
            };

            var newSermon = new Sermon
            {
                Title = "New Sermon",
                VideoPath = "path/to/new.mp4",
                AudioPath = "path/to/new.mp3",
                Date = DateTime.Now,
                PreacherId = 1
            };

            // Act
            var result = await controller.CreateSermon(JsonSerializer.Serialize(newSermon), null!);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdSermon = Assert.IsType<Sermon>(createdAtActionResult.Value);
            Assert.Equal("New Sermon", createdSermon.Title);
        }

        [Fact]
        public async Task UpdateSermon_WithValidData_ShouldUpdateSermon()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testSermons = GetTestSermons();
            context.Sermons.AddRange(testSermons);
            await context.SaveChangesAsync();

            var mockVideoService = new Mock<IVideoRecordingService>();
            var mockImageService = new Mock<IImageUploadService>();
            var controller = new SermonsController(context, mockVideoService.Object, mockImageService.Object);

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = CreateAdminUser() }
            };

            var updatedSermon = new Sermon
            {
                Id = 1,
                Title = "Updated Sermon",
                VideoPath = "path/to/updated.mp4",
                AudioPath = "path/to/updated.mp3",
                Date = DateTime.Now,
                PreacherId = 1
            };

            // Act
            var result = await controller.UpdateSermon(1, JsonSerializer.Serialize(updatedSermon), null);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteSermon_WithValidId_ShouldDeleteSermon()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testSermons = GetTestSermons();
            context.Sermons.AddRange(testSermons);
            await context.SaveChangesAsync();

            var mockVideoService = new Mock<IVideoRecordingService>();
            var mockImageService = new Mock<IImageUploadService>();
            var controller = new SermonsController(context, mockVideoService.Object, mockImageService.Object);

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = CreateAdminUser() }
            };

            // Act
            var result = await controller.DeleteSermon(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Null(await context.Sermons.FindAsync(1));
        }
    }
}
