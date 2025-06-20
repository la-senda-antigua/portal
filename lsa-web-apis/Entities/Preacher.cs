using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Entities;

public class Preacher
{
    [Required]    
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

}
