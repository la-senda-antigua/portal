using System;

namespace lsa_web_apis.Services;

public interface IImageUploadService
{
    Task<string> UploadImageAsync(IFormFile imageFile, int id, string folder);    
}