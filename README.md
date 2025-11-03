# CrossBox

```text
This isn't the final readme and is subjected to change.
```

CrossBox is an AI-powered platform that removes friction from file sharing, submission, and intake for learning ecosystems. It solves the "two‑sided nightmare" created by incompatible file formats and heavy, unusable uploads by proactively converting and validating files at intake — before they ever create problems for learners or platforms.

- For client/user (B2C): an instant web app to make any file universally openable and portal-compliant.
- For platforms (B2B): an Intake API that validates, normalizes, and enforces submission requirements automatically at upload.

This README explains what CrossBox is, why it matters, how the product is structured, and how to integrate with the Intake API.

Table of contents
- Vision
- Key problems solved
- Product overview
  - CrossBox Web App (B2C)
  - CrossBox Intake API (B2B)
- How it works (high level)
- Core features
- Architecture & scalability
- API quickstart (examples)
- Integration patterns
- Security & privacy
- Deployment & running locally
- Roadmap
- Contributing
- License & contact

Vision
------
Enable frictionless, secure, and cost-efficient sharing and submission of learner-created work by making every file instantly usable and compliant — anywhere.

Key problems solved
-------------------
- People: incompatible formats (.HEIC, .MOV, .M4A, etc.), portal rules, high frustration and wasted time.
- Platforms: terabytes of unused/incompatible uploads, high support costs, storage and bandwidth waste, poor data quality.
- Both sides: friction from “walled garden” ecosystems and manual conversions.

Product overview
----------------

CrossBox Web App (B2C)
- Free instant web tool for learners and collaborators.
- "Share" — upload any file; CrossBox converts it into a universally-compatible version automatically and provides a shareable link.
- "Prep" — upload a file and pick a portal preset (Passport size, assignment template); CrossBox outputs a portal-compliant file (format, metadata, filename, size, codec) ready for submission.
- Purpose: reduce user friction, serve as a marketing funnel for the Intake API.

CrossBox Intake API (B2B)
- A B2B API designed for platforms, universities, and form based portals.
- Validates files on upload, enforces rules, normalizes formats, strips extraneous data, compresses or transcodes as needed, and returns a sanitized canonical artifact.
- Primary revenue engine: usage-based or tiered pricing for conversion/validation volume, SLA, and advanced features.

How it works (high level)
-------------------------
1. Upload arrives (user or system).
2. Requirement Parser (AI): reads human-defined requirements or portal presets and transforms them into machine-readable rules (format, codec, size, metadata rules).
3. Analyzer (AI + heuristics): inspects incoming file for format, codecs, container, dimensions, audio channels, metadata, suspicious content.
4. Transformer: transcodes/repacks images, audio, and video to target formats; performs frame-rate/bitrate resizing and container changes; converts HEIC to JPEG/PNG, MOV/heavy codecs to MP4/H.264 or H.265 depending on target device rules.
5. Validator & Policy Enforcer: checks file vs. rules and returns pass/fail plus diagnostics and a compliant artifact.
6. Delivery: serves the best-fit file to the receiver’s device automatically (proactive conversion vs. passive storage).

Core features
-------------
- Universal conversion (proactive server-side transcode & repack).
- Presets and portal presets (LMS, assignment specs, conferences).
- AI Requirement Parser: human text → machine rules.
- Compliance validation with detailed diagnostics.
- Share links with device-aware delivery (serve a different encoded file depending on client).
- Metadata stripping and sanitization.
- Serverless, auto-scaling architecture (MVP built 100% serverless).
- B2B SLA, webhooks, and integration SDKs.

Architecture & scalability
--------------------------
- Serverless foundation for infinite scalability and predictable cost curves (example functions: ingest, analyze, transform, validate).
- Storage: object store for canonical artifacts (with lifecycle policies to control retention).
- Queueing: event-driven processing (upload -> job queue -> workerless transformation).
- AI: a requirement parser + lightweight models / rules engine to convert natural language requirements to formal validation checks.
- CDN + device-detection for intelligent delivery of the best-fit artifact.
- Observability: logs, metrics, and alerts for throughput, conversion duration, error rates.
- Cost control: proactive conversion reduces stored unusable files, cutting storage and bandwidth by >90% in target scenarios.

## API quickstart 
_to be defined_

<!--
-------------------------
Note: the following request/response examples are illustrative. Replace base_url and API keys with your environment values.

1) Basic intake upload (multipart)
curl:
curl -X POST "https://api.crossbox.example/v1/intake/upload" \
  -H "Authorization: Bearer $CROSSBOX_API_KEY" \
  -F "file=@/path/to/submission.mov" \
  -F "preset=university-lms-default" \
  -F "metadata={\"studentId\":\"s12345\",\"assignmentId\":\"a7\"}"

