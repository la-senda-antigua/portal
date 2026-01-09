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
using lsa_web_apis.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace lsa_web_apis.Tests.Controllers
{
    public class PreachersControllerTests
    {
        private static DbContextOptions<VideoRecordingsDbContext> CreateNewContextOptions()
        {
            return new DbContextOptionsBuilder<VideoRecordingsDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestPreachersDb_{Guid.NewGuid()}")
                .Options;
        }

        private static ClaimsPrincipal CreateAdminUser()
        {
            return new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            { new Claim(ClaimTypes.Role, "Admin")}, "mock"));
        }

        private static List<Preacher> GetTestPreachers()
        {
            return new List<Preacher>
            {
                new Preacher
                {
                    Id = 1,
                    Name = "Preacher 1"
                },
                new Preacher
                {
                    Id = 2,
                    Name = "Preacher 2"
                }
            };
        }

        [Fact]
        public async Task GetPreachers_WithoutSearchTerm_ShouldReturnPagedPreachers()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testPreachers = GetTestPreachers();
            context.Preachers.AddRange(testPreachers);
            await context.SaveChangesAsync();

            var controller = new PreachersController(context);

            // Act
            var result = await controller.GetPreachers(page: 1, pageSize: 10);

            // Assert
            var actionResult = Assert.IsType<ActionResult<PagedResult<Preacher>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var pagedResult = Assert.IsType<PagedResult<Preacher>>(okResult.Value);
            Assert.Equal(2, pagedResult.TotalItems);
        }

        [Fact]
        public async Task GetPreachers_WithSearchTerm_ShouldReturnFilteredPreachers()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testPreachers = GetTestPreachers();
            context.Preachers.AddRange(testPreachers);
            await context.SaveChangesAsync();

            var controller = new PreachersController(context);

            // Act
            var result = await controller.GetPreachers(page: 1, pageSize: 10, searchTerm: "Preacher 1");

            // Assert
            var actionResult = Assert.IsType<ActionResult<PagedResult<Preacher>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var pagedResult = Assert.IsType<PagedResult<Preacher>>(okResult.Value);
            Assert.Single(pagedResult.Items);
        }

        [Fact]
        public async Task GetAllPreachers_ShouldReturnAllPreachers()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testPreachers = GetTestPreachers();
            context.Preachers.AddRange(testPreachers);
            await context.SaveChangesAsync();

            var controller = new PreachersController(context);

            // Act
            var result = await controller.GetAllPreachers();

            // Assert
            var actionResult = Assert.IsType<ActionResult<List<Preacher>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var preachers = Assert.IsType<Preacher[]>(okResult.Value);
            Assert.Equal(2, preachers.Length);
        }

        [Fact]
        public async Task GetPreacher_WithValidId_ShouldReturnPreacher()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testPreachers = GetTestPreachers();
            context.Preachers.AddRange(testPreachers);
            await context.SaveChangesAsync();

            var controller = new PreachersController(context);

            // Act
            var result = await controller.GetPreacher(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Preacher>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var preacher = Assert.IsType<Preacher>(okResult.Value);
            Assert.Equal(1, preacher.Id);
        }

        [Fact]
        public async Task GetPreacher_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var controller = new PreachersController(context);

            // Act
            var result = await controller.GetPreacher(999);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Preacher>>(result);
            Assert.IsType<NotFoundResult>(actionResult.Result);
        }

        [Fact]
        public async Task CreatePreacher_WithValidData_ShouldCreatePreacher()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var controller = new PreachersController(context);

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = CreateAdminUser() }
            };

            var newPreacher = new Preacher
            {
                Name = "New Preacher"
            };

            // Act
            var result = await controller.CreatePreacher(newPreacher);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdPreacher = Assert.IsType<Preacher>(createdAtActionResult.Value);
            Assert.Equal("New Preacher", createdPreacher.Name);
        }

        [Fact]
        public async Task UpdatePreacher_WithValidData_ShouldUpdatePreacher()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testPreachers = GetTestPreachers();
            context.Preachers.AddRange(testPreachers);
            await context.SaveChangesAsync();

            var controller = new PreachersController(context);

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = CreateAdminUser() }
            };

            var updatedPreacher = new Preacher
            {
                Id = 1,
                Name = "Updated Preacher"
            };

            // Act
            var result = await controller.UpdatePreacher(1, updatedPreacher);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task UpdatePreacher_WithMismatchedId_ShouldReturnBadRequest()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var controller = new PreachersController(context);

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = CreateAdminUser() }
            };

            var updatedPreacher = new Preacher
            {
                Id = 2,
                Name = "Updated Preacher"
            };

            // Act
            var result = await controller.UpdatePreacher(1, updatedPreacher);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Id does not match", badRequestResult.Value);
        }

        [Fact]
        public async Task DeletePreacher_WithValidId_ShouldDeletePreacher()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using var context = new VideoRecordingsDbContext(options);
            var testPreachers = GetTestPreachers();
            context.Preachers.AddRange(testPreachers);
            await context.SaveChangesAsync();

            var controller = new PreachersController(context);

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = CreateAdminUser() }
            };

            // Act
            var result = await controller.DeletePreacher(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Null(await context.Preachers.FindAsync(1));
        }
    }
}