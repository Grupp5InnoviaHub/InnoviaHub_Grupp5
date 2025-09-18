using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.DTOs;
using backend.Models.DTOs;
using backend.Utils;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    [Produces("application/json")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IJwtTokenManager _jwtTokenManager;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            IAdminService adminService,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IJwtTokenManager jwtTokenManager,
            ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _userManager = userManager;
            _roleManager = roleManager;
            _jwtTokenManager = jwtTokenManager;
            _logger = logger;
        }

        /// <summary>
        /// Get list of users with search and filtering capabilities
        /// </summary>
        /// <param name="searchDto">Search and filter criteria</param>
        /// <returns>List of users with pagination information</returns>
        [HttpGet("users")]
        [ProducesResponseType(typeof(PagedResultDto<AdminUserDto>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> GetUsers([FromQuery] UserSearchDto searchDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Invalid data provided",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var result = await _adminService.GetUsersAsync(searchDto);
                return Ok(new ApiResponseDto<PagedResultDto<AdminUserDto>>
                {
                    Success = true,
                    Message = "Users retrieved successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving users",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Get a specific user by ID
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>User data</returns>
        [HttpGet("users/{id}")]
        [ProducesResponseType(typeof(AdminUserDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> GetUserById(string id)
        {
            try
            {
                var user = await _adminService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "User not found",
                        Errors = new List<string> { "User not found" }
                    });
                }

                return Ok(new ApiResponseDto<AdminUserDto>
                {
                    Success = true,
                    Message = "User retrieved successfully",
                    Data = user
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by ID: {UserId}", id);
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving user",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Create a new user
        /// </summary>
        /// <param name="createUserDto">New user data</param>
        /// <returns>Created user data</returns>
        [HttpPost("users")]
        [ProducesResponseType(typeof(AdminUserDto), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto createUserDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Invalid data provided",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var result = await _adminService.CreateUserAsync(createUserDto);
                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return CreatedAtAction(nameof(GetUserById), new { id = result.Data!.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while creating user",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Update user data
        /// </summary>
        /// <param name="id">User ID</param>
        /// <param name="updateUserDto">Updated user data</param>
        /// <returns>Updated user data</returns>
        [HttpPut("users/{id}")]
        [ProducesResponseType(typeof(AdminUserDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Invalid data provided",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var result = await _adminService.UpdateUserAsync(id, updateUserDto);
                if (!result.Success)
                {
                    return result.Data == null ? NotFound(result) : BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user: {UserId}", id);
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while updating user",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateRoleDto updateRoleDto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound("User not found");

            // Check if role exists
            var roleExists = await _roleManager.RoleExistsAsync(updateRoleDto.Role);
            if (!roleExists)
                return BadRequest("Role does not exist");

            // Remove current roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            if (currentRoles.Any())
            {
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
            }

            // Add new role
            await _userManager.AddToRoleAsync(user, updateRoleDto.Role);

            // Update user role
            user.Role = updateRoleDto.Role;
            user.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new
            {
                message = "User role updated successfully",
                user = new
                {
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.Role,
                    user.IsActive,
                    user.UpdatedAt
                }
            });
        }

        [HttpPut("users/{id}/status")]
        public async Task<IActionResult> UpdateUserStatus(string id, [FromBody] UpdateStatusDto updateStatusDto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound("User not found");

            user.IsActive = updateStatusDto.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new
            {
                message = "User status updated successfully",
                user = new
                {
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.Role,
                    user.IsActive,
                    user.UpdatedAt
                }
            });
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                    return NotFound(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "User not found"
                    });

                var result = await _userManager.DeleteAsync(user);
                if (!result.Succeeded)
                    return BadRequest(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Failed to delete user",
                        Errors = result.Errors.Select(e => e.Description).ToList()
                    });

                return Ok(new ApiResponseDto<object>
                {
                    Success = true,
                    Message = "User deleted successfully",
                    Data = null
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while deleting the user",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetAllRoles()
        {
            var roles = await _roleManager.Roles
                .Select(r => new { r.Id, r.Name })
                .ToListAsync();

            return Ok(roles);
        }

        [HttpPost("roles")]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto createRoleDto)
        {
            if (await _roleManager.RoleExistsAsync(createRoleDto.Name))
                return BadRequest("Role already exists");

            var role = new IdentityRole(createRoleDto.Name);
            var result = await _roleManager.CreateAsync(role);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new
            {
                message = "Role created successfully",
                role = new { role.Id, role.Name }
            });
        }

        /// <summary>
        /// Get main dashboard data
        /// </summary>
        /// <returns>Dashboard statistics and data</returns>
        [HttpGet("dashboard")]
        [ProducesResponseType(typeof(AdminDashboardDto), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var dashboardData = await _adminService.GetDashboardDataAsync();

                return Ok(new ApiResponseDto<AdminDashboardDto>
                {
                    Success = true,
                    Message = "Dashboard data retrieved successfully",
                    Data = dashboardData
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard data: {Message}", ex.Message);
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving dashboard data",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Get booking statistics
        /// </summary>
        /// <returns>Detailed booking statistics</returns>
        [HttpGet("bookings/stats")]
        [ProducesResponseType(typeof(BookingStatsDto), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> GetBookingStats()
        {
            try
            {
                var stats = await _adminService.GetBookingStatsAsync();
                return Ok(new ApiResponseDto<BookingStatsDto>
                {
                    Success = true,
                    Message = "Booking statistics retrieved successfully",
                    Data = stats
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting booking stats");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving booking statistics",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Get list of bookings with search and filtering capabilities
        /// </summary>
        /// <param name="searchDto">Search and filter criteria</param>
        /// <returns>List of bookings with pagination information</returns>
        [HttpGet("bookings")]
        [ProducesResponseType(typeof(PagedResultDto<AdminBookingDto>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> GetBookings([FromQuery] BookingSearchDto searchDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Invalid data provided",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var result = await _adminService.GetBookingsAsync(searchDto);
                return Ok(new ApiResponseDto<PagedResultDto<AdminBookingDto>>
                {
                    Success = true,
                    Message = "Bookings retrieved successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bookings");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving bookings",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Cancel a booking
        /// </summary>
        /// <param name="bookingId">Booking ID</param>
        /// <param name="reason">Cancellation reason</param>
        /// <returns>Operation result</returns>
        [HttpPost("bookings/{bookingId}/cancel")]
        [ProducesResponseType(typeof(ApiResponseDto<bool>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> CancelBooking(int bookingId, [FromBody] string reason)
        {
            try
            {
                var result = await _adminService.CancelBookingAsync(bookingId, reason);
                if (!result.Success)
                {
                    return result.Data == false ? NotFound(result) : BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling booking: {BookingId}", bookingId);
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while cancelling booking",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Clean up expired bookings
        /// </summary>
        /// <returns>Operation result</returns>
        [HttpPost("system/cleanup")]
        [ProducesResponseType(typeof(ApiResponseDto<bool>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> CleanupExpiredBookings()
        {
            try
            {
                var result = await _adminService.CleanupExpiredBookingsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up expired bookings");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while cleaning up expired bookings",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Get system logs
        /// </summary>
        /// <param name="count">Number of logs requested</param>
        /// <returns>List of system logs</returns>
        [HttpGet("system/logs")]
        [ProducesResponseType(typeof(List<string>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> GetSystemLogs([FromQuery] int count = 100)
        {
            try
            {
                var logs = await _adminService.GetSystemLogsAsync(count);
                return Ok(new ApiResponseDto<List<string>>
                {
                    Success = true,
                    Message = "System logs retrieved successfully",
                    Data = logs
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting system logs");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving system logs",
                    Errors = new List<string> { ex.Message }
                });
            }
        }


        /// <summary>
        /// Get all resources with pagination
        /// </summary>
        /// <param name="page">Page number</param>
        /// <param name="pageSize">Page size</param>
        /// <returns>List of resources</returns>
        [HttpGet("resources")]
        [ProducesResponseType(typeof(ApiResponseDto<PagedResultDto<AdminResourceDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> GetResources(int page = 1, int pageSize = 10)
        {
            try
            {
                var result = await _adminService.GetResourcesAsync(page, pageSize);
                return Ok(new ApiResponseDto<PagedResultDto<AdminResourceDto>>
                {
                    Success = true,
                    Message = "Resources retrieved successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resources");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while getting resources",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Get all resource types
        /// </summary>
        /// <returns>List of resource types</returns>
        [HttpGet("resource-types")]
        [ProducesResponseType(typeof(ApiResponseDto<List<ResourceTypeDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> GetResourceTypes()
        {
            try
            {
                var result = await _adminService.GetResourceTypesAsync();
                return Ok(new ApiResponseDto<List<ResourceTypeDto>>
                {
                    Success = true,
                    Message = "Resource types retrieved successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource types");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while getting resource types",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Get a specific resource by ID
        /// </summary>
        /// <param name="id">Resource ID</param>
        /// <returns>Resource data</returns>
        [HttpGet("resources/{id}")]
        [ProducesResponseType(typeof(ApiResponseDto<AdminResourceDto>), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> GetResourceById(int id)
        {
            try
            {
                var resource = await _adminService.GetResourceByIdAsync(id);
                if (resource == null)
                {
                    return NotFound(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Resource not found",
                        Errors = new List<string> { "Resource not found" }
                    });
                }

                return Ok(new ApiResponseDto<AdminResourceDto>
                {
                    Success = true,
                    Message = "Resource retrieved successfully",
                    Data = resource
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource by ID: {ResourceId}", id);
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving resource",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Create a new resource
        /// </summary>
        /// <param name="createResourceDto">New resource data</param>
        /// <returns>Created resource data</returns>
        [HttpPost("resources")]
        [ProducesResponseType(typeof(ApiResponseDto<AdminResourceDto>), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> CreateResource([FromBody] CreateResourceDto createResourceDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Invalid data provided",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var result = await _adminService.CreateResourceAsync(createResourceDto);
                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return CreatedAtAction(nameof(GetResourceById), new { id = result.Data!.ResourceId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating resource");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while creating resource",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Update resource data
        /// </summary>
        /// <param name="id">Resource ID</param>
        /// <param name="updateResourceDto">Updated resource data</param>
        /// <returns>Updated resource data</returns>
        [HttpPut("resources/{id}")]
        [ProducesResponseType(typeof(ApiResponseDto<AdminResourceDto>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> UpdateResource(int id, [FromBody] UpdateResourceDto updateResourceDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Invalid data provided",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var result = await _adminService.UpdateResourceAsync(id, updateResourceDto);
                if (!result.Success)
                {
                    return result.Data == null ? NotFound(result) : BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating resource: {ResourceId}", id);
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while updating resource",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Delete a resource
        /// </summary>
        /// <param name="id">Resource ID</param>
        /// <returns>Operation result</returns>
        [HttpDelete("resources/{id}")]
        [ProducesResponseType(typeof(ApiResponseDto<bool>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> DeleteResource(int id)
        {
            try
            {
                var result = await _adminService.DeleteResourceAsync(id);
                if (!result.Success)
                {
                    return result.Data == false ? NotFound(result) : BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting resource: {ResourceId}", id);
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while deleting resource",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Logout admin user
        /// </summary>
        /// <returns>Logout confirmation</returns>
        [HttpPost("auth/logout")]
        [ProducesResponseType(typeof(ApiResponseDto<object>), 200)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> Logout()
        {
            try
            {
                _logger.LogInformation("Admin user logout");
                
                // In a real application, you might want to:
                // 1. Add the token to a blacklist
                // 2. Log the logout event
                // 3. Clear any server-side sessions
                
                return Ok(new ApiResponseDto<object>
                {
                    Success = true,
                    Message = "Logged out successfully",
                    Data = null,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred during logout",
                    Errors = new List<string> { ex.Message },
                    Timestamp = DateTime.UtcNow
                });
            }
        }
    }
}
