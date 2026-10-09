# AWS backend deployment (WhatsApp Web)

For the current `whatsapp-web.js` backend, use a small always-on EC2 Linux instance with Docker and persistent EBS storage. Serverless functions do not preserve the running WhatsApp browser session. Keep the frontend on Vercel if it is already deployed; set its `VITE_BACKEND_URL` to the backend's public HTTPS URL and rebuild it.

## Before deployment

- Create or select an AWS account, choose the **Free account plan** if eligible, and choose a region close to the demo audience. AWS says Free account plans do not incur charges until you upgrade, and end after six months or when credits are exhausted, whichever comes first. Check the AWS Billing page before launching resources.
- Use an Ubuntu 24.04 or Amazon Linux 2023 x86_64 EC2 instance with at least 2 GiB RAM. For accounts created on or after July 15, 2025, AWS lists `t3.small` as Free Tier eligible; older accounts may have different eligibility and may only include smaller instance types. Confirm the exact instance in the account's Free Tier/EC2 console. If the available free instance has less than 2 GiB RAM, it may not run Chromium reliably.
- Attach a persistent EBS volume (8 GiB or more) and mount it at `/srv/callmycar-data`. Verify the volume size/type is covered by the account's current free offer or credits.
- Configure the instance security group to allow the backend port only from the frontend or your demo audience. For a public judge demo, put HTTPS in front of the API with a domain and reverse proxy/load balancer; avoid sending API traffic over public plain HTTP.
- Install Docker Engine and the Docker Compose plugin on the instance.

## Deploy the backend

1. Copy `app/backend` to the instance, excluding `.env`, `.wwebjs_auth`, and `.wwebjs_cache` from source control. Create `app/backend/.env` on the instance with the production Firebase and Telegram settings needed by the app. Add any optional call-provider secrets only if those features are enabled.
2. Ensure the EBS volume is mounted at `/srv/callmycar-data` before starting the container. This path stores the WhatsApp linked-device credentials and browser profile across container rebuilds and instance restarts.
3. From `app/backend`, start the service with:

   ```sh
   docker compose -f docker-compose.aws.yml up -d --build
   ```

4. Check `https://YOUR_API_HOST/health` and `https://YOUR_API_HOST/api/whatsapp-status`.
5. Pair WhatsApp once on the EC2 host. Read the QR from the backend logs (for example, `docker logs -f callmycar-backend`) and scan it in WhatsApp under **Linked devices**. The QR expires; after pairing, the profile on EBS should be reused after restarts. If it asks to pair again, check that the EBS volume is still mounted at `/srv/callmycar-data`.
6. Set `VITE_BACKEND_URL=https://YOUR_API_HOST` in the frontend hosting settings and redeploy the frontend.

## Operational notes

- Do not commit `.env` or WhatsApp profile files. Store production secrets on the instance or in AWS Systems Manager Parameter Store/Secrets Manager.
- Do not terminate the instance or delete the EBS volume if you want to retain the paired WhatsApp session. Take an encrypted EBS snapshot before major changes.
- The compose file publishes port 3001 for a simple demo. For public use, place TLS and access controls in front of it, and restrict the security group accordingly.
- EC2, EBS, public IPv4, and any load balancer/domain resources can incur charges. Check AWS pricing for your chosen region and stop/delete resources after the hackathon if they are no longer needed.
