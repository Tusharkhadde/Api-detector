export function genCurl(baseUrl: string, apiKey: string, model?: string) {
  const key = apiKey || "YOUR_API_KEY";
  return `curl "${baseUrl.replace(/\/+$/, "")}/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${key}" \\
  -d '{
    "model": "${model || "gpt-3.5-turbo"}",
    "messages": [{ "role": "user", "content": "Hello!" }]
  }'`;
}

export function genFetch(baseUrl: string, apiKey: string, model?: string) {
  const key = apiKey || "YOUR_API_KEY";
  return `const response = await fetch("${baseUrl.replace(/\/+$/, "")}/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${key}",
  },
  body: JSON.stringify({
    model: "${model || "gpt-3.5-turbo"}",
    messages: [{ role: "user", content: "Hello!" }],
  }),
});

const data = await response.json();
console.log(data);`;
}

export function genAxios(baseUrl: string, apiKey: string, model?: string) {
  const key = apiKey || "YOUR_API_KEY";
  return `import axios from "axios";

const { data } = await axios.post(
  "${baseUrl.replace(/\/+$/, "")}/chat/completions",
  {
    model: "${model || "gpt-3.5-turbo"}",
    messages: [{ role: "user", content: "Hello!" }],
  },
  {
    headers: {
      Authorization: "Bearer ${key}",
      "Content-Type": "application/json",
    },
  }
);

console.log(data);`;
}

export function genPython(baseUrl: string, apiKey: string, model?: string) {
  const key = apiKey || "YOUR_API_KEY";
  return `import requests

response = requests.post(
    "${baseUrl.replace(/\/+$/, "")}/chat/completions",
    headers={
        "Authorization": "Bearer ${key}",
        "Content-Type": "application/json",
    },
    json={
        "model": "${model || "gpt-3.5-turbo"}",
        "messages": [{"role": "user", "content": "Hello!"}],
    },
)

print(response.json())`;
}
