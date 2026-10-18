
using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace DeskFlow.Api.Tests;

public class AuthenticationTests
{
    [Fact]
    public async Task Login_WithoutCredentials_ReturnsBadRequest()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var response = await client.PostAsync(
            "/api/Auth/login",
            new StringContent(
                "{}",
                System.Text.Encoding.UTF8,
                "application/json"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
