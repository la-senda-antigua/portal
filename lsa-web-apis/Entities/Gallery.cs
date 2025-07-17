using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace lsa_web_apis.Entities;

public class Gallery: VideoRecording
{
    [NotMapped] 
    public new Preacher? Preacher{ get; set; }
}
