using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Booking
{
    public int BookingId { get; set; }
    public bool IsActive { get; set; }
    public DateTime BookingDate { get; set; }
    public DateTime EndDate { get; set; }
    [NotMapped]
    public string Timeslot { get; set; } = default!;

    [ForeignKey("UserId")]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    [ForeignKey("ResourceId")]
    public Resource? Resource { get; set; }
    public int ResourceId { get; set; }
}
