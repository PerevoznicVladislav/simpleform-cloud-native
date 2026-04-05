using Microsoft.Extensions.Options;
using MongoDB.Driver;
using SimpleForm.Api.Models;

namespace SimpleForm.Api.Services;

public class SubmissionService
{
    private readonly IMongoCollection<Submission> _submissions;

    public SubmissionService(IOptions<MongoDbSettings> mongoDbSettings)
    {
        var settings = mongoDbSettings.Value;
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _submissions = database.GetCollection<Submission>(settings.CollectionName);
    }

    public async Task CreateAsync(Submission submission, CancellationToken cancellationToken)
    {
        await _submissions.InsertOneAsync(submission, cancellationToken: cancellationToken);
    }

    public async Task<List<Submission>> GetRecentAsync(CancellationToken cancellationToken)
    {
        return await _submissions
            .Find(FilterDefinition<Submission>.Empty)
            .SortByDescending(submission => submission.CreatedAtUtc)
            .Limit(20)
            .ToListAsync(cancellationToken);
    }
}
