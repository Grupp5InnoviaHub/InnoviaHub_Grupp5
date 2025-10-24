using System;
using backend.Data;
using backend.Hubs;
using backend.Models;
using backend.Models.DTOs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<BookingHub> _hubContext;

        public BookingRepository(ApplicationDbContext context, IHubContext<BookingHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        //Get all bookings with resources
        public async Task<IEnumerable<Booking>> GetAllAsync()
        {
            return await _context.Bookings
                .Include(b => b.Resource)
                .ToListAsync();
        }

        //Get a booking by id
        public async Task<Booking?> GetByIdAsync(int BookingId)
        {
            return await _context.Bookings
                .Include(b => b.Resource)
                .FirstOrDefaultAsync(b => b.BookingId == BookingId);
        }

        //Get bookings belonging to a specific user
        public async Task<IEnumerable<Booking>> GetMyBookingsAsync(string UserId, bool includeExpiredBookings = false)
        {
            var query = _context.Bookings
                .Include(b => b.Resource)
                .Where(b => b.UserId == UserId);

            if (!includeExpiredBookings)
            {
                var now = DateTime.UtcNow;
                query = query.Where(b => b.EndDate > now);
            }

            return await query.ToListAsync();
        }

        //Get booking dates for a resource
        public async Task<IEnumerable<GetResourceBookingsDTO>> GetResourceBookingsAsync(int resourceId, bool includeExpiredBookings = false)
        {
            var query = _context.Bookings
                .Where(b => b.ResourceId == resourceId)
                .Select(b => new GetResourceBookingsDTO { BookingDate = b.BookingDate, EndDate = b.EndDate });

            if (!includeExpiredBookings)
            {
                var currentTime = DateTime.UtcNow;
                query = query.Where(b => currentTime < b.EndDate);
            }

            return await query.ToListAsync();
        }

        //Create new booking and save to database
        public async Task<Booking> CreateAsync(Booking booking)
        {            
            _context.Bookings.Add(booking);            
            await _context.SaveChangesAsync(); 
            return booking;
        }

        //Update an existing booking
        public async Task<Booking> UpdateAsync(Booking booking)
        {
            _context.Entry(booking).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return booking;
        }

        //Cancel a booking
        public async Task<Booking?> CancelBookingAsync(string userId, bool isAdmin, int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Resource)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null) return null;
            if (!isAdmin && booking.UserId != userId) return null;

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("BookingCancelled", booking);
            return booking;
        }

        //Delete booking permanently
        public async Task<Booking?> DeleteAsync(int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Resource)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null) return null;

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("BookingDeleted", booking);
            return booking;
        }
    }
}