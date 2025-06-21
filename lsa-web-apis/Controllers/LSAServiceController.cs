using System.Reflection.Metadata;
using lsa_web_apis.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace lsa_web_apis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LSAServiceController : ControllerBase
    {
        private readonly IHubContext<LSAServiceHub> _hubContext;

        public LSAServiceController(IHubContext<LSAServiceHub> hubContext)
        {
            _hubContext = hubContext;
        }

        [Authorize (Roles = "Admin")]
        [HttpPost("start")]
        public async Task<IActionResult> StartService([FromBody] string videoURL)
        {
            LSAServiceHub.StartService(videoURL);
            await _hubContext.Clients.All.SendAsync(Constants.LSAServiceStartedNotification, videoURL);
            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("end")]
        public async Task<IActionResult> EndService()
        {
            LSAServiceHub.EndService();
            await _hubContext.Clients.All.SendAsync(Constants.LSAServiceEndedNotification);
            return Ok();
        }
    }
}
