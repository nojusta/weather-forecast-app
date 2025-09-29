using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using server.Models;

namespace server.Services
{
    public class AuthService
    {
        private readonly IConfiguration _configuration;
        private readonly List<User> _users; // In-memory storage for simplicity

        public AuthService(IConfiguration configuration)
        {
            _configuration = configuration;
            _users = new List<User>(); // Replace with database later
        }

                public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
        {
            return await Task.Run(() =>
            {
                if (string.IsNullOrEmpty(request.Username) || 
                    string.IsNullOrEmpty(request.Email) || 
                    string.IsNullOrEmpty(request.Password))
                {
                    return (AuthResponse?)null;
                }
        
                if (_users.Any(u => u.Email == request.Email))
                {
                    return (AuthResponse?)null;
                }
        
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        
                var user = new User
                {
                    Id = _users.Count + 1,
                    Username = request.Username,
                    Email = request.Email,
                    PasswordHash = passwordHash
                };
        
                _users.Add(user);
        
                var token = GenerateJwtToken(user);
                return new AuthResponse
                {
                    Token = token,
                    Username = user.Username,
                    Email = user.Email
                };
            });
        }
        
        public async Task<AuthResponse?> LoginAsync(LoginRequest request)
        {
            return await Task.Run(() =>
            {
                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    return (AuthResponse?)null;
                }
        
                var user = _users.FirstOrDefault(u => u.Email == request.Email);
                if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    return (AuthResponse?)null;
                }
        
                var token = GenerateJwtToken(user);
                return new AuthResponse
                {
                    Token = token,
                    Username = user.Username,
                    Email = user.Email
                };
            });
        }
        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration["Jwt:SecretKey"] ?? "your-super-secret-key-that-is-at-least-32-characters-long"));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? "weather-app",
                audience: _configuration["Jwt:Audience"] ?? "weather-app-users",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}