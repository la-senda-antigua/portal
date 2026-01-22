using System.ComponentModel.DataAnnotations;

namespace lsa_web_apis.Models;

public class RegisterWithPasswordDto
{
    [Required]
    public string Username { get; set; } = string.Empty;
    [Required]
    public string Password { get; set; } = string.Empty;
    [Required]
    public string Role { get; set; } = string.Empty;
    public string? Name { get; set; }
}