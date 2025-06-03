import * as csv from "csv";
import { Web1Account } from "./web1-models";
import { read_server_env } from "@lib/server-env";

export class Web1Client {
  private csvPath?: string;
  constructor() {
    const serverEnv = read_server_env();
    this.csvPath = serverEnv.web1DataPath;
  }

  public async listAccounts(): Promise<Web1Account[]> {
    // If we're on the server side and have a CSV path, read directly
    if (typeof window === "undefined" && this.csvPath) {
      const fs = await import("fs");
      const fileContent = await fs.promises.readFile(this.csvPath, "utf-8");
      const accounts = await new Promise((resolve, reject) => {
        csv.parse(fileContent, { columns: true }, (err, data) => {
          if (err) reject(err);
          resolve(data);
        });
      });
      return this.parseAccounts(accounts as []);
    }

    // If we're in the browser, fetch from the API endpoint
    const response = await fetch("/api/web1/accounts");
    if (!response.ok) {
      throw new Error("Failed to fetch WEB1 accounts");
    }
    const accounts = await response.json();
    return accounts;
  }

  private parseAccounts(accounts: []): Web1Account[] {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return accounts.map((account: any) => ({
      item: account.item_id,
      userId: account.user_id,
      country: account.origin_country,
      phoneNumber: account.phone_number,
      password: account.password,
      tfa_password: account["2fa_password"],
    }));
  }
}
