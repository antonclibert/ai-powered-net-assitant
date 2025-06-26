# S3Guard Lambda

This Lambda function scans all S3 buckets in the account and records whether each bucket is public or private. If a bucket becomes public compared to the last recorded state, a notification is sent via SNS.

## Environment Variables

- `TABLE_NAME` – DynamoDB table where bucket status is stored. Primary key: `bucket` (string).
- `SNS_TOPIC_ARN` – SNS topic ARN to publish alerts to.

## Behaviour

1. Lists all buckets using `ListBuckets`.
2. For each bucket, checks `GetPublicAccessBlock`, `GetBucketAcl`, and `GetBucketPolicy`.
3. Determines if the bucket is public.
4. Looks up the previous status in DynamoDB. If a bucket is newly public, an alert is published.
5. Persists the current status with a timestamp back to DynamoDB.

This function is designed to run on a schedule, e.g. via an EventBridge cron rule.
