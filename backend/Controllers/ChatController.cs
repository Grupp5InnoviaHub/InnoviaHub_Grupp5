using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;
using backend.Services;
using System.Security.Claims;
using backend.Models.DTOs;


namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ApplicationDbContext _dbContext;
        private readonly IBookingService _bookingService;

        public ChatController(IHttpClientFactory httpClientFactory, ApplicationDbContext dbContext, IBookingService bookingService)
        {
            _httpClientFactory = httpClientFactory;
            _dbContext = dbContext;
            _bookingService = bookingService;
        }

        //Snabbt sätt att skapa ett DTO som vi kan använda
        public record ChatRequest(string question);

        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.question))
            {
                return BadRequest("Invalid request payload. Expected JSON: { \"question\": \"text\" }");
            }

            if (string.IsNullOrWhiteSpace(request.question))
                return BadRequest("Question cannot be empty.");

            
            var userId = "aa158c47-960e-4099-a716-79c842abb53a"; // Temporär hårdkodad användare för testning
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not found or not logged in.");


            //Read from database to get resources
            var resources = await _dbContext.Resources.ToListAsync();

            //Create summery for AI
            var summery = string.Join("\n", resources.Select(r =>
                $"{r.Name} (Type ID: {r.ResourceTypeId}) - {(r.IsBooked ? "Booked" : "Available")}"));


            //System prompt
            var systemPrompt = """
                You are a resource booking assistant.
                If the user asks to create a booking, respond ONLY with JSON like this:

                {
                "action": "create_booking",
                "parameters": {
                    "resourceId": <integer>,
                    "bookingDate": "YYYY-MM-DD",
                    "timeslot": "FM" or "EF"
                }
                }

                Rules:
                1. "FM" represents the morning slot (08:00-12:00).
                2. "EF" represents the afternoon slot (12:00-16:00).
                3. Always use "FM" or "EF" — never a specific clock time.
                4. If the user doesn’t specify morning or afternoon, choose the slot logically based on context.
                5. Respond ONLY in JSON as shown above; do not include explanatory text.

                Example:
                User: "Book the projector for tomorrow morning"
                AI should respond:

                {
                "action": "create_booking",
                "parameters": {
                    "resourceId": 2,
                    "bookingDate": "2025-10-10",
                    "timeslot": "FM"
                }
                }

                Otherwise, if the user asks a general question not related to booking, respond with plain text.
                """;

            //Send to OpenAI
            var http = _httpClientFactory.CreateClient("openai");

            var body = new
            {
                model = "gpt-4.1-mini",
                input = new[]
                {
                    new {role = "system", content = systemPrompt },
                    new { role = "system", content = "You are a helpful assistant that helps users find resources based on a list of resources you have access to. If the user asks for something not in the list, respond with 'I'm sorry, I don't have information on that topic.'." },
                    new { role = "user", content = $"Here is the list of resources:\n{summery}\nUser asked: {request.question}" }
                },                
            };

            var content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
            var response = await http.PostAsync("responses", content); 
            var raw = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return BadRequest("Något gick fel");
            }

            var doc = JsonDocument.Parse(raw);
            var root = doc.RootElement;
            string reply = root.GetProperty("output")[0].GetProperty("content")[0].GetProperty("text").GetString() ?? "Inget svar";

            try
            {
                var parsed = JsonDocument.Parse(reply!);
                Console.WriteLine("Parsed element: " + parsed.RootElement);

                if (parsed.RootElement.TryGetProperty("action", out var action) &&
                    action.GetString() == "create_booking")
                {
                    var parameters = parsed.RootElement.GetProperty("parameters");
                    var bookingDto = new BookingDTO
                    {
                        ResourceId = parameters.GetProperty("resourceId").GetInt32(),
                        BookingDate = parameters.GetProperty("bookingDate").GetString() ?? "",
                        Timeslot = parameters.GetProperty("timeslot").GetString() ?? ""
                    };

                    try
                    {
                        var createdBooking = await _bookingService.CreateAsync(userId, bookingDto);

                        return Ok(new
                        {
                            success = true,
                            message = $"Booking created successfully for resource ID {bookingDto.ResourceId}.",
                            booking = createdBooking
                        });
                    }
                    catch (Exception ex)
                    {
                        // Log full error details for developers
                        Console.WriteLine($"❌ Booking creation error: {ex}");

                        // Return a clean, user-friendly response
                        return Conflict(new
                        {
                            success = false,
                            message = "Booking could not be completed.",
                            error = ex.Message // safe to return since your service uses meaningful errors
                        });
                    }
                }
                // No recognizable action
                return Ok(new
                {
                    success = true,
                    message = reply
                });
            }
            catch (JsonException jex)
            {
                Console.WriteLine($"❌ JSON parsing error: {jex}");
                return BadRequest(new
                {
                    success = false,
                    message = "Failed to parse AI response — invalid JSON structure.",
                    error = jex.Message
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Unexpected error: {ex}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "An unexpected error occurred while processing the AI response.",
                    error = ex.Message
                });
            }

            

            return Ok(new
            {
                question = request.question,
                answer = reply
            });
        }
    }
}