using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace BookSearchAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public BooksController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [AllowAnonymous]
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string? title = null, [FromQuery] string? author = null)
        {
            if (string.IsNullOrWhiteSpace(title) && string.IsNullOrWhiteSpace(author))
                return BadRequest("You must specify at least a title or an author.");

            // Build the query string
            string query = "";
            if (!string.IsNullOrWhiteSpace(title))
                query += $"intitle:{title}";
            if (!string.IsNullOrWhiteSpace(author))
            {
                if (!string.IsNullOrEmpty(query)) query += "+";
                query += $"inauthor:{author}";
            }

            var client = _httpClientFactory.CreateClient();

            // Call Google Books API
            var response = await client.GetAsync($"https://www.googleapis.com/books/v1/volumes?q={query}");
            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, "Error fetching data from Google Books API.");

            var json = await response.Content.ReadAsStringAsync();
            var jsonDoc = JsonDocument.Parse(json);
            var root = jsonDoc.RootElement;

            if (!root.TryGetProperty("items", out var items))
                return Ok(new List<object>()); // No books found

            bool isAuthenticated = User.Identity?.IsAuthenticated ?? false;

            var results = new List<object>();

            foreach (var item in items.EnumerateArray())
            {
                var volumeInfo = item.GetProperty("volumeInfo");

                var titleValue = volumeInfo.GetProperty("title").GetString();
                var authors = volumeInfo.TryGetProperty("authors", out var authorElement)
                    ? authorElement.EnumerateArray().Select(a => a.GetString()).ToArray()
                    : new string[] { "Unknown Author" };

                var book = new
                {
                    Title = titleValue,
                    Authors = authors,
                    Description = isAuthenticated && volumeInfo.TryGetProperty("description", out var desc)
                        ? desc.GetString()
                        : "Login to view full description.",
                    PageCount = isAuthenticated && volumeInfo.TryGetProperty("pageCount", out var pc)
                        ? pc.GetInt32()
                        : (int?)null,
                    PublishedDate = volumeInfo.TryGetProperty("publishedDate", out var pd)
                        ? pd.GetString()
                        : null,
                    InfoLink = volumeInfo.TryGetProperty("infoLink", out var infoLink)
                        ? infoLink.GetString()
                        : null
                };

                results.Add(book);
            }

            return Ok(results);
        }
    }
}
