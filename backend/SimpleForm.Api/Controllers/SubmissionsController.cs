using Microsoft.AspNetCore.Mvc;
using SimpleForm.Api.Models;
using SimpleForm.Api.Services;

namespace SimpleForm.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubmissionsController : ControllerBase
{
    private readonly SubmissionService _submissionService;

    public SubmissionsController(SubmissionService submissionService)
    {
        _submissionService = submissionService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SubmissionResponse>>> GetRecent(
        CancellationToken cancellationToken)
    {
        var submissions = await _submissionService.GetRecentAsync(cancellationToken);

        return Ok(submissions.Select(submission => new SubmissionResponse
        {
            Message = $"Submission salvat la {submission.CreatedAtUtc:u}",
            FirstName = submission.FirstName,
            LastName = submission.LastName
        }).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<SubmissionResponse>> Create(
        [FromBody] SubmissionCreateRequest request,
        CancellationToken cancellationToken)
    {
        var submission = new Submission
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        await _submissionService.CreateAsync(submission, cancellationToken);

        return Ok(new SubmissionResponse
        {
            Message = $"Salut, {submission.FirstName} {submission.LastName}! Datele au fost salvate cu succes.",
            FirstName = submission.FirstName,
            LastName = submission.LastName
        });
    }
}
