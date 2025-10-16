using System;
using System.Net;
using FluentFTP;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace lsa_web_apis.Services;

public class ImageUploadService : IImageUploadService
{
    private readonly string _ftpHost;
    private readonly string _ftpUsername;
    private readonly string _ftpPassword;

    public ImageUploadService(IConfiguration configuration)
    {
        _ftpHost = configuration["Ftp:Host"]!;
        _ftpUsername = configuration["Ftp:Username"]!;
        _ftpPassword = configuration["Ftp:Password"]!;
    }

    public async Task<string> UploadImageAsync(IFormFile imageFile, int id, string folder)
    {
        using var image = await Image.LoadAsync(imageFile.OpenReadStream());
        image.Mutate(x => x.Resize(new ResizeOptions
        {
            Size = new Size(480, 0),
            Mode = ResizeMode.Max
        }));

        var fileName = $"{id}.jpg";
        var remotePath = $"/{folder}/{fileName}";

        await UploadProcessedImageAsync(image, remotePath);
        return $"https://thumbnails.iglesialasendaantigua.com{remotePath}";
    }


    private async Task UploadProcessedImageAsync(Image image, string remotePath)
    {
        using var memoryStream = new MemoryStream();        
        await image.SaveAsJpegAsync(memoryStream, new JpegEncoder{Quality = 80});
        memoryStream.Position = 0;

        using var client = new AsyncFtpClient(_ftpHost, _ftpUsername, _ftpPassword);
        await client.Connect();
        await client.UploadStream(memoryStream, remotePath);
        await client.Disconnect();
    }

}
