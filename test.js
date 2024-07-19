import { stdout, stderr } from "node:process";
import autocannon, { printResult } from "autocannon";

function print(result) {
  const printedResult = printResult(result);
  stdout.write(printedResult);
  return printedResult;
}

const urls = [
  "http://localhost:8787/supabasejs",
  "http://localhost:8787/drizzle",
  "http://localhost:3000/supabasejs",
  "http://localhost:3000/drizzle",
];

async function loadTest(url) {
  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url,
        connections: 100,
        pipelining: 100,
        duration: 60,
      },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          const printedResult = print(result);
          resolve({ result, printedResult, responseCounts });
        }
      }
    );

    let completedRequests = 0;
    const responseCounts = {
      "2xx": 0,
      "3xx": 0,
      "4xx": 0,
      "5xx": 0,
      other: 0,
    };

    instance.on("response", (client, statusCode) => {
      completedRequests += 1;
      if (statusCode >= 200 && statusCode < 300) {
        responseCounts["2xx"] += 1;
      } else if (statusCode >= 300 && statusCode < 400) {
        responseCounts["3xx"] += 1;
      } else if (statusCode >= 400 && statusCode < 500) {
        responseCounts["4xx"] += 1;
      } else if (statusCode >= 500 && statusCode < 600) {
        responseCounts["5xx"] += 1;
      } else {
        responseCounts.other += 1;
      }

      console.log(`Completed Requests for ${url}: ${completedRequests}`);
      console.log(
        `2xx: ${responseCounts["2xx"]}, 3xx: ${responseCounts["3xx"]}, 4xx: ${responseCounts["4xx"]}, 5xx: ${responseCounts["5xx"]}, other: ${responseCounts.other}`
      );
    });
  });
}

async function runTests() {
  const results = [];
  for (const url of urls) {
    console.log(`Running load test for ${url}`);
    try {
      const result = await loadTest(url);
      results.push(result);
      console.log(`Completed load test for ${url}\n`);
    } catch (error) {
      stderr.write(`Error during load test for ${url}: ${error.message}\n`);
    }
  }
  summarizeResults(results);
}

function summarizeResults(results) {
  console.log("\nSummary of Results:\n");
  results.forEach(({ result, printedResult, responseCounts }) => {
    console.log(`Results for ${result.url}:`);
    console.log(printedResult);
    console.log(`Response Codes Summary for ${result.url}:`);
    console.log(
      `2xx: ${responseCounts["2xx"]}, 3xx: ${responseCounts["3xx"]}, 4xx: ${responseCounts["4xx"]}, 5xx: ${responseCounts["5xx"]}, other: ${responseCounts.other}`
    );
    console.log("\n");
  });
}

runTests().catch(console.error);
