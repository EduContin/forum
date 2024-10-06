const { exec } = require("child_process");

// Command to be executed
const command = "docker exec postgres-dev pg_isready --host localhost";

// Sleeps for 1 second
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
sleep(1000);

function checkPostgres(): void {
  exec(command, (error: Error | null, stdout: string) => {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgres();
      return;
    }

    process.stdout.write("\n✅ Postgres is ready\n");
  });
}

process.stdout.write("\n\n🔴 Waiting for Postgres to be ready");
checkPostgres();
