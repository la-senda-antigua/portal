using lsa_web_apis.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace lsa_web_apis.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class LSAServiceController(ILiveService _liveService) : ControllerBase
    {
        [Authorize(Roles = "Admin, BroadcastManager")]
        [HttpPost("start")]
        public async Task<IActionResult> StartService([FromBody] string videoURL)
        {
            var serviceState = await _liveService.StartService(videoURL);
            return Ok(serviceState);
        }

        [Authorize(Roles = "Admin, BroadcastManager")]
        [HttpPost("end")]
        public async Task<IActionResult> EndService()
        {
            await _liveService.EndService();
            return Ok();
        }

        [Authorize(Roles = "Admin, BroadcastManager")]
        [HttpPost("add30mins")]
        public IActionResult Add30Mins()
        {
            var serviceState = _liveService.Add30Mins();
            return Ok(serviceState);
        }

        [HttpGet("status")]
        public IActionResult GetServiceStatus()
        {
            var serviceState = _liveService.GetServiceStatus();
            return Ok(serviceState);
        }
    }
}
