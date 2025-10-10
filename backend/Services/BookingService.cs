using System;
using backend.Data;
using backend.Models;
using backend.Repositories;
using backend.Models.DTOs;
using Microsoft.AspNetCore.SignalR;
using backend.Hubs;
using backend.Models.DTOs.Resource;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _repository;
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<BookingHub> _hubContext;
        private readonly IResourceService _resourceService;

        public BookingService(
            IBookingRepository repository,
            ApplicationDbContext context,
            IHubContext<BookingHub> hubContext,
            IResourceService resourceService)
        {
            _repository = repository;
            _context = context;
            _hubContext = hubContext;
            _resourceService = resourceService;
        }

        //Get all bookings
        public async Task<IEnumerable<Booking>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        //Get booking by ID
        public async Task<Booking?> GetByIdAsync(int BookingId)
        {
            return await _repository.GetByIdAsync(BookingId);
        }

        //Get bookings for the current user
        public async Task<IEnumerable<Booking>> GetMyBookingsAsync(string UserId, bool includeExpiredBookings)
        {
            return await _repository.GetMyBookingsAsync(UserId, includeExpiredBookings);
        }

        //Get all bookings for a resource
        public async Task<IEnumerable<GetResourceBookingsDTO>> GetResourceBookingsAsync(int resourceId, bool includeExpiredBookings)
        {
            return await _repository.GetResourceBookingsAsync(resourceId, includeExpiredBookings);
        }

        //Creates a new booking 
        public async Task<Booking> CreateAsync(string userId, BookingDTO dto)
        {
            var resource = await _resourceService.GetByIdAsync(dto.ResourceId);
            if (resource == null) throw new Exception("Resource doesnt exist");

            if (dto.Timeslot != "FM" && dto.Timeslot != "EF") throw new Exception("No timeslot specified");

            //Checks the date
            if (!DateTime.TryParse(dto.BookingDate, out var localDate))
                throw new Exception("Invalid date format");

            //Start and end times based on FM/EF
            var startLocal = dto.Timeslot == "FM" ? localDate.Date.AddHours(8) : localDate.Date.AddHours(12);
            var endLocal   = dto.Timeslot == "FM" ? localDate.Date.AddHours(12) : localDate.Date.AddHours(16);

            //Convert to UTC time
            var startUtc = startLocal.ToUniversalTime();
            var endUtc   = endLocal.ToUniversalTime();

            //Check if timeslot already booked
            var conflict = await _context.Bookings.AnyAsync(b =>
                b.ResourceId == dto.ResourceId &&
                b.IsActive &&
                b.BookingDate == startUtc &&
                b.EndDate == endUtc
            );
            if (conflict) throw new Exception("Timeslot already booked");

            //Save booking
            var booking = new Booking
            {
                IsActive = true,
                BookingDate = startUtc,
                EndDate = endUtc,
                UserId = userId,
                ResourceId = dto.ResourceId,
                Timeslot = dto.Timeslot
            };
            
            var created = await _repository.CreateAsync(booking);
            
            await _hubContext.Clients.All.SendAsync("Booking created", created);
            return created;
        }

        //Update booking
        public async Task<Booking?> UpdateAsync(Booking booking)
        {
            var updated = await _repository.UpdateAsync(booking);
            if (updated != null)
            {
                await _hubContext.Clients.All.SendAsync("Booking updated", updated);
            }
            return updated;
        }

        //Cancel booking
        public async Task<Booking?> CancelBookingAsync(string userId, bool isAdmin, int bookingId)
        {
            var booking = await _repository.CancelBookingAsync(userId, isAdmin, bookingId);
            if (booking != null)
            {
                await _hubContext.Clients.All.SendAsync("Booking cancelled", booking);
            }
            return booking;
        }

        //Delete booking permanently
        public async Task<Booking?> DeleteAsync(int bookingId)
        {
            var booking = await _repository.DeleteAsync(bookingId);
            if (booking != null)
            {
                var resource = await _context.Resources.FindAsync(booking.ResourceId);
                if (resource != null)
                {
                    resource.IsBooked = false;
                    await _hubContext.Clients.All.SendAsync("Resource updated", resource);
                }

                await _hubContext.Clients.All.SendAsync("Booking deleted", booking);
            }
            return booking;
        }
    }
}