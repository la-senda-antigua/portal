using lsa_web_apis.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace lsa_web_apis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LSAServiceController(ILiveService _liveService) : ControllerBase
    {
        [Authorize(Roles = "Admin")]
        [HttpPost("start")]
        public async Task<IActionResult> StartService([FromBody] string videoURL)
        {
            var dateToEndService = await _liveService.StartService(videoURL);
            return Ok(dateToEndService);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("end")]
        public async Task<IActionResult> EndService()
        {
            await _liveService.EndService();
            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("add30mins")]
        public IActionResult Add30Mins()
        {
            var dateToEndService = _liveService.Add30Mins();
            return Ok(dateToEndService);
        }
    }
}
