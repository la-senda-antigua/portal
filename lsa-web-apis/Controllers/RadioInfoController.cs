using lsa_web_apis.Services;
using Microsoft.AspNetCore.Mvc;

namespace lsa_web_apis.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class RadioInfoController(IRadioInfoService service) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetCurrentTrackInfo()
        {
            return Ok(await service.GetCurrentTrackInfo());
        }
    }
}