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
    public class GalleryControllerTests
    {
        private static DbContextOptions<VideoRecordingsDbContext> CreateNewContextOptions()
        {
            return new DbContextOptionsBuilder<VideoRecordingsDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestGalleryDb_{Guid.NewGuid()}")
                .Options;
        }

        private static ClaimsPrincipal CreateAdminUser()
        {
            return new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            { new Claim(ClaimTypes.Role, "Admin")}, "mock"));
        }

        private static List<GalleryVideo> GetTestVideos()
        {
            return new List<GalleryVideo>
            {
                new GalleryVideo
                {
                    Id = 1,
                    Date = DateTime.Now,
                    Title = "Video 1",
                    VideoPath = "path/to/video1.mp4",
                    Cover = "path/to/cover1.jpg",
                    Playlist = Guid.NewGuid()
                },
                new GalleryVideo
                {
                    Id = 2,
                    Date = DateTime.Now,
                    Title = "Video 2",
                    VideoPath = "path/to/video2.mp4",
                    Cover = "path/to/cover2.jpg",
                    Playlist = Guid.NewGuid()
                }
            };
        }

        [Fact]
        public async Task GetGallery_WithoutSearchTerm_ShouldReturnPagedVideos()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testVideos = GetTestVideos();
            context.GalleryVideos.AddRange(testVideos);
            await context.SaveChangesAsync();

            var mockVideoService = new Mock<IVideoRecordingService>();
            var mockImageService = new Mock<IImageUploadService>();
            var controller = new GalleryController(context, mockVideoService.Object, mockImageService.Object);

            // Act
            var result = await controller.GetGallery(page: 1, pageSize: 10);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var pagedResult = Assert.IsType<PagedResult<GalleryVideo>>(okResult.Value);
            Assert.Equal(2, pagedResult.TotalItems);
        }

        [Fact]
        public async Task GetGallery_WithSearchTerm_ShouldReturnFilteredVideos()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testVideos = GetTestVideos();
            var mockVideoService = new Mock<IVideoRecordingService>();
            var mockImageService = new Mock<IImageUploadService>();

            mockVideoService.Setup(x => x.FilterVideosPaged<GalleryVideo>(
                It.IsAny<string>(),
                It.IsAny<int>(),
                It.IsAny<int>()))
            .ReturnsAsync(new PagedResult<GalleryVideo>
            {
                Items = testVideos.Take(1),
                TotalItems = 1,
                Page = 1,
                PageSize = 10
            });

            var controller = new GalleryController(context, mockVideoService.Object, mockImageService.Object);

            // Act
            var result = await controller.GetGallery(page: 1, pageSize: 10, searchTerm: "Video 1");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var pagedResult = Assert.IsType<PagedResult<GalleryVideo>>(okResult.Value);
            Assert.Single(pagedResult.Items);
        }

        [Fact]
        public async Task GetGallery_WithValidId_ShouldReturnVideo()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testVideos = GetTestVideos();
            context.GalleryVideos.AddRange(testVideos);
            await context.SaveChangesAsync();

            var mockVideoService = new Mock<IVideoRecordingService>();
            var mockImageService = new Mock<IImageUploadService>();
            var controller = new GalleryController(context, mockVideoService.Object, mockImageService.Object);

            // Act
            var result = await controller.GetGallery(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<GalleryVideo>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var video = Assert.IsType<GalleryVideo>(okResult.Value);
            Assert.Equal(1, video.Id);
        }


        [Fact]
        public async Task GetGallery_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var mockVideoService = new Mock<IVideoRecordingService>();
            var mockImageService = new Mock<IImageUploadService>();
            var controller = new GalleryController(context, mockVideoService.Object, mockImageService.Object);

            // Act
            var result = await controller.GetGallery(999);

            // Assert
            var actionResult = Assert.IsType<ActionResult<GalleryVideo>>(result);
            Assert.IsType<NotFoundResult>(actionResult.Result);
        }

        [Fact]
        public async Task CreateGallery_WithValidData_ShouldCreateVideo()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var mockVideoService = new Mock<IVideoRecordingService>();
            var mockImageService = new Mock<IImageUploadService>();
            var controller = new GalleryController(context, mockVideoService.Object, mockImageService.Object);

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = CreateAdminUser() }
            };

            var newVideo = new GalleryVideo
            {
                Title = "New Video",
                VideoPath = "path/to/new.mp4",
                Date = DateTime.Now
            };

            // Act
            var result = await controller.CreateGallery(JsonSerializer.Serialize(newVideo), null!);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdVideo = Assert.IsType<GalleryVideo>(createdAtActionResult.Value);
            Assert.Equal("New Video", createdVideo.Title);
        }

        [Fact]
        public async Task UpdateGallery_WithValidData_ShouldUpdateVideo()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testVideos = GetTestVideos();
            context.GalleryVideos.AddRange(testVideos);
            await context.SaveChangesAsync();

            var mockVideoService = new Mock<IVideoRecordingService>();
            var mockImageService = new Mock<IImageUploadService>();
            var controller = new GalleryController(context, mockVideoService.Object, mockImageService.Object);

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = CreateAdminUser() }
            };

            var updatedVideo = new GalleryVideo
            {
                Id = 1,
                Title = "Updated Video",
                VideoPath = "path/to/updated.mp4",
                Date = DateTime.Now
            };

            // Act
            var result = await controller.UpdateGallery(1, JsonSerializer.Serialize(updatedVideo), null);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteGallery_WithValidId_ShouldDeleteVideo()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testVideos = GetTestVideos();
            context.GalleryVideos.AddRange(testVideos);
            await context.SaveChangesAsync();

            var mockVideoService = new Mock<IVideoRecordingService>();
            var mockImageService = new Mock<IImageUploadService>();
            var controller = new GalleryController(context, mockVideoService.Object, mockImageService.Object);

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = CreateAdminUser() }
            };

            // Act
            var result = await controller.DeleteGallery(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Null(await context.GalleryVideos.FindAsync(1));
        }
    }
}
