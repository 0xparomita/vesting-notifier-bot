# Vesting Notifier Bot

This repository automates the "Vesting Audit" workflow. It is designed to run on a schedule (e.g., every Monday at 9:00 AM) to keep the treasury team informed of current token liabilities.

## Architecture
1. **Trigger**: GitHub Actions Cron schedule or a local `node-cron` instance.
2. **Fetch**: Connects to the `VestingLens` contract to aggregate data.
3. **Process**: Generates a temporary CSV file using `csv-writer`.
4. **Deliver**: Sends an email with the CSV attached using the **SendGrid API**.

## Configuration
Requires a `SENDGRID_API_KEY` and the `TREASURY_EMAIL` address.
