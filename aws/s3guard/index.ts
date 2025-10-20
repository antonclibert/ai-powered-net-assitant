import { S3Client, ListBucketsCommand, GetPublicAccessBlockCommand, GetBucketAclCommand, GetBucketPolicyCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const s3 = new S3Client({});
const ddb = new DynamoDBClient({});
const sns = new SNSClient({});

const TABLE = process.env.TABLE_NAME!;
const TOPIC = process.env.SNS_TOPIC_ARN!;

interface BucketStatus {
  status: string;
  ts: number;
}

export const handler = async () => {
  const buckets = await s3.send(new ListBucketsCommand({}));
  for (const bucket of buckets.Buckets ?? []) {
    const Bucket = bucket.Name!;
    let status = 'private';

    try {
      const pab = await s3.send(new GetPublicAccessBlockCommand({ Bucket }));
      if (!pab.PublicAccessBlockConfiguration?.BlockPublicAcls ||
          !pab.PublicAccessBlockConfiguration?.RestrictPublicBuckets) {
        status = 'public';
      }
    } catch {
      status = 'public';
    }

    const acl = await s3.send(new GetBucketAclCommand({ Bucket }));
    if (acl.Grants?.some(g => g.Grantee?.URI?.includes('AllUsers') || g.Grantee?.URI?.includes('AuthenticatedUsers'))) {
      status = 'public';
    }

    try {
      const policy = await s3.send(new GetBucketPolicyCommand({ Bucket }));
      if (/\"Effect\":\s*\"Allow\"/.test(policy.Policy || '')) {
        status = 'public';
      }
    } catch {}

    const prev = await ddb.send(new GetItemCommand({
      TableName: TABLE,
      Key: { bucket: { S: Bucket } }
    }));
    const prevStatus = prev.Item?.status?.S;
    if (status === 'public' && prevStatus !== 'public') {
      await sns.send(new PublishCommand({
        TopicArn: TOPIC,
        Message: `Bucket ${Bucket} became public`
      }));
    }
    const item: Record<string, any> = {
      bucket: { S: Bucket },
      status: { S: status },
      ts: { N: Date.now().toString() }
    };
    await ddb.send(new PutItemCommand({ TableName: TABLE, Item: item }));
  }
};
