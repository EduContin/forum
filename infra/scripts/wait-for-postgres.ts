const { exec } = require("child_process");

// Command to be executed
const command = "docker exec postgres-dev pg_isready --host localhost";

// Sleeps for 1 second
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
sleep(1000);

function checkPostgres() {
  exec(command, (error, stdout, stderr) => {
    if (stderr) {
      process.stdout.write(`.`);
      checkPostgres();
      return;
    }

    process.stdout.write("\n✅ Postgres is ready\n");
  });
}

process.stdout.write("\n\n🔴 Waiting for Postgres to be ready");
checkPostgres();