Response (success):
{
  "uploadId": "upl_01F...",
  "status": "processing",
  "estimated_completion_seconds": 12,
  "webhook_on_complete": true
}

2) Check status
GET https://api.crossbox.example/v1/intake/uploads/upl_01F...
Headers: Authorization: Bearer $CROSSBOX_API_KEY

Response:
{
  "uploadId": "upl_01F...",
  "status": "completed",
  "result": {
    "valid": true,
    "reason": null,
    "canonicalFile": {
      "url": "https://cdn.crossbox.example/artifacts/art_01F....mp4",
      "format": "mp4",
      "size_bytes": 5_242_123,
      "duration_seconds": 63
    },
    "originalFile": {
      "filename": "phone.mov",
      "format": "mov",
      "size_bytes": 48_912_912
    },
    "transformation_steps": [
      "mov (h.265) -> mp4 (h.264)",
      "resize 4k -> 1080p",
      "strip EXIF"
    ]
  }
}

3) Webhook (on completion)
POST to your webhook endpoint:
{
  "uploadId": "upl_01F...",
  "status": "completed",
  "valid": true,
  "canonicalFile": {
    "url": "https://cdn.crossbox.example/artifacts/art_01F....mp4",
    "format": "mp4"
  }
}

-->
Integration patterns
--------------------
- LMS integration: call Intake API directly from the LMS upload flow; return canonical URL for storage and grading.
- Pre-submission validation: integrate CrossBox into client-side submission flows (button that “Prep for Portal”) — reduces support tickets.
- Bulk imports: run historical ingestion jobs on legacy student submissions to normalize archives and reduce storage.
- Webhooks: subscribe to completion events to trigger grading pipelines, virus scanning, or archival.

B2C usage
--------
- Learners use the CrossBox web app for instant conversion and portal prepping. This reduces user frustration and acts as a user acquisition funnel for the Intake API.

Security & privacy
------------------
- Files are processed in a secure, ephemeral environment; originals can be optionally retained or auto-pruned by policy.
- TLS in transit; server-side encryption at rest for stored artifacts.
- Option to disable retention or retain only canonical artifacts to reduce PII/exif leakage.
- Role-based access controls for API keys and webhooks.
- Data retention policies configurable per-organization.
- Compliance: design supports GDPR data subject requests; integration teams should apply their policies.

Deployment & running locally
---------------------------
The MVP is serverless. Typical components:
- Object store (S3-compatible)
- Serverless compute (AWS Lambda / Cloud Functions)
- Queue (SQS / PubSub)
- CDN (CloudFront)
- Managed AI components (or model endpoints)

Local development:
- Use localstack or a dev configuration to emulate object storage and queues.
- Run a lightweight HTTP service that mimics the Intake API for integration tests.
- Example environment variables:
  - CROSSBOX_STORAGE_BUCKET
  - CROSSBOX_API_KEY
  - CROSSBOX_WEBHOOK_SECRET

Roadmap
-------
Short term
- Harden Intake API (rate limits, consumption plans).
- Add more portal presets (Brightspace, Canvas, Moodle, Turnitin).
- Expand device-aware delivery rules.
- Improve AI Requirement Parser accuracy.

Medium term
- SDKs (Node, Python, Java) for faster integration.
- Admin dashboard for presets, quotas, and usage analytics.
- Plugin for popular LMSs (Canvas/Blackboard).

Long term
- Offline/edge conversion where appropriate.
- Advanced security features: DLP, automated PII redaction.
- Enterprise features: SSO, organization hierarchy, billing portals.

Business model
--------------
- B2B Intake API: primary revenue engine — usage-based pricing (per conversion/validation), premium SLAs, and enterprise features.
- B2C Web App: free, marketing-first channel to drive adoption and signups for institutional integrations.
<!--
Contributing
------------
We welcome contributions:
- File issues for bugs, feature requests, or portal presets.
- Fork, make changes on a feature branch, and open a pull request.
- Include tests and update docs when relevant.

Security disclosures
--------------------
If you discover a security issue, please contact security@crossbox.example (or the project's security contact) with details. Do not open public issues exposing sensitive details.

License
-------
Specify your license here (e.g., MIT, Apache-2.0). If you want CrossBox to be proprietary, update accordingly.

Contact
-------
Project: CrossBox
Maintainer: Team Pixel Weavers
<!--Email: hello@crossbox.example (replace with your contact) 
Website / Demo: https://crossbox.example (replace with actual) 

Acknowledgements
----------------
Built to reduce friction for learners and platforms alike. MVP success shows feasibility of proactive, serverless, AI-first conversion at scale.

---
For API clients, SDKs, and portal preset templates, see the docs/ directory (or visit your CrossBox developer portal). If you'd like, I can generate example SDK snippets (Node/Python) and an OpenAPI spec for the Intake API next.

-->
