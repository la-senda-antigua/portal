using System;
using lsa_web_apis.Entities;
using lsa_web_apis.Models;

namespace lsa_web_apis.Services;

public interface IAuthService
{
    Task<User?> RegisterAsync(UserDto request);
    Task<string> LoginAsync(UserDto request);
}
