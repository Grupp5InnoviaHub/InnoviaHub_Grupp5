using System;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly ApplicationDbContext _context;

    public BookingRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Booking>> GetAllAsync()
    {
        return await _context.Bookings
        .Include(b => b.Resource)
        .ToListAsync();
    }

    public async Task<Booking> GetByIdAsync(int BookingId)
    {
        var result = await _context.Bookings
        .Include(b => b.Resource)
        .FirstOrDefaultAsync(b => b.BookingId == BookingId);
        
        return result;
    }

    public async Task<IEnumerable<Booking>> GetMyBookingsAsync(string UserId)
    {
        return await _context.Bookings
        .Include(b => b.Resource)
        .Where(b => b.UserId == UserId)
        .ToListAsync();
    }

    public async Task<Booking> CreateAsync(Booking booking)
    {
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();
        return booking;
    }

    public async Task<Booking> UpdateAsync(Booking booking)
    {
        _context.Entry(booking).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return booking;
    }

    public async Task<string> CancelBookingAsync(string UserId, int BookingId, bool isAdmin = false)
    {
        var booking = _context.Bookings
        .Include(b => b.Resource)
        .FirstOrDefault(b => b.BookingId == BookingId);

        if (booking == null)
        {
            return "BookingNotFound";
        }
        else if (!isAdmin && booking.UserId != UserId)
        {
            return "BookingBelongsToOtherUser";
        }
        else if (booking.IsActive == false)
        {
            return "BookingHasExpired";
        }
        else if (booking.Resource == null)
        {
            return "Error";
        }

        booking.IsActive = false;
        booking.Resource.IsBooked = false;

        await _context.SaveChangesAsync();

        return "Success";
    }
    
    public async Task<bool> DeleteAsync(int BookingId)
    {
        var booking = await _context.Bookings.FindAsync(BookingId);
        if (booking != null)
        {
            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
            return true;
        }
        else
        {
            return false;
        }
    }
}
